<script lang="ts">
  import type { BerserkrItem } from "../../module/documents/item";

  let { item, context } = $props<{
    item: BerserkrItem;
    context: any;
  }>();

  let system = $derived(item.system as any);
  let type = $derived(item.type);

  const ALLOWED_DICE = ["d2", "d3", "d4", "d6", "d8", "d10", "d12", "d20", "d100"];

  const updateField = (path: string, e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    let value: any = input.value;
    let finalValue = value;

    if (input.type === "number" || path.includes("quantity") || path.includes("weight") || path.includes("cost") || path.includes("uses")) {
      if (path.includes("quantity")) finalValue = Math.clamp(parseInt(value) || 0, 0, 9999);
      if (path.includes("weight")) finalValue = parseFloat(Math.clamp(parseFloat(value) || 0, 0, 99).toFixed(2));
      if (path.includes("cost")) finalValue = parseFloat(Math.clamp(parseFloat(value) || 0, 0, 9999999.99).toFixed(2));
      if (path.includes("tier")) finalValue = Math.clamp(parseInt(value) || 1, 1, 4);
      if (path.includes("range")) finalValue = Math.clamp(parseInt(value) || 0, 0, 9999);
      if (path.includes("uses")) finalValue = Math.clamp(parseInt(value) || 0, 0, 100);
      if (path.includes("set")) finalValue = Math.clamp(parseInt(value) || 1, 1, 3);
      
      input.value = finalValue.toString();
    }

    item.update({ [path]: finalValue });
  };

  const updateCheckbox = (path: string, e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    item.update({ [path]: input.checked });
  };

  const addDamage = () => {
    if (system.damages.length < 5) {
      const newDamages = [...system.damages, { dieCount: 1, dieType: "d4", modifier: 0, type: "physical" }];
      item.update({ "system.damages": newDamages });
    }
  };

  const removeDamage = (index: number) => {
    if (system.damages.length > 1) {
      const newDamages = system.damages.filter((_, i) => i !== index);
      item.update({ "system.damages": newDamages });
    }
  };

  const updateDamage = (index: number, key: string, e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    let value: any = input.value;
    let finalValue = value;

    if (key === "dieCount") finalValue = Math.clamp(parseInt(value) || 1, 1, 10);
    if (key === "modifier") finalValue = Math.clamp(parseInt(value) || 0, -100, 100);
    if (key === "dieType") finalValue = ALLOWED_DICE.includes(value) ? value : "d4";
    if (key === "type") finalValue = String(value).slice(0, 50);

    if (key !== "dieType") {
      input.value = finalValue.toString();
    }

    const newDamages = system.damages.map((dmg: any, i: number) => 
      i === index ? { ...dmg, [key]: finalValue } : dmg
    );
    item.update({ "system.damages": newDamages });
  };

  const updateReduction = (key: string, e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    let value: any = input.value;
    let finalValue = value;

    if (key === "dieCount") finalValue = Math.clamp(parseInt(value) || 1, 1, 10);
    if (key === "dieType") finalValue = ALLOWED_DICE.includes(value) ? value : "d4";
    
    if (key !== "dieType") {
      input.value = finalValue.toString();
    }

    item.update({ [`system.reduction.${key}`]: finalValue });
  };
</script>

<div class="berserkr-item-sheet">
  <header class="item-header">
    <div class="portrait-area">
      <button 
        type="button"
        class="portrait-container" 
        onclick={() => (item as any).sheet.editImage()}
        title="Change Image"
      >
        <img src={item.img} alt={item.name} />
      </button>
    </div>

    <div class="item-info">
      <input 
        type="text" 
        class="item-name-input" 
        value={item.name} 
        onchange={(e) => updateField("name", e)}
        placeholder="Item Name"
        aria-label="Item Name"
      >
      <div class="item-type-badge">{type.toUpperCase()}</div>
    </div>
  </header>

  <section class="item-properties">
    <div class="prop-row base-stats">
      <div class="prop-field">
        <label for="{item.id}-quantity">Quantity</label>
        <input id="{item.id}-quantity" type="number" min="0" max="9999" value={system.quantity} onchange={(e) => updateField("system.quantity", e)}>
      </div>
      <div class="prop-field">
        <label for="{item.id}-weight">Weight</label>
        <input id="{item.id}-weight" type="number" step="0.01" min="0" max="99" value={system.weight} onchange={(e) => updateField("system.weight", e)}>
      </div>
      <div class="prop-field">
        <label for="{item.id}-cost">Cost</label>
        <input id="{item.id}-cost" type="number" step="0.01" min="0" max="9999999.99" value={system.cost} onchange={(e) => updateField("system.cost", e)}>
      </div>
    </div>

    {#if type === "weapon"}
      <div class="damages-list">
        {#each system.damages as dmg, i (i)}
          <div class="damage-entry">
            <div class="prop-field">
              <label for="{item.id}-dmg-count-{i}">Damage {i + 1}</label>
              <div class="damage-grid">
                <input 
                  id="{item.id}-dmg-count-{i}"
                  type="number" 
                  min="1" 
                  max="10" 
                  value={dmg.dieCount} 
                  onchange={(e) => updateDamage(i, "dieCount", e)}
                >
                <select aria-label="Die Type" value={dmg.dieType} onchange={(e) => updateDamage(i, "dieType", e)}>
                  <option value="d2">d2</option><option value="d3">d3</option><option value="d4">d4</option><option value="d6">d6</option><option value="d8">d8</option><option value="d10">d10</option><option value="d12">d12</option><option value="d20">d20</option><option value="d100">d100</option>
                </select>
                <span class="sign">+</span>
                <input 
                  aria-label="Damage Modifier"
                  type="number" 
                  min="-100" 
                  max="100" 
                  value={dmg.modifier} 
                  onchange={(e) => updateDamage(i, "modifier", e)}
                >
              </div>
            </div>
            <div class="prop-field">
              <label for="{item.id}-dmg-type-{i}">Type</label>
              <input id="{item.id}-dmg-type-{i}" type="text" maxlength="50" value={dmg.type} onchange={(e) => updateDamage(i, "type", e)}>
            </div>
            {#if system.damages.length > 1}
              <button class="remove-dmg-btn" type="button" onclick={() => removeDamage(i)}>✕</button>
            {/if}
          </div>
        {/each}
      </div>

      <div class="weapon-extras-row">
        <div class="prop-field check">
          <label for="{item.id}-ranged">Ranged?</label>
          <input id="{item.id}-ranged" type="checkbox" checked={system.isRanged} onchange={(e) => updateCheckbox("system.isRanged", e)}>
        </div>
        {#if system.isRanged}
          <div class="prop-field">
            <label for="{item.id}-range">Range</label>
            <input id="{item.id}-range" type="number" min="0" max="9999" value={system.range} onchange={(e) => updateField("system.range", e)}>
          </div>
        {/if}
        <button class="add-dmg-btn" type="button" onclick={addDamage} disabled={system.damages.length >= 5}>
          + ADD DAMAGE
        </button>
      </div>
    {/if}

    {#if type === "armor"}
      <div class="prop-row type-stats">
        <div class="prop-field">
          <label for="{item.id}-tier">Tier</label>
          <input id="{item.id}-tier" type="number" min="1" max="4" value={system.tier} onchange={(e) => updateField("system.tier", e)}>
        </div>
        <div class="prop-field">
          <label for="{item.id}-armor-red">Reduction</label>
          <div class="damage-grid">
            <input 
              id="{item.id}-armor-red"
              type="number" min="1" max="10" value={system.reduction.dieCount} onchange={(e) => updateReduction("dieCount", e)}>
            <select aria-label="Reduction Die Type" value={system.reduction.dieType} onchange={(e) => updateReduction("dieType", e)}>
              <option value="d2">d2</option><option value="d3">d3</option><option value="d4">d4</option><option value="d6">d6</option><option value="d8">d8</option><option value="d10">d10</option><option value="d12">d12</option><option value="d20">d20</option><option value="d100">d100</option>
            </select>
          </div>
        </div>
        <div class="prop-field check">
          <label for="{item.id}-shield">Shield?</label>
          <input id="{item.id}-shield" type="checkbox" checked={system.isShield} onchange={(e) => updateCheckbox("system.isShield", e)}>
        </div>
        {#if item.actor}
          <div class="prop-field check">
            <label for="{item.id}-equipped">Equipped?</label>
            <input id="{item.id}-equipped" type="checkbox" checked={system.equipped} onchange={(e) => updateCheckbox("system.equipped", e)}>
          </div>
        {/if}
      </div>
    {/if}

    {#if type === "rune"}
      <div class="prop-row type-stats">
        <div class="prop-field">
          <label for="{item.id}-uses">Uses</label>
          <div class="multi-input">
            <input id="{item.id}-uses" type="number" min="0" max="100" value={system.uses.value} onchange={(e) => updateField("system.uses.value", e)}>
            <span>/</span>
            <input aria-label="Max Uses" type="number" min="0" max="100" value={system.uses.max} onchange={(e) => updateField("system.uses.max", e)}>
          </div>
        </div>
        <div class="prop-field">
          <label for="{item.id}-set">Set</label>
          <input id="{item.id}-set" type="number" min="1" max="3" value={system.set} onchange={(e) => updateField("system.set", e)}>
        </div>
      </div>
    {/if}
  </section>

  <section class="item-description">
    <label for="{item.id}-description" class="section-label">Description</label>
    <textarea 
      id="{item.id}-description"
      value={system.description}
      onchange={(e) => updateField("system.description", e)}
      placeholder="Enter item description..."
    ></textarea>
  </section>
</div>

<style lang="scss">
  .berserkr-item-sheet {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
    background: var(--berserkr-color-cyan-light);
    min-height: 400px;
    font-family: var(--berserkr-font-text, 'Alegreya', serif);
    color: var(--berserkr-color-black);

    .item-header {
      display: flex;
      gap: 1rem;
      align-items: center;
      background: var(--berserkr-color-cyan-medium);
      padding: 0.8rem;
      color: var(--berserkr-color-white);
      border-radius: 4px;

      .portrait-container {
        width: 60px;
        height: 60px;
        background: rgba(0,0,0,0.2);
        border: 2px solid var(--berserkr-color-cyan-vibrant);
        border-radius: 4px;
        cursor: pointer;
        img { width: 100%; height: 100%; object-fit: cover; }
        padding: 0;
        margin: 0;
        display: block;
      }

      .item-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;

        .item-name-input {
          font-family: var(--berserkr-font-display, 'Norse', serif);
          font-size: 1.8rem;
          color: var(--berserkr-color-cyan-vibrant);
          background: transparent;
          border: none;
          border-bottom: 2px solid var(--berserkr-color-cyan-vibrant);
          outline: none;
        }

        .item-type-badge {
          font-family: var(--berserkr-font-display, 'Norse', serif);
          font-size: 0.8rem;
          background: rgba(0, 184, 200, 0.2);
          color: var(--berserkr-color-cyan-vibrant);
          padding: 2px 8px;
          border-radius: 4px;
          width: fit-content;
          letter-spacing: 1px;
        }
      }
    }

    .item-properties {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .prop-row {
      display: grid;
      gap: 1rem;
      &.base-stats { grid-template-columns: repeat(3, 1fr); }
      &.type-stats { grid-template-columns: repeat(4, 1fr); }
    }

    .weapon-extras-row {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid rgba(0,0,0,0.1);
      margin-top: 0.5rem;

      .add-dmg-btn {
        margin-left: auto;
        font-family: var(--berserkr-font-display, 'Norse', serif);
        font-size: 0.8rem;
        background: var(--berserkr-color-cyan-medium);
        color: var(--berserkr-color-white);
        border: none;
        padding: 4px 12px;
        border-radius: 2px;
        cursor: pointer;
        &:hover { background: var(--berserkr-color-cyan-vibrant); color: var(--berserkr-color-black); }
        &:disabled { opacity: 0.5; cursor: not-allowed; }
      }
    }

    .damages-list {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }

    .damage-entry {
      display: grid;
      grid-template-columns: 1fr 1fr 30px;
      gap: 1rem;
      align-items: flex-end;
      background: rgba(0,0,0,0.03);
      padding: 0.5rem;
      border-radius: 4px;

      .remove-dmg-btn {
        background: transparent;
        border: none;
        color: #888;
        cursor: pointer;
        font-size: 1rem;
        height: 30px;
        &:hover { color: #d00; }
      }
    }

    .prop-field {
      display: flex;
      flex-direction: column;
      gap: 4px;

      label {
        font-family: var(--berserkr-font-display, 'Norse', serif);
        font-size: 0.9rem;
        color: var(--berserkr-color-cyan-medium);
      }

      input[type="number"], input[type="text"] {
        background: rgba(255, 255, 255, 0.4);
        border: 1px solid rgba(0, 0, 0, 0.15);
        padding: 4px;
        border-radius: 2px;
        outline: none;
        color: var(--berserkr-color-black);
        font-weight: bold;
        width: 100%;
        &:focus { border-color: var(--berserkr-color-cyan-vibrant); }
      }

      &.check {
        flex-direction: row;
        align-items: center;
        gap: 8px;
        label { margin-bottom: 0; }
        input { width: auto; }
      }

      .multi-input {
        display: flex;
        align-items: center;
        gap: 4px;
        input { width: 45px; text-align: center; }
      }
    }

    .damage-grid {
      display: flex;
      align-items: center;
      gap: 6px;
      input[type="number"] { width: 55px; text-align: center; }
      select { 
        background: rgba(255, 255, 255, 0.4); 
        border: 1px solid rgba(0, 0, 0, 0.15); 
        padding: 3px; 
        border-radius: 2px;
        font-weight: bold;
        color: var(--berserkr-color-black);
        min-width: 70px;
      }
      .sign { font-weight: bold; color: var(--berserkr-color-cyan-medium); font-size: 1.1rem; }
    }

    .item-description {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .section-label {
        font-family: var(--berserkr-font-display, 'Norse', serif);
        font-size: 1.2rem;
        color: var(--berserkr-color-cyan-medium);
      }

      textarea {
        width: 100%;
        height: 150px;
        background: rgba(255, 255, 255, 0.4);
        border: 2px solid rgba(0, 0, 0, 0.1);
        padding: 0.8rem;
        resize: vertical;
        outline: none;
        color: var(--berserkr-color-black);
        line-height: 1.6;
      }
    }
  }
</style>
