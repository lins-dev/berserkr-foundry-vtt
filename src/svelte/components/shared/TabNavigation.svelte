<script lang="ts">
  let { tabs, activeTab, onTabChange } = $props<{
    tabs: { id: string, label: string }[];
    activeTab: string;
    onTabChange: (id: string) => void;
  }>();
</script>

<nav class="tabs-bar">
  {#each tabs as tab}
    <button 
      type="button"
      class="tab-btn" 
      class:active={activeTab === tab.id} 
      onclick={() => onTabChange(tab.id)}
    >
      {tab.label}
    </button>
  {/each}
</nav>

<style lang="scss">
  .tabs-bar {
    display: flex;
    background: var(--berserkr-bg-secondary);
    border-bottom: 2px solid var(--berserkr-color-cyan-medium);
    flex-shrink: 0;
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
</style>
