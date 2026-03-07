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
      defenseDR: 12,
      armorReduction: "0",
    };

    // Calculate Armor Penalties and Reductions
    const equippedArmor = this.items.find(i => i.type === "armor" && (i.system as any).equipped);
    if (equippedArmor) {
      const armorSys = equippedArmor.system as any;
      
      // Swift Penalty
      if (armorSys.tier === 3) system.derived.swiftPenalty = 2;
      if (armorSys.tier === 4) system.derived.swiftPenalty = 4;

      // Defense DR (Tier 3 and 4 make Defense DR+2)
      if (armorSys.tier >= 3) system.derived.defenseDR = 14;

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
