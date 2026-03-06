<script lang="ts">
  import type { BerserkrActor } from "../../module/documents/actor";

  let { actor, context } = $props<{
    actor: BerserkrActor;
    context: any;
  }>();

  let system = $derived(actor.system as any);
  let activeTab = $state("background");

  const tabs = [
    { id: "background", label: "Background" },
    { id: "equipment", label: "Equipment" },
    { id: "violence", label: "Violence" },
    { id: "special", label: "Special" }
  ];

  const updateField = (path: string, value: any) => {
    actor.update({ [path]: value });
  };
</script>

<div class="berserkr-sheet-v2">
  <!-- ====== HEADER ====== -->
  <header class="sheet-header">
    <!-- Portrait -->
    <div class="portrait-area">
      <div class="portrait-container" onclick={() => (actor as any).sheet.editImage()}>
        <img src={actor.img} alt={actor.name} title={actor.name} />
      </div>
    </div>

    <!-- Character Info -->
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

    <!-- Attributes Sidebar -->
    <div class="attributes-sidebar">
      {#each Object.entries(system.abilities) as [key, abl]}
        <div class="attr-item">
          <input 
            type="number" 
            class="attr-value-input" 
            value={(abl as any).value} 
            onchange={(e) => updateField(`system.abilities.${key}.value`, parseInt(e.currentTarget.value))}
          >
          <span class="attr-label">{key.slice(0, 3).toUpperCase()}</span>
          <span class="attr-mod">{(abl as any).mod >= 0 ? "+" : ""}{(abl as any).mod}</span>
        </div>
      {/each}
    </div>
  </header>

  <!-- ====== TABS ====== -->
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

  <!-- ====== TAB CONTENT ====== -->
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
  @import url('https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&family=IM+Fell+English+SC&family=Inter:wght@400;700&display=swap');

  :host {
    --bg-primary: #b8e8ee;
    --bg-secondary: #a0dce4;
    --bg-card: #cdf0f4;
    --accent: #00b8c8;
    --black: #0a0a0a;
    --white: #ffffff;
    --font-gothic: 'UnifrakturMaguntia', cursive;
    --font-fell: 'IM Fell English SC', serif;
    --font-ui: 'Inter', sans-serif;
  }

  .berserkr-sheet-v2 {
    display: flex;
    flex-direction: column;
    background: #b8e8ee;
    color: #111;
    font-family: 'Inter', sans-serif;
    min-height: 600px;
    border: 3px solid #0a0a0a;
    box-shadow: 0 0 20px rgba(0,0,0,0.2);
  }

  .sheet-header {
    display: grid;
    grid-template-columns: 140px 1fr 120px;
    background: #0a0a0a;
    padding: 1rem;
    color: #fff;
    border-bottom: 3px solid #0a0a0a;
  }

  .portrait-container {
    width: 120px;
    height: 140px;
    background: #151520;
    border: 2px solid #333;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    img { width: 100%; height: 100%; object-fit: cover; }
  }

  .char-info {
    padding: 0 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .char-name-input {
    font-family: 'UnifrakturMaguntia', cursive;
    font-size: 2.2rem;
    color: #fff;
    background: transparent;
    border: none;
    border-bottom: 2px solid #00b8c8;
    outline: none;
    width: 100%;
  }

  .char-class-row {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    label { font-family: 'UnifrakturMaguntia', cursive; font-size: 1.4rem; color: #ddd; }
    input { background: transparent; border: none; border-bottom: 1px solid #555; color: #ddd; flex: 1; outline: none; }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .stat-field {
    display: flex;
    align-items: baseline;
    gap: 0.3rem;
    label { font-family: 'UnifrakturMaguntia', cursive; color: #ddd; }
    input { width: 40px; background: transparent; border: none; border-bottom: 2px solid #00b8c8; color: #fff; text-align: center; outline: none; }
  }

  .action-buttons {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .btn {
    font-size: 0.65rem;
    font-weight: bold;
    padding: 4px 8px;
    background: transparent;
    border: 1px solid #555;
    color: #ddd;
    cursor: pointer;
    &:hover { border-color: #00b8c8; color: #fff; background: rgba(0,184,200,0.1); }
  }

  .attributes-sidebar {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-end;
  }

  .attr-item {
    display: flex;
    align-items: center;
    gap: 6px;
    .attr-label { font-family: 'UnifrakturMaguntia', cursive; font-size: 1.2rem; color: #00b8c8; min-width: 45px; text-align: right; }
    input { width: 30px; background: transparent; border: none; color: #ddd; text-align: right; font-weight: bold; outline: none; }
    .attr-mod { color: #fff; font-weight: 900; min-width: 25px; }
  }

  .tabs-bar {
    display: flex;
    background: #a0dce4;
    border-bottom: 2px solid #0a0a0a;
  }

  .tab-btn {
    flex: 1;
    font-family: 'UnifrakturMaguntia', cursive;
    font-size: 1.2rem;
    padding: 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    &.active { background: #cdf0f4; border-bottom: 3px solid #0a0a0a; }
  }

  .tab-content {
    flex: 1;
    padding: 1rem;
    background: #cdf0f4;
    min-height: 300px;
  }

  .background-textarea {
    width: 100%;
    height: 250px;
    background: rgba(255,255,255,0.3);
    border: 2px solid rgba(0,0,0,0.1);
    padding: 1rem;
    outline: none;
    font-family: inherit;
    line-height: 1.6;
  }
</style>
