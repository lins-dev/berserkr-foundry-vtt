/**
 * Custom Item class for Berserkr
 */
export class BerserkrItem extends Item {
  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();

    // Auto-translate name if it's a localization key
    if (this.name?.startsWith("BERSERKR.")) {
      // @ts-ignore
      this.name = game.i18n.localize(this.name);
    }

    // Auto-translate description if it's a localization key
    const system = this.system as any;
    if (system.description?.startsWith("BERSERKR.")) {
      // @ts-ignore
      system.description = game.i18n.localize(system.description);
    }
  }
}
