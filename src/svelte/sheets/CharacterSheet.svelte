<script lang="ts">
  import type { BerserkrActor } from "../../module/documents/actor";
  import { tick } from "svelte";

  let { actor, context } = $props<{
    actor: BerserkrActor;
    context: any;
  }>();

  let system = $derived(actor.system as any);
  let weapons = $derived(actor.items.filter(i => i.type === "weapon"));
  let armors = $derived(actor.items.filter(i => i.type === "armor"));
  let runes = $derived(actor.items.filter(i => i.type === "rune"));
  let gear = $derived(actor.items.filter(i => i.type === "gear"));

  let inventoryLimit = $derived(system.abilities.might.mod + 8);
  let currentLoad = $derived(actor.items.reduce((acc, i) => {
    const itemSys = i.system as any;
    return acc + ((itemSys.quantity || 1) * (itemSys.weight || 0));
  }, 0));
  let isOverloaded = $derived(currentLoad > inventoryLimit);

  let activeTab = $state("violence");
  let scrollContainer: HTMLElement;

  const tabs = [
    { id: "violence", label: "Violence" },
    { id: "equipment", label: "Equipment" },
    { id: "special", label: "Special" },
    { id: "background", label: "Background" }
  ];

  // Sincroniza a aba ativa e o scroll após renderizações do Foundry
  $effect(() => {
    if (context?.activeTab) {
      activeTab = context.activeTab;
    }
    
    // Restaura o scroll sempre que o container ou o contexto mudarem
    if (scrollContainer && typeof context?.scrollTop === "number") {
      tick().then(() => {
        scrollContainer.scrollTop = context.scrollTop;
      });
    }
  });

  const setTab = (id: string) => {
    activeTab = id;
    const sheet = (actor as any).sheet;
    if (sheet && typeof sheet.setTab === "function") {
      sheet.setTab(id);
    }
  };

  const updateField = (path: string, value: any) => {
    actor.update({ [path]: value });
  };

  const saveScroll = () => {
    if (scrollContainer) {
      const sheet = (actor as any).sheet;
      if (sheet && typeof sheet.updateScroll === "function") {
        sheet.updateScroll(scrollContainer.scrollTop);
      }
    }
  };

  /**
   * Cria um novo item de um tipo específico diretamente no Ator
   */
  const createItem = async (type: string) => {
    saveScroll();
    const data = {
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type: type,
      img: `icons/svg/item-bag.svg`
    };
    // @ts-ignore
    await actor.createEmbeddedDocuments("Item", [data]);
  };

  const toggleEquip = async (item: any) => {
    saveScroll();
    const isShield = (item.system as any).isShield;
    const isEquipping = !(item.system as any).equipped;

    if (isEquipping) {
      const conflicts = actor.items.filter(i => 
        i.type === "armor" && 
        (i.system as any).isShield === isShield && 
        (i.system as any).equipped &&
        i.id !== item.id
      );

      if (conflicts.length > 0) {
        const updates = conflicts.map(i => ({ _id: i.id, "system.equipped": false }));
        // @ts-ignore
        await actor.updateEmbeddedDocuments("Item", updates);
      }
    }

    await item.update({ "system.equipped": isEquipping });
  };

  const postItemChat = async (item: any) => {
    const itemSys = item.system as any;
    // @ts-ignore
    const render = foundry.applications.handlebars?.renderTemplate ?? renderTemplate;
    // @ts-ignore
    const ChatMessageClass = foundry.documents?.BaseChatMessage ?? ChatMessage;

    const templateData = {
      actorId: actor.id,
      itemId: item.id,
      itemName: item.name,
      itemImg: item.img,
      system: itemSys,
      hasQuantity: typeof itemSys.quantity !== "undefined",
      hasWeight: typeof itemSys.weight !== "undefined",
      hasCost: typeof itemSys.cost !== "undefined",
      hasUses: itemSys.uses && (itemSys.uses.max > 0)
    };

    const content = await render("systems/berserkr/templates/chat/item-card.hbs", templateData);

    // @ts-ignore
    ChatMessageClass.create({
      user: (game as any).user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      content: content,
      style: (CONST as any).CHAT_MESSAGE_STYLES?.OTHER ?? (CONST as any).CHAT_MESSAGE_TYPES?.OTHER
    });
  };

  const rollAttribute = async (attributeName: string) => {
    const mod = system.abilities[attributeName].mod;
    let penalty = 0;
    let penaltySource = "";

    if (attributeName === "swift") {
      penalty = system.derived.swiftPenalty;
      penaltySource = "Armor/Overload";
    } else if (attributeName === "might") {
      penalty = system.derived.mightPenalty;
      penaltySource = "Overload";
    }

    // @ts-ignore
    const RollClass = foundry.dice?.Roll ?? Roll;
    // @ts-ignore
    const render = foundry.applications.handlebars?.renderTemplate ?? renderTemplate;
    // @ts-ignore
    const ChatMessageClass = foundry.documents?.BaseChatMessage ?? ChatMessage;

    const formula = `1d20 + ${mod}`;
    const roll = new RollClass(formula);
    await roll.evaluate();

    const d20 = roll.terms[0].results[0].result;
    const isCrit = d20 === 20;
    const isFumble = d20 === 1;

    let flavor = `Test: ${attributeName.toUpperCase()}`;
    if (penalty > 0) flavor += ` (+${penalty} DR from ${penaltySource})`;

    const templateData = {
      actorId: actor.id,
      title: "Attribute Test",
      total: roll.total,
      formula: roll.formula,
      tooltip: await roll.getTooltip(),
      flavor: flavor,
      isCrit,
      isFumble
    };

    const content = await render("systems/berserkr/templates/chat/test-card.hbs", templateData);

    // @ts-ignore
    ChatMessageClass.create({
      user: (game as any).user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      content: content,
      rolls: [roll],
      style: (CONST as any).CHAT_MESSAGE_STYLES?.OTHER ?? (CONST as any).CHAT_MESSAGE_TYPES?.OTHER
    });
  };

  const rollAttack = async (weapon: any) => {
    const isRanged = weapon.system.isRanged;
    const attribute = isRanged ? "guile" : "might";
    const mod = system.abilities[attribute].mod;
    
    // @ts-ignore
    const RollClass = foundry.dice?.Roll ?? Roll;
    // @ts-ignore
    const render = foundry.applications.handlebars?.renderTemplate ?? renderTemplate;
    // @ts-ignore
    const ChatMessageClass = foundry.documents?.BaseChatMessage ?? ChatMessage;

    const roll = new RollClass(`1d20 + ${mod}`);
    await roll.evaluate();

    const d20 = roll.terms[0].results[0].result;
    const isCrit = d20 === 20;
    const isFumble = d20 === 1;

    const templateData = {
      actorId: actor.id,
      itemId: weapon.id,
      title: weapon.name,
      itemImg: weapon.img,
      total: roll.total,
      formula: roll.formula,
      tooltip: await roll.getTooltip(),
      flavor: `Attack (${attribute})`,
      isCrit,
      isFumble
    };

    const content = await render("systems/berserkr/templates/chat/test-card.hbs", templateData);

    // @ts-ignore
    ChatMessageClass.create({
      user: (game as any).user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      content: content,
      rolls: [roll],
      style: (CONST as any).CHAT_MESSAGE_STYLES?.OTHER ?? (CONST as any).CHAT_MESSAGE_TYPES?.OTHER
    });
  };

  const rollDamage = async (weapon: any) => {
    const damages = weapon.system.damages;
    if (!damages || damages.length === 0) return;

    // @ts-ignore
    const RollClass = foundry.dice?.Roll ?? Roll;
    // @ts-ignore
    const render = foundry.applications.handlebars?.renderTemplate ?? renderTemplate;
    // @ts-ignore
    const ChatMessageClass = foundry.documents?.BaseChatMessage ?? ChatMessage;

    const rollsData = [];
    let totalDamage = 0;

    for (let dmg of damages) {
      const formula = `${dmg.dieCount}${dmg.dieType}${dmg.modifier ? (dmg.modifier > 0 ? "+" + dmg.modifier : dmg.modifier) : ""}`;
      const roll = new RollClass(formula);
      await roll.evaluate();
      
      totalDamage += roll.total;
      
      rollsData.push({
        formula: formula,
        total: roll.total,
        type: dmg.type,
        tooltip: await roll.getTooltip(),
        roll: roll
      });
    }

    const templateData = {
      actorId: actor.id,
      itemId: weapon.id,
      itemName: weapon.name,
      itemImg: weapon.img,
      totalDamage: totalDamage,
      rolls: rollsData
    };

    const content = await render("systems/berserkr/templates/chat/damage-card.hbs", templateData);

    // @ts-ignore
    ChatMessageClass.create({
      user: (game as any).user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      content: content,
      rolls: rollsData.map(r => r.roll),
      style: (CONST as any).CHAT_MESSAGE_STYLES?.OTHER ?? (CONST as any).CHAT_MESSAGE_TYPES?.OTHER
    });
  };

  const updateRuneUses = async (item: any, delta: number) => {
    saveScroll();
    const uses = (item.system as any).uses;
    const newVal = Math.clamp(uses.value + delta, 0, uses.max);
    await item.update({ "system.uses.value": newVal });
  };
</script>

<div class="berserkr-sheet-v2">
  <header class="sheet-header">
    <div class="header-main">
      <div class="portrait-area">
        <button 
          type="button"
          class="portrait-container" 
          onclick={() => (actor as any).sheet.editImage()}
          title="Change Image"
        >
          <img src={actor.img} alt={actor.name} />
        </button>
      </div>

      <div class="char-info">
        <input 
          type="text" 
          class="char-name-input" 
          value={actor.name} 
          onchange={(e) => updateField("name", e.currentTarget.value)}
          placeholder="Character Name"
          aria-label="Character Name"
        >

        <div class="char-class-row">
          <label for="{actor.id}-class">Class:</label>
          <input 
            id="{actor.id}-class"
            type="text" 
            class="char-class-input" 
            value={system.class} 
            onchange={(e) => updateField("system.class", e.currentTarget.value)}
            placeholder="Enter class..."
          >
        </div>

        <div class="stats-grid">
          <div class="stat-field">
            <label for="{actor.id}-hp-val">HP:</label>
            <input id="{actor.id}-hp-val" type="number" class="stat-input" value={system.hp.value} onchange={(e) => updateField("system.hp.value", parseInt(e.currentTarget.value))}>
            <span class="stat-separator">/</span>
            <input aria-label="Max HP" type="number" class="stat-input" value={system.hp.max} onchange={(e) => updateField("system.hp.max", parseInt(e.currentTarget.value))}>
          </div>
          <div class="stat-field">
            <label for="{actor.id}-fates">Fates:</label>
            <input id="{actor.id}-fates" type="number" class="stat-input" value={system.fates.value} onchange={(e) => updateField("system.fates.value", parseInt(e.currentTarget.value))}>
          </div>
          <div class="stat-field">
            <label for="{actor.id}-silver">Silver:</label>
            <input id="{actor.id}-silver" type="number" class="stat-input" value={system.silver} onchange={(e) => updateField("system.silver", parseInt(e.currentTarget.value))}>
          </div>
        </div>

        <div class="action-buttons">
          <button class="btn" type="button" onclick={() => console.log("Broken")}>BROKEN</button>
          <button class="btn" type="button" onclick={() => console.log("Rest")}>REST</button>
          <button class="btn" type="button" onclick={() => console.log("Better")}>GET BETTER</button>
        </div>
      </div>
    </div>

    <div class="attributes-row">
      {#each Object.entries(system.abilities) as [key, abl]}
        <div class="attr-item">
          <button 
            type="button" 
            class="attr-label-btn" 
            onclick={() => rollAttribute(key)}
            title="Roll {key} Test"
          >
            {key.toUpperCase()}
          </button>
          <div class="attr-values">
            <input 
              aria-label={key}
              type="number" 
              class="attr-value-input" 
              value={(abl as any).value} 
              onchange={(e) => updateField(`system.abilities.${key}.value`, parseInt(e.currentTarget.value))}
            >
            <span class="attr-mod">{(abl as any).mod >= 0 ? "+" : ""}{(abl as any).mod}</span>
          </div>
        </div>
      {/each}
    </div>
  </header>

  <nav class="tabs-bar">
    {#each tabs as tab}
      <button 
        type="button"
        class="tab-btn" 
        class:active={activeTab === tab.id} 
        onclick={() => setTab(tab.id)}
      >
        {tab.label}
      </button>
    {/each}
  </nav>

  <section class="tab-content" bind:this={scrollContainer} onscroll={saveScroll}>
    {#if activeTab === "violence"}
      <div class="violence-content">
        <div class="combat-stats-grid">
          <div class="combat-stat">
            <span class="stat-label">Defense DR</span>
            <span class="stat-value">{system.derived.defenseDR}</span>
          </div>
          <div class="combat-stat">
            <span class="stat-label">Armor Reduction</span>
            <span class="stat-value">{system.derived.armorReduction !== "0" ? "-" : ""}{system.derived.armorReduction}</span>
          </div>
          <div class="combat-stat">
            <span class="stat-label">Might Penalty</span>
            <span class="stat-value" class:penalty={system.derived.mightPenalty > 0}>
              +{system.derived.mightPenalty} DR
            </span>
          </div>
          <div class="combat-stat">
            <span class="stat-label">Swift Penalty</span>
            <span class="stat-value" class:penalty={system.derived.swiftPenalty > 0}>
              +{system.derived.swiftPenalty} DR
            </span>
          </div>
        </div>

        <div class="weapon-section">
          <h3 class="section-title">Weapons</h3>
          <div class="weapons-list">
            {#each weapons as weapon (weapon.id)}
              <div class="weapon-card">
                <button type="button" class="weapon-img" onclick={() => weapon.sheet.render(true)}>
                  <img src={weapon.img} alt={weapon.name} />
                </button>
                <div class="weapon-details">
                  <div class="weapon-name">{weapon.name}</div>
                  <div class="weapon-damage">
                    {#each (weapon.system as any).damages as dmg}
                      <span class="dmg-tag">{dmg.dieCount}{dmg.dieType}{dmg.modifier ? (dmg.modifier > 0 ? "+" + dmg.modifier : dmg.modifier) : ""} {dmg.type}</span>
                    {/each}
                  </div>
                </div>
                <div class="roll-buttons">
                  <button type="button" class="roll-btn attack" onclick={() => rollAttack(weapon)} title="Roll Attack">
                    <i class="fas fa-dice-d20"></i>
                  </button>
                  <button type="button" class="roll-btn damage" onclick={() => rollDamage(weapon)} title="Roll Damage">
                    <i class="fas fa-fire"></i>
                  </button>
                </div>
              </div>
            {/each}
            {#if weapons.length === 0}
              <p class="placeholder-text">No weapons equipped.</p>
            {/if}
          </div>
        </div>
      </div>
    {:else if activeTab === "equipment"}
      <div class="equipment-content">
        <div class="inventory-header">
          <div class="load-tracker" class:overloaded={isOverloaded}>
            <span class="label">Carrying</span>
            <span class="value">{currentLoad.toFixed(2)} / {inventoryLimit}</span>
            {#if isOverloaded}
              <div class="overload-alert">OVERLOADED: DR+2 on Might/Swift Tests</div>
            {/if}
          </div>
        </div>

        <!-- Armas -->
        <div class="inventory-section">
          <div class="section-header">
            <h3 class="section-title">Weapons</h3>
            <button type="button" class="add-item-btn" onclick={() => createItem("weapon")} aria-label="Add Weapon" title="Add Weapon">
              <i class="fas fa-plus-circle"></i>
            </button>
          </div>
          <div class="item-list">
            {#each weapons as item (item.id)}
              <div class="item-row">
                <img src={item.img} alt={item.name} width="24" height="24"/>
                <span class="item-name">{item.name}</span>
                <span class="item-qty">x{(item.system as any).quantity}</span>
                <div class="item-controls">
                  <button type="button" class="icon-btn" onclick={() => postItemChat(item)} aria-label="Send to Chat" title="Send to Chat">
                    <i class="fas fa-comment-dots"></i>
                  </button>
                  <button type="button" class="icon-btn" onclick={() => item.sheet.render(true)} aria-label="Edit" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button type="button" class="icon-btn delete" onclick={() => item.delete()} aria-label="Delete" title="Delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Armaduras -->
        <div class="inventory-section">
          <div class="section-header">
            <h3 class="section-title">Armor</h3>
            <button type="button" class="add-item-btn" onclick={() => createItem("armor")} aria-label="Add Armor" title="Add Armor">
              <i class="fas fa-plus-circle"></i>
            </button>
          </div>
          <div class="item-list">
            {#each armors as item (item.id)}
              <div class="item-row" class:equipped={(item.system as any).equipped}>
                <button 
                  type="button" 
                  class="equip-toggle-btn" 
                  class:active={(item.system as any).equipped}
                  onclick={() => toggleEquip(item)}
                  aria-label={(item.system as any).equipped ? "Unequip" : "Equip"}
                  title={(item.system as any).equipped ? "Unequip" : "Equip"}
                >
                  <i class="fas fa-shield-alt"></i>
                </button>
                <img src={item.img} alt={item.name} width="24" height="24"/>
                <span class="item-name">{item.name}</span>
                <span class="item-status">{(item.system as any).equipped ? "Equipped" : ""}</span>
                <div class="item-controls">
                  <button type="button" class="icon-btn" onclick={() => postItemChat(item)} aria-label="Send to Chat" title="Send to Chat">
                    <i class="fas fa-comment-dots"></i>
                  </button>
                  <button type="button" class="icon-btn" onclick={() => item.sheet.render(true)} aria-label="Edit" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button type="button" class="icon-btn delete" onclick={() => item.delete()} aria-label="Delete" title="Delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Runas -->
        <div class="inventory-section">
          <div class="section-header">
            <h3 class="section-title">Runes</h3>
            <button type="button" class="add-item-btn" onclick={() => createItem("rune")} aria-label="Add Rune" title="Add Rune">
              <i class="fas fa-plus-circle"></i>
            </button>
          </div>
          <div class="item-list">
            {#each runes as item (item.id)}
              <div class="item-row">
                <img src={item.img} alt={item.name} width="24" height="24"/>
                <span class="item-name">{item.name}</span>
                <div class="rune-uses-control">
                  <button type="button" class="use-btn" onclick={() => updateRuneUses(item, -1)} disabled={(item.system as any).uses.value <= 0} aria-label="Decrease Uses" title="Decrease Uses">
                    <i class="fas fa-minus"></i>
                  </button>
                  <span class="use-val">{(item.system as any).uses.value}/{(item.system as any).uses.max}</span>
                  <button type="button" class="use-btn" onclick={() => updateRuneUses(item, 1)} disabled={(item.system as any).uses.value >= (item.system as any).uses.max} aria-label="Increase Uses" title="Increase Uses">
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
                <div class="item-controls">
                  <button type="button" class="icon-btn" onclick={() => postItemChat(item)} aria-label="Send to Chat" title="Send to Chat">
                    <i class="fas fa-comment-dots"></i>
                  </button>
                  <button type="button" class="icon-btn" onclick={() => item.sheet.render(true)} aria-label="Edit" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button type="button" class="icon-btn delete" onclick={() => item.delete()} aria-label="Delete" title="Delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Equipamento Geral -->
        <div class="inventory-section">
          <div class="section-header">
            <h3 class="section-title">Gear</h3>
            <button type="button" class="add-item-btn" onclick={() => createItem("gear")} aria-label="Add Gear" title="Add Gear">
              <i class="fas fa-plus-circle"></i>
            </button>
          </div>
          <div class="item-list">
            {#each gear as item (item.id)}
              <div class="item-row">
                <img src={item.img} alt={item.name} width="24" height="24"/>
                <span class="item-name">{item.name}</span>
                <span class="item-qty">x{(item.system as any).quantity}</span>
                <div class="item-controls">
                  <button type="button" class="icon-btn" onclick={() => postItemChat(item)} aria-label="Send to Chat" title="Send to Chat">
                    <i class="fas fa-comment-dots"></i>
                  </button>
                  <button type="button" class="icon-btn" onclick={() => item.sheet.render(true)} aria-label="Edit" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button type="button" class="icon-btn delete" onclick={() => item.delete()} aria-label="Delete" title="Delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {:else if activeTab === "special"}
      <div class="special-placeholder">
        <p>Special abilities coming soon...</p>
      </div>
    {:else if activeTab === "background"}
      <textarea 
        class="background-textarea" 
        placeholder="Character background, description, history..."
        value={system.background}
        onchange={(e) => updateField("system.background", e.currentTarget.value)}
        aria-label="Character Background"
      ></textarea>
    {/if}
  </section>
</div>

<style lang="scss">
  .berserkr-sheet-v2 {
    display: flex;
    flex-direction: column;
    background: var(--berserkr-color-cyan-light);
    color: var(--berserkr-color-black);
    font-family: var(--berserkr-font-text, 'Alegreya', serif);
    height: 100%;
    overflow: hidden;
    border: 3px solid var(--berserkr-color-black);
    box-shadow: 0 0 20px rgba(0,0,0,0.2);
  }

  .sheet-header {
    background: var(--berserkr-color-cyan-medium);
    padding: 1rem;
    color: var(--berserkr-color-white);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    flex-shrink: 0;
  }

  .header-main {
    display: flex;
    gap: 1.5rem;
  }

  .portrait-container {
    width: 120px;
    height: 140px;
    background: rgba(0,0,0,0.2);
    border: 2px solid var(--berserkr-color-cyan-vibrant);
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    padding: 0;
    margin: 0;
    display: block;
    img { width: 100%; height: 100%; object-fit: cover; }
  }

  .char-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .char-name-input {
    font-family: var(--berserkr-font-display, 'Norse', serif);
    font-size: 2.2rem;
    color: var(--berserkr-color-cyan-vibrant);
    background: transparent;
    border: none;
    border-bottom: 2px solid var(--berserkr-color-cyan-vibrant);
    outline: none;
    width: 100%;
  }

  .char-class-row {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    label { 
      font-family: var(--berserkr-font-display, 'Norse', serif); 
      font-size: 1.4rem; 
      color: var(--berserkr-color-cyan-vibrant);
    }
    input { 
      background: transparent; 
      border: none; 
      border-bottom: 1px solid var(--berserkr-color-cyan-vibrant); 
      color: var(--berserkr-color-white); 
      flex: 1; 
      outline: none; 
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .stat-field {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    label { 
      font-family: var(--berserkr-font-display, 'Norse', serif); 
      color: var(--berserkr-color-cyan-vibrant); 
      font-size: 1.4rem; 
    }
    input { 
      width: 50px;
      background: transparent; 
      border: none; 
      border-bottom: 2px solid var(--berserkr-color-cyan-vibrant); 
      color: var(--berserkr-color-white); 
      text-align: center; 
      outline: none;
      font-size: 1.4rem;
      font-weight: bold;
    }
    .stat-separator {
      font-size: 1.2rem;
      color: var(--berserkr-color-cyan-vibrant);
    }
  }

  .action-buttons {
    display: flex;
    gap: 0.8rem;
    margin-top: 0.5rem;
  }

  .btn {
    font-size: 0.7rem;
    font-weight: bold;
    padding: 6px 12px;
    background: transparent;
    border: 1px solid var(--berserkr-color-cyan-light);
    color: var(--berserkr-color-cyan-light);
    cursor: pointer;
    text-transform: uppercase;
    &:hover { 
      border-color: var(--berserkr-color-cyan-vibrant); 
      color: var(--berserkr-color-white); 
      background: rgba(0,229,255,0.1); 
    }
  }

  .attributes-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
    padding: 0.8rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    border: 1px solid var(--berserkr-color-cyan-vibrant);
  }

  .attr-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    .attr-label-btn { 
      font-family: var(--berserkr-font-display, 'Norse', serif); 
      font-size: 1rem; 
      color: var(--berserkr-color-cyan-vibrant);
      letter-spacing: 1px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
      transition: all 0.2s;
      &:hover { color: #fff; text-shadow: 0 0 8px var(--berserkr-color-cyan-vibrant); }
    }

    .attr-values {
      display: flex;
      align-items: center;
      gap: 8px;

      input { 
        width: 35px; 
        background: transparent; 
        border: none; 
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        color: var(--berserkr-color-white); 
        text-align: center; 
        font-weight: bold; 
        outline: none;
        font-size: 1.1rem;
        &:focus { border-color: var(--berserkr-color-cyan-vibrant); }
      }

      .attr-mod { 
        color: var(--berserkr-color-white); 
        font-weight: 900; 
        font-size: 1.2rem;
        text-shadow: 0 0 8px var(--berserkr-color-cyan-vibrant);
      }
    }
  }

  .tabs-bar {
    display: flex;
    background: var(--berserkr-bg-secondary);
    border-bottom: 2px solid var(--berserkr-color-cyan-medium);
    flex-shrink: 0;
  }

  .tab-btn {
    flex: 1;
    font-family: var(--berserkr-font-display, 'Norse', serif);
    font-size: 1.2rem;
    padding: 10px;
    border: none;
    background: transparent;
    color: var(--berserkr-color-cyan-medium);
    cursor: pointer;
    &:hover { color: var(--berserkr-color-black); }
    &.active { 
      background: var(--berserkr-bg-card); 
      border-bottom: 3px solid var(--berserkr-color-cyan-medium);
      color: var(--berserkr-color-black);
    }
  }

  .tab-content {
    flex: 1;
    padding: 1.5rem;
    background: var(--berserkr-bg-card);
    overflow-y: auto;
    color: var(--berserkr-color-black);
    min-height: 350px;
    max-height: 500px;
  }

  .combat-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .combat-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .load-tracker {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--berserkr-color-cyan-medium);
    color: #fff;
    padding: 0.8rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    
    &.overloaded {
      background: #d00;
      animation: pulse 2s infinite;
    }

    .label { font-family: var(--berserkr-font-display); text-transform: uppercase; font-size: 0.9rem; }
    .value { font-size: 1.6rem; font-weight: bold; }
    .overload-alert { font-size: 0.75rem; font-weight: bold; margin-top: 4px; }
  }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(200, 0, 0, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(200, 0, 0, 0); }
    100% { box-shadow: 0 0 0 0 rgba(200, 0, 0, 0); }
  }

  .inventory-section {
    margin-bottom: 1.5rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #004D56;
    margin-bottom: 1rem;
  }

  .section-title {
    font-family: var(--berserkr-font-display, 'Norse', serif);
    font-size: 1.6rem;
    color: #004D56 !important;
    margin: 0;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .add-item-btn {
    background: transparent;
    border: none;
    color: #004D56;
    font-size: 1.4rem;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    transition: all 0.2s;
    &:hover { color: var(--berserkr-color-cyan-vibrant); transform: scale(1.1); }
  }

  .item-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .item-row {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    background: rgba(255, 255, 255, 0.4);
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.05);

    img { border-radius: 2px; border: 1px solid #ccc; }
    .item-name { flex: 1; font-weight: 500; }
    .item-qty, .item-status { font-size: 0.85rem; color: #666; font-style: italic; }
    
    &.equipped { 
      background: var(--berserkr-color-cyan-medium); 
      border-color: var(--berserkr-color-cyan-vibrant);
      color: var(--berserkr-color-white);
      .item-name { text-shadow: 0 0 8px var(--berserkr-color-cyan-vibrant); }
      .item-status { color: var(--berserkr-color-cyan-vibrant); font-weight: bold; }
    }

    .item-controls {
      display: flex;
      gap: 4px;
    }
  }

  .equip-toggle-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    color: #888;
    font-size: 1rem;
    padding: 0 4px;
    transition: all 0.2s;
    &:hover { color: var(--berserkr-color-cyan-medium); }
    &.active { color: var(--berserkr-color-cyan-vibrant); filter: drop-shadow(0 0 5px var(--berserkr-color-cyan-vibrant)); }
  }

  .icon-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    color: inherit;
    padding: 4px;
    font-size: 0.9rem;
    &:hover { color: var(--berserkr-color-cyan-vibrant); }
    &.delete:hover { color: #f55; }
  }

  .stat-label {
    font-family: var(--berserkr-font-display, 'Norse', serif);
    font-size: 1.1rem;
    color: var(--berserkr-color-cyan-medium);
  }

  .stat-value {
    font-family: var(--berserkr-font-display, 'Norse', serif);
    font-size: 1.8rem;
    font-weight: bold;
    color: var(--berserkr-color-black);
  }

  .penalty {
    color: #d00 !important;
    text-shadow: 0 0 5px rgba(200, 0, 0, 0.2);
  }

  .weapon-section {
    margin-top: 1rem;
  }

  .weapons-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .weapon-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.4);
    padding: 0.6rem;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.1);

    .weapon-img {
      width: 40px;
      height: 40px;
      background: #122525;
      border: 1px solid var(--berserkr-color-cyan-medium);
      border-radius: 4px;
      padding: 0;
      cursor: pointer;
      img { width: 100%; height: 100%; object-fit: cover; }
    }

    .weapon-details {
      flex: 1;
      .weapon-name { font-weight: bold; font-size: 1.1rem; }
      .weapon-damage { 
        display: flex; 
        flex-wrap: wrap; 
        gap: 4px; 
        .dmg-tag { 
          font-size: 0.75rem; 
          background: var(--berserkr-color-cyan-medium); 
          color: #fff; 
          padding: 1px 6px; 
          border-radius: 10px; 
        }
      }
    }

    .roll-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .roll-btn {
      background: transparent;
      border: 2px solid var(--berserkr-color-cyan-medium);
      color: var(--berserkr-color-cyan-medium);
      width: 34px;
      height: 34px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      
      &:hover { background: var(--berserkr-color-cyan-medium); color: #fff; }
      &.damage { border-color: #d00; color: #d00; &:hover { background: #d00; color: #fff; } }
    }
  }

  .rune-uses-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(0, 0, 0, 0.05);
    padding: 2px 8px;
    border-radius: 10px;
    margin-right: 0.5rem;

    .use-val { font-size: 0.85rem; font-weight: bold; min-width: 35px; text-align: center; color: var(--berserkr-color-cyan-medium); }
    
    .use-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      color: #666;
      font-size: 0.75rem;
      padding: 2px;
      &:hover:not(:disabled) { color: var(--berserkr-color-cyan-vibrant); }
      &:disabled { opacity: 0.3; cursor: not-allowed; }
    }
  }

  .background-textarea {
    width: 100%;
    height: 300px;
    background: rgba(255,255,255,0.4);
    border: 2px solid rgba(0,0,0,0.15);
    padding: 1rem;
    outline: none;
    font-family: inherit;
    line-height: 1.8;
    color: var(--berserkr-color-black);
  }
</style>
