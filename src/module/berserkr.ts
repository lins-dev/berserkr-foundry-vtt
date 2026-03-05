/**
 * Berserkr System
 * Author: Lucas Lins
 */

import { BerserkrCharacterData } from "./data/character-data";

Hooks.once("init", async () => {
  console.log("BERSERKR | Initializing Berserkr System");

  // Register Data Models
  CONFIG.Actor.dataModels.character = BerserkrCharacterData;

  // TODO: Register Sheets
});

Hooks.once("ready", async () => {
  console.log("BERSERKR | System Ready");
});
