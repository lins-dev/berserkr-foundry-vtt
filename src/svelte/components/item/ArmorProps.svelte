<script lang="ts">
  let { item, system, updateField, updateCheckbox, updateReduction } = $props<{
    item: any;
    system: any;
    updateField: (path: string, e: Event) => void;
    updateCheckbox: (path: string, e: Event) => void;
    updateReduction: (key: string, e: Event) => void;
  }>();
</script>

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
        <option value="d2">d2</option><option value="d3">d3</option><option value="d4">d4</option>
        <option value="d6">d6</option><option value="d8">d8</option><option value="d10">d10</option>
        <option value="d12">d12</option><option value="d20">d20</option><option value="d100">d100</option>
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

<style lang="scss">
  .prop-row { display: grid; gap: 1rem; &.type-stats { grid-template-columns: repeat(4, 1fr); } }
  .prop-field {
    display: flex; flex-direction: column; gap: 4px;
    label { font-family: var(--berserkr-font-display, 'Norse', serif); font-size: 0.9rem; color: var(--berserkr-color-cyan-medium); }
    input[type="number"] {
      background: rgba(255, 255, 255, 0.4); border: 1px solid rgba(0, 0, 0, 0.15);
      padding: 4px; border-radius: 2px; outline: none; color: var(--berserkr-color-black); font-weight: bold; width: 100%;
    }
    &.check { flex-direction: row; align-items: center; gap: 8px; label { margin-bottom: 0; } input { width: auto; } }
  }
  .damage-grid {
    display: flex; align-items: center; gap: 6px;
    input[type="number"] { width: 55px; text-align: center; }
    select { 
      background: rgba(255, 255, 255, 0.4); border: 1px solid rgba(0, 0, 0, 0.15); 
      padding: 3px; border-radius: 2px; font-weight: bold; color: var(--berserkr-color-black);
    }
  }
</style>
