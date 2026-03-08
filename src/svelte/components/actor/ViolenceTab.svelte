<script lang="ts">
  import type { BerserkrActor } from "../../../module/documents/actor";

  let { system, actor, weapons } = $props<{
    system: any;
    actor: BerserkrActor;
    weapons: any[];
  }>();

  /**
   * Helper para acessar as classes do Foundry de forma segura na v13
   */
  const getFoundryClasses = () => {
    // @ts-ignore
    const RollClass = foundry.dice?.Roll ?? Roll;
    // @ts-ignore
    const render = foundry.applications?.handlebars?.renderTemplate ?? renderTemplate;
    // @ts-ignore
    const ChatMessageClass = foundry.documents?.BaseChatMessage ?? ChatMessage;
    
    return { RollClass, render, ChatMessageClass };
  };

  /**
   * Executa o teste de Defesa (Swift vs Defense DR)
   */
  const rollDefense = async () => {
    const mod = system.abilities.swift.mod;
    const dr = system.derived.defenseDR;
    const { RollClass, render, ChatMessageClass } = getFoundryClasses();

    const roll = new RollClass(`1d20 + ${mod}`);
    await roll.evaluate();

    const d20 = roll.terms[0].results[0].result;
    const isSuccess = roll.total >= dr;
    const isCrit = d20 === 20;
    const isFumble = d20 === 1;

    let flavor = `Defense Test (DR ${dr})`;
    if (isCrit) flavor += " - FREE ATTACK!";
    if (isFumble) flavor += " - DOUBLE DAMAGE & ARMOR DEGRADED!";

    const templateData = {
      actorId: actor.id,
      title: "Defense Roll",
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
    ChatMessageClass.create({
      user: (game as any).user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      content: content,
      rolls: [roll],
      style: (CONST as any).CHAT_MESSAGE_STYLES?.OTHER ?? (CONST as any).CHAT_MESSAGE_TYPES?.OTHER
    });
  };

  /**
   * Executa a rolagem de Redução de Armadura
   */
  const rollArmorReduction = async () => {
    const formula = system.derived.armorReduction;
    if (formula === "0" || !formula) return;

    const { RollClass, render, ChatMessageClass } = getFoundryClasses();

    const roll = new RollClass(formula);
    await roll.evaluate();

    const templateData = {
      actorId: actor.id,
      title: "Armor Reduction",
      total: roll.total,
      formula: roll.formula,
      tooltip: await roll.getTooltip(),
      flavor: "Damage Negated",
      isCrit: false,
      isFumble: false
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
   * Executa a rolagem de ataque de uma arma
   */
  const rollAttack = async (weapon: any) => {
    const isRanged = weapon.system.isRanged;
    const attribute = isRanged ? "guile" : "might";
    const mod = system.abilities[attribute].mod;
    const { RollClass, render, ChatMessageClass } = getFoundryClasses();

    const roll = new RollClass(`1d20 + ${mod}`);
    await roll.evaluate();

    const d20 = roll.terms[0].results[0].result;
    const templateData = {
      actorId: actor.id,
      itemId: weapon.id,
      title: weapon.name,
      itemImg: weapon.img,
      total: roll.total,
      formula: roll.formula,
      tooltip: await roll.getTooltip(),
      flavor: `Attack (${attribute})`,
      isCrit: d20 === 20,
      isFumble: d20 === 1
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

    const { RollClass, render, ChatMessageClass } = getFoundryClasses();

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

<div class="violence-content">
  <div class="combat-stats-grid">
    <button type="button" class="combat-stat clickable" onclick={rollDefense} title="Roll Defense (Swift vs DR)">
      <span class="stat-label">Defense DR</span>
      <span class="stat-value">{system.derived.defenseDR}</span>
    </button>
    
    <button type="button" class="combat-stat clickable" onclick={rollArmorReduction} title="Roll Armor Reduction" disabled={system.derived.armorReduction === "0"}>
      <span class="stat-label">Armor Reduction</span>
      <span class="stat-value">{system.derived.armorReduction !== "0" ? "-" : ""}{system.derived.armorReduction}</span>
    </button>
    
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
                <span class="dmg-tag">{dmg.dieCount}${dmg.dieType}{dmg.modifier ? (dmg.modifier > 0 ? "+" + dmg.modifier : dmg.modifier) : ""} {dmg.type}</span>
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

<style lang="scss">
  .combat-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
    margin-bottom: 2rem;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    align-items: stretch;
  }

  .combat-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
    background: transparent;
    border: 1px solid transparent;
    padding: 0.5rem;
    margin: 0;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    text-align: center;
    color: inherit;
    line-height: normal;
    
    &.clickable {
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s;
      
      &:hover {
        .stat-label, .stat-value { 
          color: var(--berserkr-color-cyan-vibrant) !important; 
          text-shadow: 
            -6px -6px 0px #000, 
             0px -6px 0px #000,
             6px -6px 0px #000, 
            -6px  0px 0px #000,
             6px  0px 0px #000,
            -6px  6px 0px #000, 
             0px  6px 0px #000,
             6px  6px 0px #000,
             0 0 20px rgba(0, 217, 255, 0.9);
        }
      }
      
      &:disabled {
        cursor: default;
        opacity: 0.6;
        &:hover { 
          background: transparent; 
          border-color: transparent; 
          .stat-label { color: var(--berserkr-color-cyan-medium); } 
        }
      }
    }
  }

  .stat-label {
    font-family: var(--berserkr-font-display, 'Norse', serif);
    font-size: 1rem;
    color: var(--berserkr-color-cyan-medium);
    transition: color 0.2s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }

  .stat-value {
    font-family: var(--berserkr-font-display, 'Norse', serif);
    font-size: 1.7rem;
    font-weight: bold;
    color: var(--berserkr-color-black);
    display: block;
    width: 100%;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  }

  .penalty {
    color: #d00 !important;
    text-shadow: 0 0 8px rgba(255, 0, 0, 0.4), 1px 1px 2px rgba(0, 0, 0, 0.2) !important;
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

  .placeholder-text {
    font-style: italic;
    color: #666;
    text-align: center;
    padding: 1rem;
  }
</style>
