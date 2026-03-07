<script lang="ts">
  import type { BerserkrItem } from "../../module/documents/item";
  
  import ItemHeader from "../components/item/ItemHeader.svelte";
  import ItemCommonProps from "../components/item/ItemCommonProps.svelte";
  import WeaponProps from "../components/item/WeaponProps.svelte";
  import ArmorProps from "../components/item/ArmorProps.svelte";
  import RuneProps from "../components/item/RuneProps.svelte";
  import ItemDescription from "../components/item/ItemDescription.svelte";

  let { item, context } = $props<{
    item: BerserkrItem;
    context: any;
  }>();

  let system = $derived(item.system as any);
  let type = $derived(item.type);

  const ALLOWED_DICE = ["d2", "d3", "d4", "d6", "d8", "d10", "d12", "d20", "d100"];

  const updateField = (path: string, e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    let value: any = input.value;
    let finalValue = value;

    if (input.type === "number" || path.includes("quantity") || path.includes("weight") || path.includes("cost") || path.includes("uses")) {
      if (path.includes("quantity")) finalValue = Math.clamp(parseInt(value) || 0, 0, 9999);
      if (path.includes("weight")) finalValue = parseFloat(Math.clamp(parseFloat(value) || 0, 0, 99).toFixed(2));
      if (path.includes("cost")) finalValue = parseFloat(Math.clamp(parseFloat(value) || 0, 0, 9999999.99).toFixed(2));
      if (path.includes("tier")) finalValue = Math.clamp(parseInt(value) || 1, 1, 4);
      if (path.includes("range")) finalValue = Math.clamp(parseInt(value) || 0, 0, 9999);
      if (path.includes("uses")) finalValue = Math.clamp(parseInt(value) || 0, 0, 100);
      if (path.includes("set")) finalValue = Math.clamp(parseInt(value) || 1, 1, 3);
      input.value = finalValue.toString();
    }
    item.update({ [path]: finalValue });
  };

  const updateCheckbox = (path: string, e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    item.update({ [path]: input.checked });
  };

  const addDamage = () => {
    if (system.damages.length < 5) {
      const newDamages = [...system.damages, { dieCount: 1, dieType: "d4", modifier: 0, type: "physical" }];
      item.update({ "system.damages": newDamages });
    }
  };

  const removeDamage = (index: number) => {
    if (system.damages.length > 1) {
      const newDamages = system.damages.filter((_, i) => i !== index);
      item.update({ "system.damages": newDamages });
    }
  };

  const updateDamage = (index: number, key: string, e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    let value: any = input.value;
    let finalValue = value;

    if (key === "dieCount") finalValue = Math.clamp(parseInt(value) || 1, 1, 10);
    if (key === "modifier") finalValue = Math.clamp(parseInt(value) || 0, -100, 100);
    if (key === "dieType") finalValue = ALLOWED_DICE.includes(value) ? value : "d4";
    if (key === "type") finalValue = String(value).slice(0, 50);

    if (key !== "dieType") input.value = finalValue.toString();

    const newDamages = system.damages.map((dmg: any, i: number) => i === index ? { ...dmg, [key]: finalValue } : dmg);
    item.update({ "system.damages": newDamages });
  };

  const updateReduction = (key: string, e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    let value: any = input.value;
    let finalValue = value;

    if (key === "dieCount") finalValue = Math.clamp(parseInt(value) || 1, 1, 10);
    if (key === "dieType") finalValue = ALLOWED_DICE.includes(value) ? value : "d4";
    if (key !== "dieType") input.value = finalValue.toString();

    item.update({ [`system.reduction.${key}`]: finalValue });
  };
</script>

<div class="berserkr-item-sheet">
  <ItemHeader {item} {type} {updateField} />

  <section class="item-properties">
    <ItemCommonProps {item} {system} {updateField} />

    {#if type === "weapon"}
      <WeaponProps {item} {system} {updateField} {updateCheckbox} {addDamage} {removeDamage} {updateDamage} />
    {:else if type === "armor"}
      <ArmorProps {item} {system} {updateField} {updateCheckbox} {updateReduction} />
    {:else if type === "rune"}
      <RuneProps {item} {system} {updateField} />
    {/if}
  </section>

  <ItemDescription {item} {system} {updateField} />
</div>

<style lang="scss">
  .berserkr-item-sheet {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
    background: var(--berserkr-color-cyan-light);
    height: 100%;
    font-family: var(--berserkr-font-text, 'Alegreya', serif);
    color: var(--berserkr-color-black);

    .item-properties {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>
