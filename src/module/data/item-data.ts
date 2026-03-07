/**
 * Base Data Model for Berserkr Items
 */
export class BerserkrItemBaseData extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.HTMLField(),
      quantity: new fields.NumberField({ initial: 1, integer: true, min: 0, max: 9999 }),
      weight: new fields.NumberField({ initial: 0, min: 0, max: 99 }),
      cost: new fields.NumberField({ initial: 0, min: 0, max: 9999999.99 }),
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
      damages: new fields.ArrayField(
        new fields.SchemaField({
          dieCount: new fields.NumberField({ initial: 1, integer: true, min: 1, max: 10 }),
          dieType: new fields.StringField({ initial: "d4" }),
          modifier: new fields.NumberField({ initial: 0, integer: true, min: -100, max: 100 }),
          type: new fields.StringField({ initial: "physical" }),
        }),
        { 
          initial: [{ dieCount: 1, dieType: "d4", modifier: 0, type: "physical" }],
          validate: (val: any[]) => val.length <= 5 
        }
      ),
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
      reduction: new fields.SchemaField({
        dieCount: new fields.NumberField({ initial: 1, integer: true, min: 1, max: 10 }),
        dieType: new fields.StringField({ initial: "d2" }),
      }),
      isShield: new fields.BooleanField({ initial: false }),
      equipped: new fields.BooleanField({ initial: false }),
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
        value: new fields.NumberField({ initial: 0, integer: true, min: 0, max: 100 }),
        max: new fields.NumberField({ initial: 0, integer: true, min: 0, max: 100 }),
      }),
      set: new fields.NumberField({ initial: 1, integer: true, min: 1, max: 3 }),
    };
  }
}
