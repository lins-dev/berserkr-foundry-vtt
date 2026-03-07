<script lang="ts">
  let { item, system, updateField } = $props<{
    item: any;
    system: any;
    updateField: (path: string, e: Event) => void;
  }>();
</script>

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

<style lang="scss">
  .prop-row { display: grid; gap: 1rem; &.type-stats { grid-template-columns: repeat(4, 1fr); } }
  .prop-field {
    display: flex; flex-direction: column; gap: 4px;
    label { font-family: var(--berserkr-font-display, 'Norse', serif); font-size: 0.9rem; color: var(--berserkr-color-cyan-medium); }
    input[type="number"] {
      background: rgba(255, 255, 255, 0.4); border: 1px solid rgba(0, 0, 0, 0.15);
      padding: 4px; border-radius: 2px; outline: none; color: var(--berserkr-color-black); font-weight: bold; width: 100%;
    }
    .multi-input { display: flex; align-items: center; gap: 4px; input { width: 45px; text-align: center; } }
  }
</style>
