<script lang="ts">
  let { item, system, updateField } = $props<{
    item: any;
    system: any;
    updateField: (path: string, e: Event) => void;
  }>();
</script>

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

<style lang="scss">
  .prop-row { display: grid; gap: 1rem; &.base-stats { grid-template-columns: repeat(3, 1fr); } }
  .prop-field {
    display: flex; flex-direction: column; gap: 4px;
    label { font-family: var(--berserkr-font-display, 'Norse', serif); font-size: 0.9rem; color: var(--berserkr-color-cyan-medium); }
    input[type="number"] {
      background: rgba(255, 255, 255, 0.4); border: 1px solid rgba(0, 0, 0, 0.15);
      padding: 4px; border-radius: 2px; outline: none; color: var(--berserkr-color-black); font-weight: bold; width: 100%;
    }
  }
</style>
