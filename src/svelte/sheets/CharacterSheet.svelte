<script lang="ts">
  import type { BerserkrActor } from "../../module/documents/actor";

  let { actor, context } = $props<{
    actor: BerserkrActor;
    context: any;
  }>();

  let system = $derived(actor.system as any);
  let weapons = $derived(actor.items.filter(i => i.type === "weapon"));
  let activeTab = $state("violence");

  const tabs = [
    { id: "violence", label: "Violence" },
    { id: "equipment", label: "Equipment" },
    { id: "special", label: "Special" },
    { id: "background", label: "Background" }
  ];

  const updateField = (path: string, value: any) => {
    actor.update({ [path]: value });
  };

  /**
   * Executa a rolagem de ataque de uma arma
   */
  const rollAttack = async (weapon: any) => {
    const isRanged = weapon.system.isRanged;
    const attribute = isRanged ? "guile" : "might";
    const mod = system.abilities[attribute].mod;
    
    // Compatibilidade V12/V13 para Roll e renderTemplate
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

  /**
   * Executa a rolagem de dano de uma arma
   */
  const rollDamage = async (weapon: any) => {
    const damages = weapon.system.damages;
    if (!damages || damages.length === 0) return;

    // Compatibilidade V12/V13
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
</script>

<div class="berserkr-sheet-v2">
  <!-- ====== HEADER ====== -->
  <header class="sheet-header">
    <div class="header-main">
      <!-- Portrait -->
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

      <!-- Character Info -->
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

    <!-- Attributes Horizontal Row -->
    <div class="attributes-row">
      {#each Object.entries(system.abilities) as [key, abl]}
        <div class="attr-item">
          <span class="attr-label">{key.toUpperCase()}</span>
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

  <!-- ====== TABS ====== -->
  <nav class="tabs-bar">
    {#each tabs as tab}
      <button 
        type="button"
        class="tab-btn" 
        class:active={activeTab === tab.id} 
        onclick={() => activeTab = tab.id}
      >
        {tab.label}
      </button>
    {/each}
  </nav>

  <!-- ====== TAB CONTENT ====== -->
  <section class="tab-content">
    {#if activeTab === "violence"}
      <div class="violence-content">
        <div class="combat-stats-grid">
          <div class="combat-stat">
            <span class="stat-label">Defense DR</span>
            <span class="stat-value">{system.derived.defenseDR}</span>
          </div>
          <div class="combat-stat">
            <span class="stat-label">Armor Reduction</span>
            <span class="stat-value">-{system.derived.armorReduction || "0"}</span>
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
      <div class="equipment-placeholder">
        <p>Equipment management coming soon...</p>
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
    min-height: 600px;
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

    .attr-label { 
      font-family: var(--berserkr-font-display, 'Norse', serif); 
      font-size: 1rem; 
      color: var(--berserkr-color-cyan-vibrant);
      letter-spacing: 1px;
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
    min-height: 350px;
    color: var(--berserkr-color-black);
  }

  .combat-stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
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

  .section-title {
    font-family: var(--berserkr-font-display, 'Norse', serif);
    font-size: 1.6rem;
    color: #004D56 !important;
    border-bottom: 2px solid #004D56;
    margin-bottom: 1rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    display: block;
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
