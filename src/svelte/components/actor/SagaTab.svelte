<script lang="ts">
  import type { BerserkrActor } from "../../../module/documents/actor";

  let { actor, system, updateField } = $props<{
    actor: BerserkrActor;
    system: any;
    updateField: (path: string, value: any) => void;
  }>();

  let preventDecrease = $state(true);

  /**
   * Executa a mecânica de "Get Better" (Progresso da Saga)
   */
  const getBetter = async () => {
    // @ts-ignore
    const RollClass = foundry.dice?.Roll ?? Roll;
    // @ts-ignore
    const render = foundry.applications.handlebars?.renderTemplate ?? renderTemplate;

    const outcomes: string[] = [];
    const updates: any = {};

    // 1. HP Progression
    const oldHpMax = system.hp.max;
    const hpRoll = await new RollClass("6d10").evaluate();
    let newHpMax = oldHpMax;

    if (hpRoll.total >= oldHpMax) {
      const gainRoll = await new RollClass("1d6").evaluate();
      newHpMax = oldHpMax + gainRoll.total;
      outcomes.push(`<strong>HP:</strong> Gain ${gainRoll.total} Max HP (New Max: ${newHpMax})`);
    } else {
      outcomes.push("<strong>HP:</strong> Max HP remains unchanged.");
    }
    updates["system.hp.max"] = newHpMax;

    // 2. Abilities Progression
    const abilities = ["fortitude", "might", "guile", "swift", "wits"];
    for (const abl of abilities) {
      const oldVal = system.abilities[abl].value;
      const roll = await new RollClass("1d6").evaluate();
      let newVal = oldVal;

      if (roll.total === 1 || roll.total < oldVal) {
        if (!preventDecrease) {
          newVal = Math.max(-3, oldVal - 1);
        }
      } else if (roll.total > oldVal) {
        newVal = Math.min(6, oldVal + 1);
      }

      if (newVal > oldVal) {
        outcomes.push(`<strong>${abl.toUpperCase()}:</strong> Increased to ${newVal}`);
      } else if (newVal < oldVal) {
        outcomes.push(`<strong>${abl.toUpperCase()}:</strong> Decreased to ${newVal}`);
      }
      updates[`system.abilities.${abl}.value`] = newVal;
    }

    if (outcomes.length === 0 || (outcomes.length === 1 && outcomes[0].includes("unchanged"))) {
      outcomes.push("<em>The gods are indifferent. No significant changes.</em>");
    }

    // 3. Update Saga Log
    const timestamp = new Date().toLocaleDateString();
    const currentCount = (system.improvementCount || 0) + 1;
    const newEntry = `
      <div class="saga-entry">
        <h4>IMPROVEMENT #${currentCount} — ${timestamp}</h4>
        <ul>
          ${outcomes.map(o => `<li>${o}</li>`).join('')}
        </ul>
      </div>
    `;
    
    updates["system.improvementCount"] = currentCount;
    updates["system.sagas"] = newEntry + (system.sagas || "");

    // 4. Update Actor
    await actor.update(updates);

    // 5. Chat Message
    const templateData = {
      actorId: actor.id,
      outcomes: outcomes,
      newHp: newHpMax
    };

    const content = await render("systems/berserkr/templates/chat/get-better-card.hbs", templateData);

    // @ts-ignore
    ChatMessage.create({
      user: (game as any).user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      content: content,
      // @ts-ignore
      style: (CONST as any).CHAT_MESSAGE_STYLES?.OTHER ?? (CONST as any).CHAT_MESSAGE_TYPES?.OTHER
    });

    // @ts-ignore
    ui.notifications.info("The Saga has grown. Improvement recorded.");
  };

  const clearSaga = async () => {
    const confirm = await Dialog.confirm({
      title: "Clear Saga History",
      content: "<p>Are you sure you want to clear all improvement logs? The stats will remain unchanged.</p>"
    });
    if (confirm) {
      actor.update({ "system.sagas": "", "system.improvementCount": 0 });
    }
  };
</script>

<div class="saga-content">
  <section class="progression-header">
    <div class="header-info">
      <div class="count-badge">
        <span class="label">Total Improvements</span>
        <span class="number">{system.improvementCount || 0}</span>
      </div>
      <div class="header-text">
        <h3 class="section-title">The Saga Grows</h3>
        <p class="description">Only the GM decides when your saga advances. This records all mechanical growth.</p>
        <div class="prevent-toggle">
          <label class="toggle-container">
            <input type="checkbox" bind:checked={preventDecrease} />
            <span class="checkmark"></span>
            Prevent Attribute Decrease
          </label>
        </div>
      </div>
    </div>
    <div class="header-actions">
      <button type="button" class="get-better-btn" onclick={getBetter}>
        <i class="fas fa-bolt"></i> GET BETTER
      </button>
    </div>
  </section>

  <section class="chronicles-section">
    <div class="section-header">
      <h3 class="section-title">Mechanical History</h3>
      <button type="button" class="clear-btn" onclick={clearSaga} title="Clear Logs">
        <i class="fas fa-eraser"></i>
      </button>
    </div>
    <div class="saga-history-container">
      {#if system.sagas}
        <div class="saga-log">
          {@html system.sagas}
        </div>
      {:else}
        <p class="placeholder-text">No improvements recorded yet. The saga is just beginning.</p>
      {/if}
    </div>
  </section>
</div>

<style lang="scss">
  .saga-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .progression-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid var(--berserkr-color-cyan-medium);

    .header-info {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex: 1;
    }

    .count-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: var(--berserkr-color-cyan-medium);
      color: #fff;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      min-width: 100px;
      .label { font-size: 0.7rem; text-transform: uppercase; font-weight: bold; opacity: 0.9; }
      .number { font-size: 2rem; font-weight: 900; line-height: 1; font-family: var(--berserkr-font-display); }
    }

    .header-text {
      .section-title { margin: 0; border: none; }
      .description { font-style: italic; font-size: 0.9rem; color: #444; margin: 0.2rem 0 0.5rem 0; }
    }

    .prevent-toggle {
      margin-top: 0.5rem;
      .toggle-container {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        font-size: 0.85rem;
        font-weight: bold;
        color: var(--berserkr-color-cyan-medium);
        cursor: pointer;
        user-select: none;
        
        input { display: none; }
        .checkmark {
          width: 18px;
          height: 18px;
          border: 2px solid var(--berserkr-color-cyan-medium);
          background: #fff;
          border-radius: 3px;
          position: relative;
          transition: all 0.2s;
        }

        input:checked + .checkmark {
          background: var(--berserkr-color-cyan-medium);
          &:after {
            content: '';
            position: absolute;
            left: 5px;
            top: 1px;
            width: 5px;
            height: 10px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
          }
        }
        &:hover .checkmark { border-color: var(--berserkr-color-cyan-vibrant); box-shadow: 0 0 5px var(--berserkr-color-cyan-vibrant); }
      }
    }
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #004D56;
    margin-bottom: 1rem;
    
    .section-title { border: none; margin: 0; }
  }

  .section-title {
    font-family: var(--berserkr-font-display, 'Norse', serif);
    font-size: 1.6rem;
    color: #004D56 !important;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .get-better-btn {
    background: var(--berserkr-color-cyan-medium);
    color: #fff;
    border: 3px solid #000;
    padding: 0.8rem 1.5rem;
    font-family: var(--berserkr-font-display);
    font-size: 1.2rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #000;
    transition: all 0.1s;
    display: flex;
    align-items: center;
    gap: 0.8rem;

    &:hover { background: var(--berserkr-color-cyan-vibrant); color: #000; transform: translate(-2px, -2px); box-shadow: 6px 6px 0px #000; }
    &:active { transform: translate(2px, 2px); box-shadow: 0px 0px 0px #000; }
  }

  .clear-btn {
    background: transparent;
    border: none;
    color: #888;
    cursor: pointer;
    font-size: 1rem;
    &:hover { color: #f55; }
  }

  .saga-history-container {
    flex: 1;
    background: rgba(255, 255, 255, 0.4);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    padding: 1.5rem;
    max-height: 500px;
    overflow-y: auto;
  }

  .saga-log {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    :global(.saga-entry) {
      background: #fff;
      padding: 1rem;
      border-left: 4px solid var(--berserkr-color-cyan-medium);
      box-shadow: 2px 2px 5px rgba(0,0,0,0.05);

      :global(h4) { 
        margin: 0 0 0.8rem 0; 
        color: #004D56; 
        font-family: var(--berserkr-font-display); 
        font-size: 1.2rem; 
        border-bottom: 2px solid #004D56; 
        padding-bottom: 0.3rem;
        letter-spacing: 1.5px;
        text-transform: uppercase;
      }
      :global(ul) { margin: 0; padding-left: 1.2rem; list-style-type: square; }
      :global(li) { font-size: 0.95rem; margin-bottom: 0.2rem; }
    }
  }

  .placeholder-text { font-style: italic; color: #666; text-align: center; padding: 2rem; }
</style>
