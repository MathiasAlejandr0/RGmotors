import { readFileSync, writeFileSync } from "node:fs";

function extractFolders(htmlFile) {
  const html = readFileSync(htmlFile, "utf8");
  const folders = [];

  // Pattern: aria-label="<NAME> (Shared folder|Google Drive Folder|...)" ... ssk='5:auSv138:<FOLDER_ID>-...
  // Or regex matching aria-label="([^"]+)\s+(?:Shared folder|Google [^"]*)"[^>]*ssk='5:[^:]*:([a-zA-Z0-9_-]+)
  const regex = /aria-label="([^"]+?)\s+(?:Shared folder|Google Drive Folder|folder)"[^>]*ssk='5:[^:]*:([a-zA-Z0-9_-]+)/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const name = match[1].trim();
    const id = match[2].trim().split("-")[0];
    if (!folders.some((f) => f.name === name)) {
      folders.push({ name, id });
    }
  }

  // Also catch files / spreadsheets / images
  const fileRegex = /aria-label="([^"]+?\.(?:xlsx|xls|csv|pdf|docx|png|jpg))"[^>]*ssk='5:[^:]*:([a-zA-Z0-9_-]+)/gi;
  const files = [];
  while ((match = fileRegex.exec(html)) !== null) {
    const name = match[1].trim();
    const id = match[2].trim().split("-")[0];
    if (!files.some((f) => f.name === name)) {
      files.push({ name, id });
    }
  }

  return { folders, files };
}

console.log("=== EXTRACCIÓN DE CARPETA 1 (FOTOS RG Y UNIDADES CHILE) ===");
const res1 = extractFolders("scratch/drive1.html");
console.log(`Total carpetas (vehículos por patente): ${res1.folders.length}`);
console.table(res1.folders);
console.log(`Total archivos: ${res1.files.length}`);
console.table(res1.files);

console.log("\n=== EXTRACCIÓN DE CARPETA 2 ===");
const res2 = extractFolders("scratch/drive2.html");
console.log(`Total carpetas: ${res2.folders.length}`);
console.table(res2.folders);
console.log(`Total archivos: ${res2.files.length}`);
console.table(res2.files);

writeFileSync("scratch/drive_vehicles.json", JSON.stringify({ drive1: res1, drive2: res2 }, null, 2));
