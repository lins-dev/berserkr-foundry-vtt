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
});

Hooks.once("ready", async () => {
  console.log("BERSERKR | System Ready");
});
