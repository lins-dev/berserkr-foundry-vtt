<script lang="ts">
  let { item, system, updateField } = $props<{
    item: any;
    system: any;
    updateField: (path: string, e: Event) => void;
  }>();
</script>

<section class="item-description">
  <label for="{item.id}-description" class="section-label">Description</label>
  <textarea 
    id="{item.id}-description"
    value={system.description}
    onchange={(e) => updateField("system.description", e)}
    placeholder="Enter item description..."
  ></textarea>
</section>

<style lang="scss">
  .item-description {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .section-label {
      font-family: var(--berserkr-font-display, 'Norse', serif);
      font-size: 1.2rem;
      color: var(--berserkr-color-cyan-medium);
    }

    textarea {
      width: 100%;
      height: 150px;
      background: rgba(255, 255, 255, 0.4);
      border: 2px solid rgba(0, 0, 0, 0.1);
      padding: 0.8rem;
      resize: vertical;
      outline: none;
      color: var(--berserkr-color-black);
      line-height: 1.6;
    }
  }
</style>
