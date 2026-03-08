/**
 * Berserkr FULL RESTORATION Macro (V12 - Manifest Driven)
 * 
 * This macro reads the manifest and imports EVERY item/table 
 * from the src/packs/ folders into your system compendiums.
 */

async function fullRestore() {
  ui.notifications.info("BERSERKR | Starting Deep Restoration...");

  try {
    // 1. Load the manifest
    const manifestResponse = await fetch('systems/berserkr/packs-manifest.json');
    if (!manifestResponse.ok) throw new Error("Manifest file not found!");
    const manifest = await manifestResponse.json();

    const packs = game.packs.filter(p => p.metadata.packageName === "berserkr");
    
    for (let pack of packs) {
      const packKey = pack.metadata.name;
      const fileList = manifest[packKey];

      if (!fileList || fileList.length === 0) {
        console.warn(`BERSERKR | No source files found for pack: ${packKey}`);
        continue;
      }

      ui.notifications.info(`Importing ${fileList.length} items into ${packKey}...`);

      // Unlock
      await pack.configure({ locked: false });

      // Clear existing to avoid duplicates
      const docs = await pack.getDocuments();
      for (let d of docs) await d.delete();

      // Import each file
      for (const fileName of fileList) {
        try {
          const itemResponse = await fetch(`systems/berserkr/src/packs/${packKey}/${fileName}`);
          const itemData = await itemResponse.json();
          
          if (!itemData._id) itemData._id = foundry.utils.randomID();
          await pack.documentClass.create(itemData, { pack: pack.collection });
        } catch (err) {
          console.error(`BERSERKR | Error importing ${fileName} into ${packKey}:`, err);
        }
      }

      // Relock
      await pack.configure({ locked: true });
      console.log(`BERSERKR | Restored pack: ${packKey}`);
    }

    ui.notifications.info("BERSERKR | Restoration Complete! All items and tables loaded.");
  } catch (err) {
    ui.notifications.error("BERSERKR | Restoration failed. See console for details.");
    console.error(err);
  }
}

fullRestore();
