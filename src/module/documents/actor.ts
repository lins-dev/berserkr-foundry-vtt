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
