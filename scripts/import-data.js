/**
 * Berserkr FULL RESTORATION Macro (V15 - Dedicated Legendary Pack)
 * 
 * This macro:
 * 1. Creates Sidebar Folders.
 * 2. Reads the manifest and imports everything from src/packs/.
 */

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

async function masterSetup() {
  ui.notifications.info("BERSERKR | Starting Deep Setup...");

  try {
    const manifestResponse = await fetch('systems/berserkr/packs-manifest.json');
    if (!manifestResponse.ok) throw new Error("Manifest not found!");
    const manifest = await manifestResponse.json();

    for (const [folderName, packNames] of Object.entries(packGroups)) {
      let folder = game.folders.find(f => f.name === folderName && f.type === "Compendium");
      if (!folder) {
        // @ts-ignore
        folder = await Folder.create({ name: folderName, type: "Compendium", color: "#004D56" });
      }

      for (const packName of packNames) {
        const pack = game.packs.get(`berserkr.${packName}`);
        if (!pack) continue;

        await pack.configure({ folder: folder.id, locked: false });
        
        const docs = await pack.getDocuments();
        for (let d of docs) await d.delete();

        // Import from manifest files
        const fileList = manifest[packName] || [];
        for (const fileName of fileList) {
          try {
            const response = await fetch(`systems/berserkr/src/packs/${packName}/${fileName}`);
            let itemData = await response.json();
            
            // Translate before creating
            if (itemData.name?.startsWith("BERSERKR.")) itemData.name = game.i18n.localize(itemData.name);
            if (itemData.system?.description?.startsWith("BERSERKR.")) itemData.system.description = game.i18n.localize(itemData.system.description);
            if (itemData.results) {
              itemData.results.forEach(r => { if (r.text?.startsWith("BERSERKR.")) r.text = game.i18n.localize(r.text); });
            }

            if (!itemData._id) itemData._id = foundry.utils.randomID();
            await pack.documentClass.create(itemData, { pack: pack.collection });
          } catch (e) { console.error(e); }
        }
        
        await pack.configure({ locked: true });
        console.log(`BERSERKR | Setup complete for ${packName}`);
      }
    }
    ui.notifications.info("BERSERKR | Master Setup Complete!");
  } catch (err) {
    ui.notifications.error("BERSERKR | Setup failed.");
    console.error(err);
  }
}

masterSetup();
