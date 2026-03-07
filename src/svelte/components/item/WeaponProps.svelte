<script lang="ts">
  let { 
    item, 
    system, 
    updateField, 
    updateCheckbox, 
    addDamage, 
    removeDamage, 
    updateDamage 
  } = $props<{
    item: any;
    system: any;
    updateField: (path: string, e: Event) => void;
    updateCheckbox: (path: string, e: Event) => void;
    addDamage: () => void;
    removeDamage: (index: number) => void;
    updateDamage: (index: number, key: string, e: Event) => void;
  }>();
</script>

<div class="damages-list">
  {#each system.damages as dmg, i (i)}
    <div class="damage-entry">
      <div class="prop-field">
        <label for="{item.id}-dmg-count-{i}">Damage {i + 1}</label>
        <div class="damage-grid">
          <input 
            id="{item.id}-dmg-count-{i}"
            type="number" min="1" max="10" 
            value={dmg.dieCount} 
            onchange={(e) => updateDamage(i, "dieCount", e)}
          >
          <select aria-label="Die Type" value={dmg.dieType} onchange={(e) => updateDamage(i, "dieType", e)}>
            <option value="d2">d2</option><option value="d3">d3</option><option value="d4">d4</option>
            <option value="d6">d6</option><option value="d8">d8</option><option value="d10">d10</option>
            <option value="d12">d12</option><option value="d20">d20</option><option value="d100">d100</option>
          </select>
          <span class="sign">+</span>
          <input 
            aria-label="Damage Modifier"
            type="number" min="-100" max="100" 
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

<style lang="scss">
  .damages-list { display: flex; flex-direction: column; gap: 0.8rem; }
  .damage-entry {
    display: grid; grid-template-columns: 1fr 1fr 30px; gap: 1rem; align-items: flex-end;
    background: rgba(0,0,0,0.03); padding: 0.5rem; border-radius: 4px;
    .remove-dmg-btn { background: transparent; border: none; color: #888; cursor: pointer; font-size: 1rem; height: 30px; &:hover { color: #d00; } }
  }
  .prop-field {
    display: flex; flex-direction: column; gap: 4px;
    label { font-family: var(--berserkr-font-display, 'Norse', serif); font-size: 0.9rem; color: var(--berserkr-color-cyan-medium); }
    input[type="number"], input[type="text"] {
      background: rgba(255, 255, 255, 0.4); border: 1px solid rgba(0, 0, 0, 0.15);
      padding: 4px; border-radius: 2px; outline: none; color: var(--berserkr-color-black); font-weight: bold; width: 100%;
      &:focus { border-color: var(--berserkr-color-cyan-vibrant); }
    }
    &.check { flex-direction: row; align-items: center; gap: 8px; label { margin-bottom: 0; } input { width: auto; } }
  }
  .damage-grid {
    display: flex; align-items: center; gap: 6px;
    input[type="number"] { width: 55px; text-align: center; }
    select { 
      background: rgba(255, 255, 255, 0.4); border: 1px solid rgba(0, 0, 0, 0.15); 
      padding: 3px; border-radius: 2px; font-weight: bold; color: var(--berserkr-color-black); min-width: 70px;
    }
    .sign { font-weight: bold; color: var(--berserkr-color-cyan-medium); font-size: 1.1rem; }
  }
  .weapon-extras-row {
    display: flex; align-items: center; gap: 1.5rem; padding-top: 0.5rem; border-top: 1px solid rgba(0,0,0,0.1); margin-top: 0.5rem;
    .add-dmg-btn {
      margin-left: auto; font-family: var(--berserkr-font-display, 'Norse', serif); font-size: 0.8rem;
      background: var(--berserkr-color-cyan-medium); color: var(--berserkr-color-white); border: none; padding: 4px 12px; border-radius: 2px; cursor: pointer;
      &:hover { background: var(--berserkr-color-cyan-vibrant); color: var(--berserkr-color-black); }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
  }
</style>
