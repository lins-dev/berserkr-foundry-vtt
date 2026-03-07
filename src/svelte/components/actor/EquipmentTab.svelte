<script lang="ts">
  import type { BerserkrActor } from "../../../module/documents/actor";

  let { 
    actor, 
    weapons, 
    armors, 
    runes, 
    gear, 
    currentLoad, 
    inventoryLimit, 
    isOverloaded,
    saveScroll
  } = $props<{
    actor: BerserkrActor;
    weapons: any[];
    armors: any[];
    runes: any[];
    gear: any[];
    currentLoad: number;
    inventoryLimit: number;
    isOverloaded: boolean;
    saveScroll: () => void;
  }>();

  /**
   * Cria um novo item diretamente no Ator
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

  /**
   * Alterna estado de equipado com exclusividade
   */
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

  /**
   * Envia card do item ao chat
   */
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

  /**
   * Atualiza usos de runa
   */
  const updateRuneUses = async (item: any, delta: number) => {
    saveScroll();
    const uses = (item.system as any).uses;
    const newVal = Math.clamp(uses.value + delta, 0, uses.max);
    await item.update({ "system.uses.value": newVal });
  };
</script>

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

  <!-- Weapons -->
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
            <button type="button" class="icon-btn" onclick={() => postItemChat(item)} aria-label="Send to Chat" title="Send to Chat"><i class="fas fa-comment-dots"></i></button>
            <button type="button" class="icon-btn" onclick={() => item.sheet.render(true)} aria-label="Edit" title="Edit"><i class="fas fa-edit"></i></button>
            <button type="button" class="icon-btn delete" onclick={() => item.delete()} aria-label="Delete" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Armor -->
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
            <button type="button" class="icon-btn" onclick={() => postItemChat(item)} aria-label="Send to Chat" title="Send to Chat"><i class="fas fa-comment-dots"></i></button>
            <button type="button" class="icon-btn" onclick={() => item.sheet.render(true)} aria-label="Edit" title="Edit"><i class="fas fa-edit"></i></button>
            <button type="button" class="icon-btn delete" onclick={() => item.delete()} aria-label="Delete" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Runes -->
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
            <button type="button" class="icon-btn" onclick={() => postItemChat(item)} aria-label="Send to Chat" title="Send to Chat"><i class="fas fa-comment-dots"></i></button>
            <button type="button" class="icon-btn" onclick={() => item.sheet.render(true)} aria-label="Edit" title="Edit"><i class="fas fa-edit"></i></button>
            <button type="button" class="icon-btn delete" onclick={() => item.delete()} aria-label="Delete" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Gear -->
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
            <button type="button" class="icon-btn" onclick={() => postItemChat(item)} aria-label="Send to Chat" title="Send to Chat"><i class="fas fa-comment-dots"></i></button>
            <button type="button" class="icon-btn" onclick={() => item.sheet.render(true)} aria-label="Edit" title="Edit"><i class="fas fa-edit"></i></button>
            <button type="button" class="icon-btn delete" onclick={() => item.delete()} aria-label="Delete" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style lang="scss">
  .load-tracker {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--berserkr-color-cyan-medium);
    color: #fff;
    padding: 0.8rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    &.overloaded { background: #d00; animation: pulse 2s infinite; }
    .label { font-family: var(--berserkr-font-display); text-transform: uppercase; font-size: 0.9rem; }
    .value { font-size: 1.6rem; font-weight: bold; }
    .overload-alert { font-size: 0.75rem; font-weight: bold; margin-top: 4px; }
  }
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(200, 0, 0, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(200, 0, 0, 0); }
    100% { box-shadow: 0 0 0 0 rgba(200, 0, 0, 0); }
  }
  .inventory-section { margin-bottom: 1.5rem; }
  .section-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #004D56; margin-bottom: 1rem; }
  .section-title { font-family: var(--berserkr-font-display, 'Norse', serif); font-size: 1.6rem; color: #004D56 !important; margin: 0; letter-spacing: 2px; text-transform: uppercase; }
  .add-item-btn { background: transparent; border: none; color: #004D56; font-size: 1.4rem; cursor: pointer; padding: 0; display: flex; align-items: center; transition: all 0.2s; &:hover { color: var(--berserkr-color-cyan-vibrant); transform: scale(1.1); } }
  .item-list { display: flex; flex-direction: column; gap: 2px; }
  .item-row {
    display: flex; align-items: center; gap: 0.8rem; background: rgba(255, 255, 255, 0.4); padding: 0.4rem 0.8rem; border-radius: 4px; border: 1px solid rgba(0, 0, 0, 0.05);
    img { border-radius: 2px; border: 1px solid #ccc; }
    .item-name { flex: 1; font-weight: 500; }
    .item-qty, .item-status { font-size: 0.85rem; color: #666; font-style: italic; }
    &.equipped { 
      background: var(--berserkr-color-cyan-medium); border-color: var(--berserkr-color-cyan-vibrant); color: var(--berserkr-color-white);
      .item-name { text-shadow: 0 0 8px var(--berserkr-color-cyan-vibrant); }
      .item-status { color: var(--berserkr-color-cyan-vibrant); font-weight: bold; }
    }
    .item-controls { display: flex; gap: 4px; }
  }
  .equip-toggle-btn { background: transparent; border: none; cursor: pointer; color: #888; font-size: 1rem; padding: 0 4px; transition: all 0.2s; &:hover { color: var(--berserkr-color-cyan-medium); } &.active { color: var(--berserkr-color-cyan-vibrant); filter: drop-shadow(0 0 5px var(--berserkr-color-cyan-vibrant)); } }
  .icon-btn { background: transparent; border: none; cursor: pointer; color: inherit; padding: 4px; font-size: 0.9rem; &:hover { color: var(--berserkr-color-cyan-vibrant); } &.delete:hover { color: #f55; } }
  .rune-uses-control {
    display: flex; align-items: center; gap: 0.5rem; background: rgba(0, 0, 0, 0.05); padding: 2px 8px; border-radius: 10px; margin-right: 0.5rem;
    .use-val { font-size: 0.85rem; font-weight: bold; min-width: 35px; text-align: center; color: var(--berserkr-color-cyan-medium); }
    .use-btn { background: transparent; border: none; cursor: pointer; color: #666; font-size: 0.75rem; padding: 2px; &:hover:not(:disabled) { color: var(--berserkr-color-cyan-vibrant); } &:disabled { opacity: 0.3; cursor: not-allowed; } }
  }
</style>
