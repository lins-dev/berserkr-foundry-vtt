import fs from "fs";
import path from "path";

const srcDir = "src/packs";

const packs = fs.readdirSync(srcDir);

function generateID() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

for (const pack of packs) {
  const packPath = path.join(srcDir, pack);
  if (!fs.statSync(packPath).isDirectory()) continue;

  const files = fs.readdirSync(packPath);
  for (const file of files) {
    if (!file.endsWith(".json") || file.length === 21) continue; // Pular arquivos já divididos (ID de 16 chars + .json)
    
    const filePath = path.join(packPath, file);
    let content;
    try {
      content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (e) { continue; }
    
    if (Array.isArray(content)) {
      console.log(`Processing array in ${filePath}...`);
      content.forEach((item, index) => {
        if (!item._id) item._id = generateID();
        // Garantir que pastas de reinos tenham o tipo correto para Table
        if (pack.startsWith("berserkr-tables") && !item.results) {
           // É uma tabela mas faltam resultados? Ignorar ou corrigir
        }
        const fileName = `${item._id}.json`;
        fs.writeFileSync(path.join(packPath, fileName), JSON.stringify(item, null, 2));
      });
      fs.unlinkSync(filePath);
    }
  }
}
