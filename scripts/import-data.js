/**
 * Berserkr Master Setup Macro (V8 - Total Organization)
 * 
 * This macro:
 * 1. Creates Sidebar Folders for Compendiums.
 * 2. Organizes all 28 packs into these folders.
 * 3. Imports all JSON data.
 */

const packGroups = {
  "Berserkr: Items": ["berserkr-basic-weapons", "berserkr-special-weapons", "berserkr-armors", "berserkr-gear", "berserkr-runes"],
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

const packFiles = {
  "berserkr-basic-weapons": ["basic-weapons.json"],
  "berserkr-special-weapons": ["special-weapons.json"],
  "berserkr-armors": ["armors.json"],
  "berserkr-gear": ["gear.json"],
  "berserkr-runes": ["runes.json"],
  "berserkr-feats-berserkr": ["feats.json"],
  "berserkr-feats-valkyrie": ["feats.json"],
  "berserkr-feats-vanir-warden": ["feats.json"],
  "berserkr-feats-frost-jotunn": ["feats.json"],
  "berserkr-feats-light-elf": ["feats.json"],
  "berserkr-feats-master-smith": ["feats.json"],
  "berserkr-feats-wraith": ["feats.json"],
  "berserkr-feats-flame-construct": ["feats.json"],
  "berserkr-feats-soul-shepherd": ["feats.json"],
  "berserkr-feats-realmbreaker": ["feats.json"],
  "berserkr-tables-creation": ["memories-of-the-past.json", "quirks-and-talents.json", "habitual-by-nature.json", "beliefs-and-superstitions.json", "starting-equipment.json", "additional-gear.json", "weapons-table.json"],
  "berserkr-tables-rules": ["broken.json", "debilitating-injuries.json"],
  "berserkr-tables-divine": ["odin-favour-wrath.json", "loki-favour-wrath.json"],
  "berserkr-tables-midgard": ["midgard-tables.json"],
  "berserkr-tables-asgard": ["asgard-tables.json"],
  "berserkr-tables-vanaheim": ["vanaheim-tables.json"],
  "berserkr-tables-jotunheim": ["jotunheim-tables.json"],
  "berserkr-tables-alfheim": ["alfheim-tables.json"],
  "berserkr-tables-svartalfheim": ["svartalfheim-tables.json"],
  "berserkr-tables-niflheim": ["niflheim-tables.json"],
  "berserkr-tables-muspelheim": ["muspelheim-tables.json"],
  "berserkr-tables-helheim": ["helheim-tables.json"]
};

async function masterSetup() {
  ui.notifications.info("BERSERKR | Starting Master Setup...");

  // 1. Organize Sidebar Folders
  for (const [folderName, packNames] of Object.entries(packGroups)) {
    // Find or Create sidebar folder for Compendiums
    let folder = game.folders.find(f => f.name === folderName && f.type === "Compendium");
    if (!folder) {
      folder = await Folder.create({ name: folderName, type: "Compendium", color: "#004D56" });
    }

    for (const packName of packNames) {
      const pack = game.packs.get(`berserkr.${packName}`);
      if (pack) {
        await pack.configure({ folder: folder.id, locked: false });
        
        // 2. Clear Pack
        const content = await pack.getDocuments();
        for (let doc of content) await doc.delete();

        // 3. Import Data
        const files = packFiles[packName] || [];
        for (const fileName of files) {
          try {
            const response = await fetch(`systems/berserkr/packs/${packName}/${fileName}`);
            if (!response.ok) continue;
            const data = await response.json();
            for (let itemData of data) {
              if (!itemData._id) itemData._id = foundry.utils.randomID();
              await pack.documentClass.create(itemData, { pack: pack.collection });
            }
            console.log(`BERSERKR | Imported ${fileName} into ${packName}`);
          } catch (err) {
            console.error(`BERSERKR | Error in ${fileName}:`, err);
          }
        }
        
        await pack.configure({ locked: true });
      }
    }
  }

  ui.notifications.info("BERSERKR | Master Setup Complete! Sidebar organized.");
}

masterSetup();
