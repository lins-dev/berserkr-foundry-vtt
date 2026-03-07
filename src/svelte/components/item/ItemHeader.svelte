<script lang="ts">
  import type { BerserkrItem } from "../../../module/documents/item";

  let { item, type, updateField } = $props<{
    item: BerserkrItem;
    type: string;
    updateField: (path: string, e: Event) => void;
  }>();
</script>

<header class="item-header">
  <div class="portrait-area">
    <button 
      type="button"
      class="portrait-container" 
      onclick={() => (item as any).sheet.editImage()}
      title="Change Image"
    >
      <img src={item.img} alt={item.name} />
    </button>
  </div>

  <div class="item-info">
    <input 
      type="text" 
      class="item-name-input" 
      value={item.name} 
      onchange={(e) => updateField("name", e)}
      placeholder="Item Name"
      aria-label="Item Name"
    >
    <div class="item-type-badge">{type.toUpperCase()}</div>
  </div>
</header>

<style lang="scss">
  .item-header {
    display: flex;
    gap: 1rem;
    align-items: center;
    background: var(--berserkr-color-cyan-medium);
    padding: 0.8rem;
    color: var(--berserkr-color-white);
    border-radius: 4px;

    .portrait-container {
      width: 60px;
      height: 60px;
      background: rgba(0,0,0,0.2);
      border: 2px solid var(--berserkr-color-cyan-vibrant);
      border-radius: 4px;
      cursor: pointer;
      img { width: 100%; height: 100%; object-fit: cover; }
      padding: 0;
      margin: 0;
      display: block;
    }

    .item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;

      .item-name-input {
        font-family: var(--berserkr-font-display, 'Norse', serif);
        font-size: 1.8rem;
        color: var(--berserkr-color-cyan-vibrant);
        background: transparent;
        border: none;
        border-bottom: 2px solid var(--berserkr-color-cyan-vibrant);
        outline: none;
      }

      .item-type-badge {
        font-family: var(--berserkr-font-display, 'Norse', serif);
        font-size: 0.8rem;
        background: rgba(0, 184, 200, 0.2);
        color: var(--berserkr-color-cyan-vibrant);
        padding: 2px 8px;
        border-radius: 4px;
        width: fit-content;
        letter-spacing: 1px;
      }
    }
  }
</style>
