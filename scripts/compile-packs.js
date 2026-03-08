import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const srcDir = "src/packs";
const outDir = "packs";

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const packs = fs.readdirSync(srcDir);

console.log("BERSERKR | Compiling Compendiums...");

for (const pack of packs) {
  const input = path.join(srcDir, pack);
  const output = path.join(outDir, pack);
  
  if (fs.statSync(input).isDirectory()) {
    console.log(`- Packing ${pack}...`);
    try {
      // fvtt package pack <id> --type System --in <dir> --out <dest>
      // We use npx to run the locally installed cli
      execSync(`npx fvtt package pack berserkr --type System -n ${pack} --in ${input} --out ${output}`, { stdio: "inherit" });
    } catch (err) {
      console.error(`Error packing ${pack}:`, err.message);
    }
  }
}

console.log("BERSERKR | All packs compiled successfully.");
