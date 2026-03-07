<script lang="ts">
  let { system, weapons, rollAttack, rollDamage } = $props<{
    system: any;
    weapons: any[];
    rollAttack: (weapon: any) => void;
    rollDamage: (weapon: any) => void;
  }>();
</script>

<div class="violence-content">
  <div class="combat-stats-grid">
    <div class="combat-stat">
      <span class="stat-label">Defense DR</span>
      <span class="stat-value">{system.derived.defenseDR}</span>
    </div>
    <div class="combat-stat">
      <span class="stat-label">Armor Reduction</span>
      <span class="stat-value">{system.derived.armorReduction !== "0" ? "-" : ""}{system.derived.armorReduction}</span>
    </div>
    <div class="combat-stat">
      <span class="stat-label">Might Penalty</span>
      <span class="stat-value" class:penalty={system.derived.mightPenalty > 0}>
        +{system.derived.mightPenalty} DR
      </span>
    </div>
    <div class="combat-stat">
      <span class="stat-label">Swift Penalty</span>
      <span class="stat-value" class:penalty={system.derived.swiftPenalty > 0}>
        +{system.derived.swiftPenalty} DR
      </span>
    </div>
  </div>

  <div class="weapon-section">
    <h3 class="section-title">Weapons</h3>
    <div class="weapons-list">
      {#each weapons as weapon (weapon.id)}
        <div class="weapon-card">
          <button type="button" class="weapon-img" onclick={() => weapon.sheet.render(true)}>
            <img src={weapon.img} alt={weapon.name} />
          </button>
          <div class="weapon-details">
            <div class="weapon-name">{weapon.name}</div>
            <div class="weapon-damage">
              {#each (weapon.system as any).damages as dmg}
                <span class="dmg-tag">{dmg.dieCount}{dmg.dieType}{dmg.modifier ? (dmg.modifier > 0 ? "+" + dmg.modifier : dmg.modifier) : ""} {dmg.type}</span>
              {/each}
            </div>
          </div>
          <div class="roll-buttons">
            <button type="button" class="roll-btn attack" onclick={() => rollAttack(weapon)} title="Roll Attack">
              <i class="fas fa-dice-d20"></i>
            </button>
            <button type="button" class="roll-btn damage" onclick={() => rollDamage(weapon)} title="Roll Damage">
              <i class="fas fa-fire"></i>
            </button>
          </div>
        </div>
      {/each}
      {#if weapons.length === 0}
        <p class="placeholder-text">No weapons equipped.</p>
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  .combat-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .combat-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .stat-label {
    font-family: var(--berserkr-font-display, 'Norse', serif);
    font-size: 1.1rem;
    color: var(--berserkr-color-cyan-medium);
  }

  .stat-value {
    font-family: var(--berserkr-font-display, 'Norse', serif);
    font-size: 1.8rem;
    font-weight: bold;
    color: var(--berserkr-color-black);
  }

  .penalty {
    color: #d00 !important;
    text-shadow: 0 0 5px rgba(200, 0, 0, 0.2);
  }

  .weapon-section {
    margin-top: 1rem;
  }

  .section-title {
    font-family: var(--berserkr-font-display, 'Norse', serif);
    font-size: 1.6rem;
    color: #004D56 !important;
    border-bottom: 2px solid #004D56;
    margin-bottom: 1rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    display: block;
  }

  .weapons-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .weapon-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.4);
    padding: 0.6rem;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.1);

    .weapon-img {
      width: 40px;
      height: 40px;
      background: #122525;
      border: 1px solid var(--berserkr-color-cyan-medium);
      border-radius: 4px;
      padding: 0;
      cursor: pointer;
      img { width: 100%; height: 100%; object-fit: cover; }
    }

    .weapon-details {
      flex: 1;
      .weapon-name { font-weight: bold; font-size: 1.1rem; }
      .weapon-damage { 
        display: flex; 
        flex-wrap: wrap; 
        gap: 4px; 
        .dmg-tag { 
          font-size: 0.75rem; 
          background: var(--berserkr-color-cyan-medium); 
          color: #fff; 
          padding: 1px 6px; 
          border-radius: 10px; 
        }
      }
    }

    .roll-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .roll-btn {
      background: transparent;
      border: 2px solid var(--berserkr-color-cyan-medium);
      color: var(--berserkr-color-cyan-medium);
      width: 34px;
      height: 34px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      
      &:hover { background: var(--berserkr-color-cyan-medium); color: #fff; }
      &.damage { border-color: #d00; color: #d00; &:hover { background: #d00; color: #fff; } }
    }
  }

  .placeholder-text {
    font-style: italic;
    color: #666;
    text-align: center;
    padding: 1rem;
  }
</style>
