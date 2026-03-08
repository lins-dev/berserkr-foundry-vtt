import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const srcDir = "src/packs";
const outDir = "packs";

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const packs = fs.readdirSync(srcDir);

console.log("BERSERKR | Compiling Compendiums (Direct Mode)...");

for (const pack of packs) {
  const input = path.join(srcDir, pack);
  const output = path.join(outDir, pack);
  
  if (fs.statSync(input).isDirectory()) {
    console.log(`- Packing ${pack}...`);
    try {
      // fvtt-cli cria uma subpasta por padrão. Vamos forçar a saída para o diretório pai.
      // Usamos o comando 'pack' apontando para o diretório final esperado.
      execSync(`npx fvtt package pack berserkr --type System -n ${pack} --in ${input} --out ${output}`, { stdio: "inherit" });
      
      // Se ele criou packs/nome/nome, movemos para packs/nome
      const nested = path.join(output, pack);
      if (fs.existsSync(nested)) {
        const files = fs.readdirSync(nested);
        for (const f of files) {
          fs.renameSync(path.join(nested, f), path.join(output, f));
        }
        fs.rmdirSync(nested);
      }
    } catch (err) {
      console.error(`Error packing ${pack}:`, err.message);
    }
  }
}

console.log("BERSERKR | All packs compiled successfully.");
