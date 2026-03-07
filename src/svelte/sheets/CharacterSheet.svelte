<script lang="ts">
  import type { BerserkrActor } from "../../module/documents/actor";
  import { tick } from "svelte";
  
  import ActorHeader from "../components/actor/ActorHeader.svelte";
  import AttributesRow from "../components/actor/AttributesRow.svelte";
  import TabNavigation from "../components/shared/TabNavigation.svelte";
  import ViolenceTab from "../components/actor/ViolenceTab.svelte";
  import EquipmentTab from "../components/actor/EquipmentTab.svelte";
  import BackgroundTab from "../components/actor/BackgroundTab.svelte";

  let { actor, context } = $props<{
    actor: BerserkrActor;
    context: any;
  }>();

  let system = $derived(actor.system as any);
  let weapons = $derived(actor.items.filter(i => i.type === "weapon"));
  let armors = $derived(actor.items.filter(i => i.type === "armor"));
  let runes = $derived(actor.items.filter(i => i.type === "rune"));
  let gear = $derived(actor.items.filter(i => i.type === "gear"));

  let inventoryLimit = $derived(system.abilities.might.mod + 8);
  let currentLoad = $derived(actor.items.reduce((acc, i) => {
    const itemSys = i.system as any;
    return acc + ((itemSys.quantity || 1) * (itemSys.weight || 0));
  }, 0));
  let isOverloaded = $derived(currentLoad > inventoryLimit);

  let activeTab = $state("violence");
  let scrollContainer: HTMLElement;

  const tabs = [
    { id: "violence", label: "Violence" },
    { id: "equipment", label: "Equipment" },
    { id: "special", label: "Special" },
    { id: "background", label: "Background" }
  ];

  $effect(() => {
    if (context?.activeTab) activeTab = context.activeTab;
    if (scrollContainer && typeof context?.scrollTop === "number") {
      tick().then(() => { scrollContainer.scrollTop = context.scrollTop; });
    }
  });

  const setTab = (id: string) => {
    activeTab = id;
    const sheet = (actor as any).sheet;
    if (sheet && typeof sheet.setTab === "function") sheet.setTab(id);
  };

  const updateField = (path: string, value: any) => {
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

  const toggleEquip = async (item: any) => {
    saveScroll();
    const isShield = (item.system as any).isShield;
    const isEquipping = !(item.system as any).equipped;

    if (isEquipping) {
      const conflicts = actor.items.filter(i => 
        i.type === "armor" && (i.system as any).isShield === isShield && 
        (i.system as any).equipped && i.id !== item.id
      );
      if (conflicts.length > 0) {
        const updates = conflicts.map(i => ({ _id: i.id, "system.equipped": false }));
        // @ts-ignore
        await actor.updateEmbeddedDocuments("Item", updates);
      }
    }
    await item.update({ "system.equipped": isEquipping });
  };

  const updateRuneUses = async (item: any, delta: number) => {
    saveScroll();
    const uses = (item.system as any).uses;
    const newVal = Math.clamp(uses.value + delta, 0, uses.max);
    await item.update({ "system.uses.value": newVal });
  };

  const postItemChat = async (item: any) => {
    const itemSys = item.system as any;
    // @ts-ignore
    const render = foundry.applications.handlebars?.renderTemplate ?? renderTemplate;
    // @ts-ignore
    const ChatMessageClass = foundry.documents?.BaseChatMessage ?? ChatMessage;

    const templateData = {
      actorId: actor.id, itemId: item.id, itemName: item.name, itemImg: item.img, system: itemSys,
      hasQuantity: typeof itemSys.quantity !== "undefined",
      hasWeight: typeof itemSys.weight !== "undefined",
      hasCost: typeof itemSys.cost !== "undefined",
      hasUses: itemSys.uses && (itemSys.uses.max > 0)
    };

    const content = await render("systems/berserkr/templates/chat/item-card.hbs", templateData);
    // @ts-ignore
    ChatMessageClass.create({
      user: (game as any).user.id, speaker: ChatMessage.getSpeaker({ actor }), content: content,
      style: (CONST as any).CHAT_MESSAGE_STYLES?.OTHER ?? (CONST as any).CHAT_MESSAGE_TYPES?.OTHER
    });
  };

  const rollAttribute = async (attributeName: string) => {
    const mod = system.abilities[attributeName].mod;
    let penalty = 0;
    let penaltySource = "";

    if (attributeName === "swift") { penalty = system.derived.swiftPenalty; penaltySource = "Armor/Overload"; }
    else if (attributeName === "might") { penalty = system.derived.mightPenalty; penaltySource = "Overload"; }

    // @ts-ignore
    const RollClass = foundry.dice?.Roll ?? Roll;
    // @ts-ignore
    const render = foundry.applications.handlebars?.renderTemplate ?? renderTemplate;
    // @ts-ignore
    const ChatMessageClass = foundry.documents?.BaseChatMessage ?? ChatMessage;

    const roll = new RollClass(`1d20 + ${mod}`);
    await roll.evaluate();

    const d20 = roll.terms[0].results[0].result;
    let flavor = `Test: ${attributeName.toUpperCase()}`;
    if (penalty > 0) flavor += ` (+${penalty} DR from ${penaltySource})`;

    const templateData = {
      actorId: actor.id, title: "Attribute Test", total: roll.total, formula: roll.formula,
      tooltip: await roll.getTooltip(), flavor: flavor, isCrit: d20 === 20, isFumble: d20 === 1
    };

    const content = await render("systems/berserkr/templates/chat/test-card.hbs", templateData);
    // @ts-ignore
    ChatMessageClass.create({
      user: (game as any).user.id, speaker: ChatMessage.getSpeaker({ actor }), content: content, rolls: [roll],
      style: (CONST as any).CHAT_MESSAGE_STYLES?.OTHER ?? (CONST as any).CHAT_MESSAGE_TYPES?.OTHER
    });
  };

  const rollAttack = async (weapon: any) => {
    const attribute = weapon.system.isRanged ? "guile" : "might";
    const mod = system.abilities[attribute].mod;
    
    // @ts-ignore
    const RollClass = foundry.dice?.Roll ?? Roll;
    // @ts-ignore
    const render = foundry.applications.handlebars?.renderTemplate ?? renderTemplate;
    // @ts-ignore
    const ChatMessageClass = foundry.documents?.BaseChatMessage ?? ChatMessage;

    const roll = new RollClass(`1d20 + ${mod}`);
    await roll.evaluate();

    const d20 = roll.terms[0].results[0].result;
    const templateData = {
      actorId: actor.id, itemId: weapon.id, title: weapon.name, itemImg: weapon.img,
      total: roll.total, formula: roll.formula, tooltip: await roll.getTooltip(),
      flavor: `Attack (${attribute})`, isCrit: d20 === 20, isFumble: d20 === 1
    };

    const content = await render("systems/berserkr/templates/chat/test-card.hbs", templateData);
    // @ts-ignore
    ChatMessageClass.create({
      user: (game as any).user.id, speaker: ChatMessage.getSpeaker({ actor }), content: content, rolls: [roll],
      style: (CONST as any).CHAT_MESSAGE_STYLES?.OTHER ?? (CONST as any).CHAT_MESSAGE_TYPES?.OTHER
    });
  };

  const rollDamage = async (weapon: any) => {
    const damages = weapon.system.damages;
    if (!damages || damages.length === 0) return;

    // @ts-ignore
    const RollClass = foundry.dice?.Roll ?? Roll;
    // @ts-ignore
    const render = foundry.applications.handlebars?.renderTemplate ?? renderTemplate;
    // @ts-ignore
    const ChatMessageClass = foundry.documents?.BaseChatMessage ?? ChatMessage;

    const rollsData = [];
    let totalDamage = 0;

    for (let dmg of damages) {
      const formula = `${dmg.dieCount}${dmg.dieType}${dmg.modifier ? (dmg.modifier > 0 ? "+" + dmg.modifier : dmg.modifier) : ""}`;
      const roll = new RollClass(formula);
      await roll.evaluate();
      totalDamage += roll.total;
      rollsData.push({ formula, total: roll.total, type: dmg.type, tooltip: await roll.getTooltip(), roll });
    }

    const templateData = {
      actorId: actor.id, itemId: weapon.id, itemName: weapon.name, itemImg: weapon.img,
      totalDamage, rolls: rollsData
    };

    const content = await render("systems/berserkr/templates/chat/damage-card.hbs", templateData);
    // @ts-ignore
    ChatMessageClass.create({
      user: (game as any).user.id, speaker: ChatMessage.getSpeaker({ actor }), content, rolls: rollsData.map(r => r.roll),
      style: (CONST as any).CHAT_MESSAGE_STYLES?.OTHER ?? (CONST as any).CHAT_MESSAGE_TYPES?.OTHER
    });
  };
</script>

<div class="berserkr-sheet-v2">
  <header class="sheet-header">
    <ActorHeader {actor} {system} {updateField} />
    <AttributesRow {system} {updateField} {rollAttribute} />
  </header>

  <TabNavigation {tabs} {activeTab} onTabChange={setTab} />

  <section class="tab-content" bind:this={scrollContainer} onscroll={saveScroll}>
    {#if activeTab === "violence"}
      <ViolenceTab {system} {weapons} {rollAttack} {rollDamage} />
    {:else if activeTab === "equipment"}
      <EquipmentTab 
        {actor} {weapons} {armors} {runes} {gear} 
        {currentLoad} {inventoryLimit} {isOverloaded}
        {createItem} {toggleEquip} {postItemChat} {updateRuneUses}
      />
    {:else if activeTab === "special"}
      <div class="special-placeholder">
        <p>Special abilities coming soon...</p>
      </div>
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
  }
</style>
