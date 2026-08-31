import { readFileSync } from "node:fs";

const html = readFileSync("scratch/cvff32.html", "utf8");

// Pattern for image files in Google Drive:
const regex = /aria-label="([^"]+?\.(?:jpg|jpeg|png|webp|heic))\s+Image\s+Shared"[^>]*ssk='5:[^:]*:([a-zA-Z0-9_-]+)/gi;
let m;
const files = [];
while ((m = regex.exec(html)) !== null) {
  const fileName = m[1];
  const fileId = m[2].split("-")[0];
  files.push({ fileName, fileId, downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}` });
}

console.log(`Encontradas ${files.length} fotos con sus IDs de descarga en CVFF32:`);
console.table(files);
