<script lang="ts">
  import type { BerserkrActor } from "../../../module/documents/actor";

  let { system, actor, updateField } = $props<{
    system: any;
    actor: BerserkrActor;
    updateField: (path: string, value: any) => void;
  }>();

  /**
   * Executa a rolagem de teste de um atributo
   */
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

    const roll = new RollClass(`1d20 + ${mod}`);
    await roll.evaluate();

    const d20 = roll.terms[0].results[0].result;
    let flavor = `Test: ${attributeName.toUpperCase()}`;
    if (penalty > 0) flavor += ` (+${penalty} DR from ${penaltySource})`;

    const templateData = {
      actorId: actor.id,
      title: "Attribute Test",
      total: roll.total,
      formula: roll.formula,
      tooltip: await roll.getTooltip(),
      flavor: flavor,
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
</script>

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

<style lang="scss">
  .attributes-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
    padding: 0.8rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    border: 1px solid var(--berserkr-color-cyan-vibrant);
    margin: 0 1rem 1rem 1rem;
  }

  .attr-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    .attr-label-btn { 
      font-family: var(--berserkr-font-display, 'Norse', serif); 
      font-size: 1.4rem;
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
        width: 45px;
        background: transparent; 
        border: none; 
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        color: var(--berserkr-color-white); 
        text-align: center; 
        font-weight: bold; 
        outline: none;
        font-size: 1.4rem;
        &:focus { border-color: var(--berserkr-color-cyan-vibrant); }
      }

      .attr-mod { 
        color: var(--berserkr-color-white); 
        font-weight: 900; 
        font-size: 1.6rem;
        text-shadow: 0 0 8px var(--berserkr-color-cyan-vibrant);
      }
    }
  }
</style>
