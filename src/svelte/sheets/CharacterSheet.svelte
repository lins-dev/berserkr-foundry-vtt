<script lang="ts">
  import type { BerserkrActor } from "../../module/documents/actor";

  let { actor, context } = $props<{
    actor: BerserkrActor;
    context: any;
  }>();

  let system = $derived(actor.system as any);
  let activeTab = $state("violence");

  const tabs = [
    { id: "violence", label: "Violence" },
    { id: "equipment", label: "Equipment" },
    { id: "special", label: "Special" },
    { id: "background", label: "Background" }
  ];

  const updateField = (path: string, value: any) => {
    actor.update({ [path]: value });
  };
</script>

<div class="berserkr-sheet-v2">
  <header class="sheet-header">
    <div class="header-main">
      <div class="portrait-area">
        <div class="portrait-container" onclick={() => (actor as any).sheet.editImage()}>
          <img src={actor.img} alt={actor.name} title={actor.name} />
        </div>
      </div>

      <div class="char-info">
        <input 
          type="text" 
          class="char-name-input" 
          value={actor.name} 
          onchange={(e) => updateField("name", e.currentTarget.value)}
          placeholder="Character Name"
        >

        <div class="char-class-row">
          <label>Class:</label>
          <input 
            type="text" 
            class="char-class-input" 
            value={system.class} 
            onchange={(e) => updateField("system.class", e.currentTarget.value)}
            placeholder="Enter class..."
          >
        </div>

        <div class="stats-grid">
          <div class="stat-field">
            <label>HP:</label>
            <input type="number" class="stat-input" value={system.hp.value} onchange={(e) => updateField("system.hp.value", parseInt(e.currentTarget.value))}>
            <span class="stat-separator">/</span>
            <input type="number" class="stat-input" value={system.hp.max} onchange={(e) => updateField("system.hp.max", parseInt(e.currentTarget.value))}>
          </div>
          <div class="stat-field">
            <label>Fates:</label>
            <input type="number" class="stat-input" value={system.fates.value} onchange={(e) => updateField("system.fates.value", parseInt(e.currentTarget.value))}>
          </div>
          <div class="stat-field">
            <label>Silver:</label>
            <input type="number" class="stat-input" value={system.silver} onchange={(e) => updateField("system.silver", parseInt(e.currentTarget.value))}>
          </div>
        </div>

        <div class="action-buttons">
          <button class="btn" onclick={() => console.log("Broken")}>BROKEN</button>
          <button class="btn" onclick={() => console.log("Rest")}>REST</button>
          <button class="btn" onclick={() => console.log("Better")}>GET BETTER</button>
        </div>
      </div>
    </div>

    <div class="attributes-row">
      {#each Object.entries(system.abilities) as [key, abl]}
        <div class="attr-item">
          <span class="attr-label">{key.toUpperCase()}</span>
          <div class="attr-values">
            <input 
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
  </header>

  <nav class="tabs-bar">
    {#each tabs as tab}
      <button 
        class="tab-btn" 
        class:active={activeTab === tab.id} 
        onclick={() => activeTab = tab.id}
      >
        {tab.label}
      </button>
    {/each}
  </nav>

  <section class="tab-content">
    {#if activeTab === "background"}
      <textarea 
        class="background-textarea" 
        placeholder="Character background, description, history..."
        value={system.background}
        onchange={(e) => updateField("system.background", e.currentTarget.value)}
      ></textarea>
    {:else if activeTab === "equipment"}
      <div class="equipment-placeholder">
        <p>Equipment management coming soon...</p>
      </div>
    {:else if activeTab === "violence"}
      <div class="violence-placeholder">
        <p>Violence and Combat features coming soon...</p>
      </div>
    {:else if activeTab === "special"}
      <div class="special-placeholder">
        <p>Special abilities coming soon...</p>
      </div>
    {/if}
  </section>
</div>

<style lang="scss">
  .berserkr-sheet-v2 {
    display: flex;
    flex-direction: column;
    background: var(--berserkr-color-cyan-light);
    color: var(--berserkr-color-black);
    font-family: var(--berserkr-font-text, 'Alegreya', serif);
    min-height: 600px;
    border: 3px solid var(--berserkr-color-black);
    box-shadow: 0 0 20px rgba(0,0,0,0.2);
  }

  .sheet-header {
    background: var(--berserkr-color-cyan-medium);
    padding: 1rem;
    color: var(--berserkr-color-white);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

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
      color: var(--berserkr-color-cyan-vibrant); // Cor vibrante igual ao nome
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
      font-size: 1.4rem; // Ajustado para 1.4rem
    }
    input { 
      width: 50px; // Ajustado para 50px
      background: transparent; 
      border: none; 
      border-bottom: 2px solid var(--berserkr-color-cyan-vibrant); 
      color: var(--berserkr-color-white); 
      text-align: center; 
      outline: none;
      font-size: 1.4rem; // Ajustado para 1.4rem
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
    &:hover { 
      border-color: var(--berserkr-color-cyan-vibrant); 
      color: var(--berserkr-color-white); 
      background: rgba(0,229,255,0.1); 
    }
  }

  .attributes-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
    padding: 0.8rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    border: 1px solid var(--berserkr-color-cyan-vibrant);
  }

  .attr-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    .attr-label { 
      font-family: var(--berserkr-font-display, 'Norse', serif); 
      font-size: 1rem; 
      color: var(--berserkr-color-cyan-vibrant);
      letter-spacing: 1px;
    }

    .attr-values {
      display: flex;
      align-items: center;
      gap: 8px;

      input { 
        width: 35px; 
        background: transparent; 
        border: none; 
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        color: var(--berserkr-color-white); 
        text-align: center; 
        font-weight: bold; 
        outline: none;
        font-size: 1.1rem;
        &:focus { border-color: var(--berserkr-color-cyan-vibrant); }
      }

      .attr-mod { 
        color: var(--berserkr-color-white); 
        font-weight: 900; 
        font-size: 1.2rem;
        text-shadow: 0 0 8px var(--berserkr-color-cyan-vibrant);
      }
    }
  }

  .tabs-bar {
    display: flex;
    background: var(--berserkr-bg-secondary);
    border-bottom: 2px solid var(--berserkr-color-cyan-medium);
  }

  .tab-btn {
    flex: 1;
    font-family: var(--berserkr-font-display, 'Norse', serif);
    font-size: 1.2rem;
    padding: 10px;
    border: none;
    background: transparent;
    color: var(--berserkr-color-cyan-medium);
    cursor: pointer;
    &:hover { color: var(--berserkr-color-black); }
    &.active { 
      background: var(--berserkr-bg-card); 
      border-bottom: 3px solid var(--berserkr-color-cyan-medium);
      color: var(--berserkr-color-black);
    }
  }

  .tab-content {
    flex: 1;
    padding: 1.5rem;
    background: var(--berserkr-bg-card);
    min-height: 350px;
  }

  .background-textarea {
    width: 100%;
    height: 300px;
    background: rgba(255,255,255,0.4);
    border: 2px solid rgba(0,0,0,0.15);
    padding: 1rem;
    outline: none;
    font-family: inherit;
    line-height: 1.8;
    color: var(--berserkr-color-black);
  }
</style>
