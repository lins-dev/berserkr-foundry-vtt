<script lang="ts">
  let { system, updateField } = $props<{
    system: any;
    updateField: (path: string, value: any) => void;
  }>();
</script>

<div class="background-content">
  <textarea 
    class="background-textarea" 
    placeholder="Character background, description, history..."
    value={system.background}
    onchange={(e) => updateField("system.background", e.currentTarget.value)}
    aria-label="Character Background"
  ></textarea>
</div>

<style lang="scss">
  .background-textarea {
    width: 100%;
    height: 450px;
    background: rgba(255,255,255,0.4);
    border: 2px solid rgba(0,0,0,0.15);
    padding: 1rem;
    outline: none;
    font-family: inherit;
    line-height: 1.8;
    color: var(--berserkr-color-black);
  }
</style>
