/**
 * Berserkr System
 * Author: Lucas Lins
 */

import "../styles/berserkr.scss";
import { BerserkrCharacterData } from "./data/character-data";
import { BerserkrWeaponData, BerserkrArmorData, BerserkrRuneData, BerserkrItemBaseData } from "./data/item-data";
import { BerserkrActor } from "./documents/actor";
import { BerserkrItem } from "./documents/item";
import { BerserkrActorSheet } from "./applications/actor-sheet";
import { BerserkrItemSheet } from "./applications/item-sheet";

Hooks.once("init", async () => {
  console.log("BERSERKR | Initializing Berserkr System");

  // Register Document Classes
  CONFIG.Actor.documentClass = BerserkrActor;
  CONFIG.Item.documentClass = BerserkrItem;

  // Register Data Models
  CONFIG.Actor.dataModels.character = BerserkrCharacterData;

  CONFIG.Item.dataModels = {
    weapon: BerserkrWeaponData,
    armor: BerserkrArmorData,
    rune: BerserkrRuneData,
    gear: BerserkrItemBaseData,
  };

  // Register Sheets
  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet("berserkr", BerserkrActorSheet, {
    types: ["character"],
    makeDefault: true,
    label: "Berserkr Character Sheet",
  });

  foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
  foundry.documents.collections.Items.registerSheet("berserkr", BerserkrItemSheet, {
    makeDefault: true,
    label: "Berserkr Item Sheet",
  });
});

Hooks.once("ready", async () => {
  console.log("BERSERKR | System Ready");
});
