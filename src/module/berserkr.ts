/**
 * Berserkr System
 * Author: Lucas Lins
 */

import "../styles/berserkr.scss";
import { BerserkrCharacterData } from "./data/character-data";
import { BerserkrWeaponData, BerserkrArmorData, BerserkrRuneData, BerserkrItemBaseData, BerserkrFeatData } from "./data/item-data";
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
    feat: BerserkrFeatData,
  };

  // @ts-ignore
  const ActorSheetClass = foundry.applications.sheets?.ActorSheetV2 ?? foundry.applications.api.ActorSheetV2;
  // @ts-ignore
  const ItemSheetClass = foundry.applications.sheets?.ItemSheetV2 ?? foundry.applications.api.ItemSheetV2;
  // @ts-ignore
  const SheetConfig = foundry.applications.apps?.DocumentSheetConfig ?? DocumentSheetConfig;

  // Registro de Fichas
  SheetConfig.unregisterSheet(Actor, "core", ActorSheetClass);
  SheetConfig.registerSheet(Actor, "berserkr", BerserkrActorSheet, {
    types: ["character"],
    makeDefault: true,
    label: "Berserkr Character Sheet",
  });

  SheetConfig.unregisterSheet(Item, "core", ItemSheetClass);
  SheetConfig.registerSheet(Item, "berserkr", BerserkrItemSheet, {
    makeDefault: true,
    label: "Berserkr Item Sheet",
  });
});

Hooks.once("ready", async () => {
  console.log("BERSERKR | System Ready");
});
