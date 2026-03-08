/**
 * Data Model for Berserkr Actors
 */
export class BerserkrCharacterData extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.HTMLField(),
      class: new fields.StringField({ initial: "" }),
      background: new fields.HTMLField(),
      abilities: new fields.SchemaField({
        fortitude: new fields.SchemaField({ value: new fields.NumberField({ initial: 0, integer: true }) }),
        might: new fields.SchemaField({ value: new fields.NumberField({ initial: 0, integer: true }) }),
        guile: new fields.SchemaField({ value: new fields.NumberField({ initial: 0, integer: true }) }),
        swift: new fields.SchemaField({ value: new fields.NumberField({ initial: 0, integer: true }) }),
        wits: new fields.SchemaField({ value: new fields.NumberField({ initial: 0, integer: true }) }),
      }),
      hp: new fields.SchemaField({
        value: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
        max: new fields.NumberField({ initial: 1, integer: true, min: 1 }),
      }),
      silver: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      runeUses: new fields.SchemaField({
        value: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
        max: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      }),
      sagas: new fields.HTMLField({ initial: "" }),
      improvementCount: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      fates: new fields.SchemaField({
        value: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
        max: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      }),
    };
  }
}
