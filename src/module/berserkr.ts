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

  // Configure Initiative
  CONFIG.Combat.initiative = {
    formula: "1d6 + @abilities.swift.mod",
    decimals: 0
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

  // Auto-organize compendiums into folders if user is GM
  if (game.user.isGM) {
    const packGroups = {
      "Berserkr: Items": ["berserkr-basic-weapons", "berserkr-special-weapons", "berserkr-armors", "berserkr-gear", "berserkr-runes", "berserkr-legendary-items"],
      "Berserkr: Feats": [
        "berserkr-feats-berserkr", "berserkr-feats-valkyrie", "berserkr-feats-vanir-warden",
        "berserkr-feats-frost-jotunn", "berserkr-feats-light-elf", "berserkr-feats-master-smith",
        "berserkr-feats-wraith", "berserkr-feats-flame-construct", "berserkr-feats-soul-shepherd",
        "berserkr-feats-realmbreaker"
      ],
      "Berserkr: Tables": ["berserkr-tables-creation", "berserkr-tables-rules", "berserkr-tables-divine"],
      "Berserkr: Realms": [
        "berserkr-tables-midgard", "berserkr-tables-asgard", "berserkr-tables-vanaheim",
        "berserkr-tables-jotunheim", "berserkr-tables-alfheim", "berserkr-tables-svartalfheim",
        "berserkr-tables-niflheim", "berserkr-tables-muspelheim", "berserkr-tables-helheim"
      ]
    };

    for (const [folderName, packNames] of Object.entries(packGroups)) {
      let folder = game.folders.find(f => f.name === folderName && f.type === "Compendium");
      if (!folder) {
        // @ts-ignore
        folder = await Folder.create({ name: folderName, type: "Compendium", color: "#004D56" });
      }

      for (const packName of packNames) {
        const pack = game.packs.get(`berserkr.${packName}`);
        if (pack && !pack.folder) {
          await pack.configure({ folder: folder.id });
        }
      }
    }
  }
});
