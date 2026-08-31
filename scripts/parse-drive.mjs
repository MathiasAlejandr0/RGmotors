import https from "node:https";
import { writeFile } from "node:fs/promises";

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
      res.on("error", reject);
    });
  });
}

async function extractDriveFolder(folderUrl) {
  const html = await fetchUrl(folderUrl);
  
  // Find all JSON arrays or data chunks in the HTML
  // In Drive folders, items are embedded in JSON structures: [id, name, mimeType, ...]
  // Let's find patterns like: ["1...", "PATENTE", ...
  
  const folderItems = [];
  // Regex to find folder IDs and plate names
  // Typical pattern: ["<fileId>","<name>",null,"<mimeType>",...
  const regex = /\["([a-zA-Z0-9_-]{20,})","([^"]+)",null,"(application\/vnd\.google-apps\.folder|image\/[a-z]+|video\/[a-z]+)"/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    folderItems.push({
      id: match[1],
      name: match[2],
      type: match[3],
    });
  }

  // Also broader search for [id, "NAME", ...]
  const regex2 = /\["([a-zA-Z0-9_-]{25,})","([A-Z0-9]{4,8}|[^"]+\.(?:jpg|png|jpeg|xlsx|xls|csv|mp4|mov))"/gi;
  while ((match = regex2.exec(html)) !== null) {
    if (!folderItems.some((f) => f.id === match[1])) {
      folderItems.push({
        id: match[1],
        name: match[2],
        type: "item",
      });
    }
  }

  return { html, items: folderItems };
}

async function main() {
  const url1 = "https://drive.google.com/drive/folders/1VQ6IHTjk5sJYjJckZY1kzeRJAI5d09Od?usp=sharing";
  const url2 = "https://drive.google.com/drive/folders/1zqX6z_sKWHjHyNoMlS_rtkkF6pK_FqVh";

  console.log("=== Analizando Carpeta 1: FOTOS RG Y UNIDADES CHILE ===");
  const res1 = await extractDriveFolder(url1);
  console.log(`Encontrados ${res1.items.length} elementos en Carpeta 1:`);
  console.table(res1.items);

  console.log("\n=== Analizando Carpeta 2: Catalogo RG ===");
  const res2 = await extractDriveFolder(url2);
  console.log(`Encontrados ${res2.items.length} elementos en Carpeta 2:`);
  console.table(res2.items);

  await writeFile("scratch/drive1.html", res1.html);
  await writeFile("scratch/drive2.html", res2.html);
}

main().catch(console.error);
