/**
 * Base Data Model for Berserkr Items
 */
export class BerserkrItemBaseData extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.HTMLField(),
      quantity: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
      weight: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      cost: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
    };
  }
}

/**
 * Data Model for Weapons
 */
export class BerserkrWeaponData extends BerserkrItemBaseData {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      damage: new fields.StringField({ initial: "d4" }),
      damageType: new fields.StringField({ initial: "physical" }),
      isRanged: new fields.BooleanField({ initial: false }),
      range: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
    };
  }
}

/**
 * Data Model for Armor
 */
export class BerserkrArmorData extends BerserkrItemBaseData {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      tier: new fields.NumberField({ initial: 1, integer: true, min: 1, max: 4 }),
      reduction: new fields.StringField({ initial: "0" }),
      isShield: new fields.BooleanField({ initial: false }),
    };
  }
}

/**
 * Data Model for Runes
 */
export class BerserkrRuneData extends BerserkrItemBaseData {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      uses: new fields.SchemaField({
        value: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
        max: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      }),
      set: new fields.NumberField({ initial: 1, integer: true, min: 1, max: 2 }),
    };
  }
}
