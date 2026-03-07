/**
 * Custom Actor class for Berserkr
 */
export class BerserkrActor extends Actor {
  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    const system = this.system as any;

    // Calculate ability modifiers
    for (let abl of Object.values(system.abilities)) {
      (abl as any).mod = this._getModifier((abl as any).value);
    }

    // Initialize derived data
    system.derived = {
      swiftPenalty: 0,
      mightPenalty: 0,
      defenseDR: 12,
      armorReduction: "0",
      currentLoad: 0,
      inventoryLimit: system.abilities.might.mod + 8,
    };

    // Calculate Current Load
    system.derived.currentLoad = this.items.reduce((acc, i) => {
      const itemSys = i.system as any;
      return acc + ((itemSys.quantity || 1) * (itemSys.weight || 0));
    }, 0);

    // Apply Overload Penalty (+2 DR to Might and Swift tests)
    if (system.derived.currentLoad > system.derived.inventoryLimit) {
      system.derived.swiftPenalty += 2;
      system.derived.mightPenalty += 2;
    }

    // Calculate Armor Penalties and Reductions
    const equippedArmor = this.items.find(i => i.type === "armor" && (i.system as any).equipped);
    if (equippedArmor) {
      const armorSys = equippedArmor.system as any;
      const tier = Number(armorSys.tier);
      
      // Swift Penalty from Armor
      if (tier === 3) system.derived.swiftPenalty += 2;
      else if (tier === 4) system.derived.swiftPenalty += 4;

      // Defense DR (Tier 3 and 4 make Defense DR+2)
      if (tier >= 3) system.derived.defenseDR = 14;

      // Armor Reduction String (for UI display)
      system.derived.armorReduction = `${armorSys.reduction.dieCount}${armorSys.reduction.dieType}`;
    }
  }

  /**
   * Calculate modifier based on attribute value
   * @param {number} value
   * @returns {number}
   * @private
   */
  _getModifier(value: number): number {
    if (value <= 4) return -3;
    if (value <= 6) return -2;
    if (value <= 8) return -1;
    if (value <= 12) return 0;
    if (value <= 14) return 1;
    if (value <= 16) return 2;
    if (value <= 20) return 3;
    return 4;
  }
}
