<script lang="ts">
  import type { BerserkrActor } from "../../module/documents/actor";
  import { tick } from "svelte";
  
  /* Import Components */
  import ActorHeader from "../components/actor/ActorHeader.svelte";
  import AttributesRow from "../components/actor/AttributesRow.svelte";
  import TabNavigation from "../components/shared/TabNavigation.svelte";
  import ViolenceTab from "../components/actor/ViolenceTab.svelte";
  import EquipmentTab from "../components/actor/EquipmentTab.svelte";
  import SpecialTab from "../components/actor/SpecialTab.svelte";
  import BackgroundTab from "../components/actor/BackgroundTab.svelte";

  let { actor, context } = $props<{
    actor: BerserkrActor;
    context: any;
  }>();

  /* Derived Data */
  let system = $derived(actor.system as any);
  let weapons = $derived(actor.items.filter(i => i.type === "weapon"));
  let armors = $derived(actor.items.filter(i => i.type === "armor"));
  let runes = $derived(actor.items.filter(i => i.type === "rune"));
  let gear = $derived(actor.items.filter(i => i.type === "gear"));
  let feats = $derived(actor.items.filter(i => i.type === "feat"));

  let inventoryLimit = $derived(system.abilities.might.mod + 8);
  let currentLoad = $derived(actor.items.reduce((acc, i) => {
    const itemSys = i.system as any;
    return acc + ((itemSys.quantity || 1) * (itemSys.weight || 0));
  }, 0));
  let isOverloaded = $derived(currentLoad > inventoryLimit);

  /* UI State */
  let activeTab = $state("violence");
  let scrollContainer: HTMLElement;

  const tabs = [
    { id: "violence", label: "Violence" },
    { id: "equipment", label: "Equipment" },
    { id: "special", label: "Special" },
    { id: "background", label: "Background" }
  ];

  /* Sync Logic */
  $effect(() => {
    if (context?.activeTab) activeTab = context.activeTab;
    if (scrollContainer && typeof context?.scrollTop === "number") {
      tick().then(() => { scrollContainer.scrollTop = context.scrollTop; });
    }
  });

  /* Shared Handlers */
  const setTab = (id: string) => {
    activeTab = id;
    const sheet = (actor as any).sheet;
    if (sheet && typeof sheet.setTab === "function") sheet.setTab(id);
  };

  const updateField = (path: string, value: any) => {
    saveScroll();
    actor.update({ [path]: value });
  };

  const saveScroll = () => {
    if (scrollContainer) {
      const sheet = (actor as any).sheet;
      if (sheet && typeof sheet.updateScroll === "function") {
        sheet.updateScroll(scrollContainer.scrollTop);
      }
    }
  };

  const createItem = async (type: string) => {
    saveScroll();
    const data = {
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type: type,
      img: `icons/svg/item-bag.svg`
    };
    // @ts-ignore
    await actor.createEmbeddedDocuments("Item", [data]);
  };
</script>

<div class="berserkr-sheet-v2">
  <header class="sheet-header">
    <ActorHeader {actor} {system} {updateField} />
    <AttributesRow {system} {actor} {updateField} />
  </header>

  <TabNavigation {tabs} {activeTab} onTabChange={setTab} />

  <section class="tab-content" bind:this={scrollContainer} onscroll={saveScroll}>
    {#if activeTab === "violence"}
      <ViolenceTab {system} {actor} {weapons} />
    {:else if activeTab === "equipment"}
      <EquipmentTab 
        {actor} {weapons} {armors} {runes} {gear} 
        {currentLoad} {inventoryLimit} {isOverloaded}
        {saveScroll}
      />
    {:else if activeTab === "special"}
      <SpecialTab {actor} {system} {runes} {feats} {createItem} />
    {:else if activeTab === "background"}
      <BackgroundTab {system} {updateField} />
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
    height: 100%;
    overflow: hidden;
    border: 3px solid var(--berserkr-color-black);
    box-shadow: 0 0 20px rgba(0,0,0,0.2);
    flex: 1;
  }

  .sheet-header {
    background: var(--berserkr-color-cyan-medium);
    padding: 1rem;
    color: var(--berserkr-color-white);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    flex-shrink: 0;
  }

  .tab-content {
    flex: 1;
    padding: 1.5rem;
    background: var(--berserkr-bg-card);
    overflow-y: auto;
    color: var(--berserkr-color-black);
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
</style>
