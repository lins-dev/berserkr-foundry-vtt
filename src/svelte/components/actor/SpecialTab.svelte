<script lang="ts">
  import type { BerserkrActor } from "../../../module/documents/actor";

  let { actor, system, runes, feats, createItem } = $props<{
    actor: BerserkrActor;
    system: any;
    runes: any[];
    feats: any[];
    createItem: (type: string) => void;
  }>();

  /**
   * Rola os usos diários de runas (d4 + Guile)
   */
  const rollDailyRunes = async () => {
    // @ts-ignore
    const RollClass = foundry.dice?.Roll ?? Roll;
    const mod = system.abilities.guile.mod;
    const roll = new RollClass(`1d4 + ${mod}`);
    await roll.evaluate();

    const total = Math.max(0, roll.total);
    await actor.update({
      "system.runeUses.value": total,
      "system.runeUses.max": total
    });

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: "Rolling Daily Rune Uses"
    });
  };

  /**
   * Executa a conjuração de uma runa
   */
  const castRune = async (rune: any) => {
    if (system.runeUses.value <= 0) {
      // @ts-ignore
      ui.notifications.warn("No daily rune uses remaining!");
      return;
    }

    // @ts-ignore
    const RollClass = foundry.dice?.Roll ?? Roll;
    // @ts-ignore
    const render = foundry.applications.handlebars?.renderTemplate ?? renderTemplate;
    
    const mod = system.abilities.wits.mod;
    const roll = new RollClass(`1d20 + ${mod}`);
    await roll.evaluate();

    const d20 = roll.terms[0].results[0].result;
    const isSuccess = roll.total >= 12;
    const isCrit = d20 === 20;
    const isFumble = d20 === 1;

    let flavor = `Casting Rune: ${rune.name}`;
    if (isCrit) flavor += " - CRITICAL SUCCESS!";
    if (isFumble) flavor += " - FUMBLE! Backfire!";

    const templateData = {
      actorId: actor.id,
      title: `Cast: ${rune.name}`,
      total: roll.total,
      formula: roll.formula,
      tooltip: await roll.getTooltip(),
      flavor: flavor,
      isCrit,
      isFumble,
      isSuccess
    };

    const content = await render("systems/berserkr/templates/chat/test-card.hbs", templateData);

    // @ts-ignore
    ChatMessage.create({
      user: (game as any).user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      content: content,
      rolls: [roll],
      style: (CONST as any).CHAT_MESSAGE_STYLES?.OTHER ?? (CONST as any).CHAT_MESSAGE_TYPES?.OTHER
    });

    // Gasta um uso
    const updates: any = { "system.runeUses.value": Math.max(0, system.runeUses.value - 1) };
    
    // Se falhar (não crítico), perde 1 HP
    if (!isSuccess && !isCrit) {
      updates["system.hp.value"] = Math.max(0, system.hp.value - 1);
      // @ts-ignore
      ui.notifications.info("Casting failed! Lost 1 HP.");
    }

    await actor.update(updates);
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
</script>

<div class="special-content">
  <!-- Magia Rúnica -->
  <section class="special-section">
    <div class="section-header">
      <h3 class="section-title">Runic Magic</h3>
      <div class="rune-pool">
        <span class="pool-label">Daily Pool:</span>
        <span class="pool-value">{system.runeUses.value} / {system.runeUses.max}</span>
        <button type="button" class="roll-pool-btn" onclick={rollDailyRunes} title="Roll Daily Uses">
          <i class="fas fa-dice-d6"></i>
        </button>
      </div>
    </div>

    <div class="rune-grid">
      {#each runes as rune (rune.id)}
        <div class="rune-card">
          <img src={rune.img} alt={rune.name} width="32" height="32" />
          <div class="rune-details">
            <span class="rune-name">{rune.name}</span>
            <span class="rune-set">Set {rune.system.set}</span>
          </div>
          <div class="rune-controls">
            <button type="button" class="rune-chat-btn" onclick={() => postItemChat(rune)} aria-label="Send to Chat" title="Send to Chat">
              <i class="fas fa-comment-dots"></i>
            </button>
            <button type="button" class="cast-btn" onclick={() => castRune(rune)} disabled={system.runeUses.value <= 0}>
              CAST
            </button>
          </div>
        </div>
      {/each}
      {#if runes.length === 0}
        <p class="placeholder-text">No runes available.</p>
      {/if}
    </div>
  </section>

  <!-- Habilidades de Classe -->
  <section class="special-section">
    <div class="section-header">
      <h3 class="section-title">Class Abilities</h3>
      <button type="button" class="add-item-btn" onclick={() => createItem("feat")} aria-label="Add Ability" title="Add Ability">
        <i class="fas fa-plus-circle"></i>
      </button>
    </div>
    <div class="feat-list">
      {#each feats as feat (feat.id)}
        <div class="feat-row">
          <div class="feat-header" onclick={() => feat.sheet.render(true)} onkeydown={(e) => e.key === 'Enter' && feat.sheet.render(true)} role="button" tabindex="0">
            <img src={feat.img} alt={feat.name} width="24" height="24" />
            <span class="feat-name">{feat.name}</span>
          </div>
          <div class="item-controls">
            <button type="button" class="icon-btn chat" onclick={() => postItemChat(feat)} aria-label="Send to Chat" title="Send to Chat"><i class="fas fa-comment-dots"></i></button>
            <button type="button" class="icon-btn delete" onclick={() => feat.delete()} aria-label="Delete" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      {/each}
      {#if feats.length === 0}
        <p class="placeholder-text">No special abilities added.</p>
      {/if}
    </div>
  </section>
</div>

<style lang="scss">
  .special-section {
    margin-bottom: 2rem;
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

  .rune-pool {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--berserkr-color-cyan-medium);
    color: #fff;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 0.9rem;

    .pool-value { font-weight: bold; color: var(--berserkr-color-cyan-vibrant); }
    
    .roll-pool-btn {
      background: transparent;
      border: none;
      color: #fff;
      cursor: pointer;
      padding: 2px;
      &:hover { color: var(--berserkr-color-cyan-vibrant); }
    }
  }

  .rune-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
  }

  .rune-card {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    background: rgba(255, 255, 255, 0.4);
    padding: 0.6rem;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.1);

    img { border-radius: 4px; border: 1px solid var(--berserkr-color-cyan-medium); background: #122525; }
    
    .rune-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      .rune-name { font-weight: bold; font-size: 1rem; }
      .rune-set { font-size: 0.75rem; font-style: italic; color: #666; }
    }

    .rune-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .rune-chat-btn {
      background: transparent;
      border: none;
      color: var(--berserkr-color-cyan-medium);
      font-size: 1.1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: all 0.2s;
      &:hover { color: var(--berserkr-color-cyan-vibrant); }
    }

    .cast-btn {
      background: var(--berserkr-color-cyan-medium);
      color: #fff;
      border: none;
      padding: 4px 12px;
      border-radius: 4px;
      font-family: var(--berserkr-font-display);
      font-size: 0.8rem;
      cursor: pointer;
      &:hover:not(:disabled) { background: var(--berserkr-color-cyan-vibrant); color: #000; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
  }

  .feat-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .feat-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.8rem;
    background: rgba(255, 255, 255, 0.4);
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.05);

    .feat-header {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.8rem;
      cursor: pointer;
      &:hover { .feat-name { color: var(--berserkr-color-cyan-medium); } }
    }

    .feat-name { font-weight: 500; transition: color 0.2s; }
    
    img { border-radius: 2px; border: 1px solid #ccc; }

    .item-controls {
      display: flex;
      align-items: center;
      gap: 4px;
    }
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
    &:hover { color: var(--berserkr-color-cyan-vibrant); }
  }

  .icon-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    color: #888;
    padding: 4px;
    &.chat:hover { color: var(--berserkr-color-cyan-medium); }
    &.delete:hover { color: #f55; }
  }

  .placeholder-text { font-style: italic; color: #666; text-align: center; padding: 1rem; }
</style>
