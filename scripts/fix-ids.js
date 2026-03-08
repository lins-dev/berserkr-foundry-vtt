import fs from "fs";
import path from "path";

const srcDir = "src/packs";

function generateID() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith(".json")) {
      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      
      let modified = false;
      // Force main _id to be 16 chars
      if (!content._id || content._id.length !== 16) {
        content._id = generateID();
        modified = true;
      }
      
      // Force result _ids to be 16 chars
      if (content.results && Array.isArray(content.results)) {
        content.results.forEach(r => {
          if (!r._id || r._id.length !== 16) {
            r._id = generateID();
            modified = true;
          }
        });
      }

      if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
      }
    }
  }
}

walkDir(srcDir);
console.log("All JSON files fixed with strictly 16-char IDs.");
