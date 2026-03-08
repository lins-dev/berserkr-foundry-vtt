<script lang="ts">
  import type { BerserkrActor } from "../../../module/documents/actor";

  let { actor, system, updateField } = $props<{
    actor: BerserkrActor;
    system: any;
    updateField: (path: string, value: any) => void;
  }>();
</script>

<div class="header-main">
  <div class="portrait-area">
    <button 
      type="button"
      class="portrait-container" 
      onclick={() => (actor as any).sheet.editImage()}
      title="Change Image"
    >
      <img src={actor.img} alt={actor.name} />
    </button>
  </div>

  <div class="char-info">
    <input 
      type="text" 
      class="char-name-input" 
      value={actor.name} 
      onchange={(e) => updateField("name", e.currentTarget.value)}
      placeholder="Character Name"
      aria-label="Character Name"
    >

    <div class="char-class-row">
      <label for="{actor.id}-class">Class:</label>
      <input 
        id="{actor.id}-class"
        type="text" 
        class="char-class-input" 
        value={system.class} 
        onchange={(e) => updateField("system.class", e.currentTarget.value)}
        placeholder="Enter class..."
      >
    </div>

    <div class="stats-grid">
      <div class="stat-field">
        <label for="{actor.id}-hp-val">HP:</label>
        <input id="{actor.id}-hp-val" type="number" class="stat-input" value={system.hp.value} onchange={(e) => updateField("system.hp.value", parseInt(e.currentTarget.value))}>
        <span class="stat-separator">/</span>
        <input aria-label="Max HP" type="number" class="stat-input" value={system.hp.max} onchange={(e) => updateField("system.hp.max", parseInt(e.currentTarget.value))}>
      </div>
      <div class="stat-field">
        <label for="{actor.id}-fates">Fates:</label>
        <input id="{actor.id}-fates" type="number" class="stat-input" value={system.fates.value} onchange={(e) => updateField("system.fates.value", parseInt(e.currentTarget.value))}>
      </div>
      <div class="stat-field">
        <label for="{actor.id}-silver">Silver:</label>
        <input id="{actor.id}-silver" type="number" class="stat-input" value={system.silver} onchange={(e) => updateField("system.silver", parseInt(e.currentTarget.value))}>
      </div>
    </div>

    <div class="action-buttons">
      <button class="btn init-btn" type="button" onclick={() => actor.rollInitiative({createCombatants: true})} title="Roll Initiative">
        <i class="fas fa-swords"></i> INIT
      </button>
      <button class="btn" type="button" onclick={() => console.log("Broken")}>BROKEN</button>
      <button class="btn" type="button" onclick={() => console.log("Rest")}>REST</button>
      <button class="btn" type="button" onclick={() => console.log("Better")}>GET BETTER</button>
    </div>
  </div>
</div>

<style lang="scss">
  .header-main {
    display: flex;
    gap: 1.5rem;
  }

  .portrait-container {
    width: 120px;
    height: 140px;
    background: rgba(0,0,0,0.2);
    border: 2px solid var(--berserkr-color-cyan-vibrant);
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    padding: 0;
    margin: 0;
    display: block;
    img { width: 100%; height: 100%; object-fit: cover; }
  }

  .char-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .char-name-input {
    font-family: var(--berserkr-font-display, 'Norse', serif);
    font-size: 2.2rem;
    color: var(--berserkr-color-cyan-vibrant);
    background: transparent;
    border: none;
    border-bottom: 2px solid var(--berserkr-color-cyan-vibrant);
    outline: none;
    width: 100%;
  }

  .char-class-row {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    label { 
      font-family: var(--berserkr-font-display, 'Norse', serif); 
      font-size: 1.4rem; 
      color: var(--berserkr-color-cyan-vibrant);
    }
    input { 
      background: transparent; 
      border: none; 
      border-bottom: 1px solid var(--berserkr-color-cyan-vibrant); 
      color: var(--berserkr-color-white); 
      flex: 1; 
      outline: none; 
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .stat-field {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    label { 
      font-family: var(--berserkr-font-display, 'Norse', serif); 
      color: var(--berserkr-color-cyan-vibrant); 
      font-size: 1.4rem; 
    }
    input { 
      width: 50px;
      background: transparent; 
      border: none; 
      border-bottom: 2px solid var(--berserkr-color-cyan-vibrant); 
      color: var(--berserkr-color-white); 
      text-align: center; 
      outline: none;
      font-size: 1.4rem;
      font-weight: bold;
    }
    .stat-separator {
      font-size: 1.2rem;
      color: var(--berserkr-color-cyan-vibrant);
    }
  }

  .action-buttons {
    display: flex;
    gap: 0.8rem;
    margin-top: 0.5rem;
  }

  .btn {
    font-size: 0.7rem;
    font-weight: bold;
    padding: 6px 12px;
    background: transparent;
    border: 1px solid var(--berserkr-color-cyan-light);
    color: var(--berserkr-color-cyan-light);
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.2s;
    &:hover { 
      border-color: var(--berserkr-color-cyan-vibrant); 
      color: var(--berserkr-color-white); 
      background: rgba(0,229,255,0.1); 
    }
    
    &.init-btn {
      background: var(--berserkr-color-cyan-medium);
      color: #fff;
      border-color: #000;
      box-shadow: 2px 2px 0px #000;
      &:hover {
        background: var(--berserkr-color-cyan-vibrant);
        color: #000;
        transform: translate(-1px, -1px);
        box-shadow: 3px 3px 0px #000;
      }
    }
  }
</style>
