import fs from "fs";
import path from "path";

const srcDir = "src/packs";
const manifest = {};

const packs = fs.readdirSync(srcDir);
for (const pack of packs) {
  const packPath = path.join(srcDir, pack);
  if (fs.statSync(packPath).isDirectory()) {
    const files = fs.readdirSync(packPath).filter(f => f.endsWith(".json"));
    manifest[pack] = files;
  }
}

fs.writeFileSync("packs-manifest.json", JSON.stringify(manifest, null, 2));
console.log("Manifest generated with " + packs.length + " packs.");
