import fs from "fs";
import path from "path";

const srcDir = "src/packs";

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith(".json")) {
      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      // Se for um item ou tabela
      if (content.img) {
        content.img = "icons/svg/mystery-man.svg";
      }
      // Se for uma tabela com resultados
      if (content.results && Array.isArray(content.results)) {
        content.results.forEach(r => {
          if (r.img) r.img = "icons/svg/mystery-man.svg";
        });
      }
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    }
  }
}

walkDir(srcDir);
