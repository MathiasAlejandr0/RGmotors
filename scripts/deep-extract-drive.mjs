import https from "node:https";
import { writeFileSync } from "node:fs";

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" } }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve(data));
      res.on("error", reject);
    });
  });
}

async function deepExtractDrive(folderId) {
  const url = `https://drive.google.com/drive/folders/${folderId}`;
  const html = await fetchPage(url);

  const folderMap = new Map();
  const fileMap = new Map();

  // 1. Aria-label regex
  const folderRegex = /aria-label="([^"\n]+?)\s+(?:Shared folder|Google Drive Folder|folder)"[^>]*ssk='5:[^:]*:([a-zA-Z0-9_-]+)/gi;
  let m;
  while ((m = folderRegex.exec(html)) !== null) {
    const name = m[1].trim();
    const id = m[2].split("-")[0];
    folderMap.set(id, { id, name });
  }

  // 2. Embedded JS data parsing
  // Google Drive embeds arrays like: ["id", "name", "mimeType", ...] or [...,"folder_name",...,"folder_id",...]
  // Pattern matching for IDs and names:
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let sm;
  while ((sm = scriptRegex.exec(html)) !== null) {
    const script = sm[1];
    
    // Look for folder items in arrays: ["folder-id","folder-name",null,"application/vnd.google-apps.folder"]
    const arrayRegex = /\["([a-zA-Z0-9_-]{20,})","([^"\\]+)",null,"application\/vnd\.google-apps\.folder"/g;
    let am;
    while ((am = arrayRegex.exec(script)) !== null) {
      folderMap.set(am[1], { id: am[1], name: am[2] });
    }

    // Also look for: ["folder-name","folder-id",...,"application/vnd.google-apps.folder"]
    const arrayRegex2 = /\["([^"\\]+)","([a-zA-Z0-9_-]{20,})"[^\]]*"application\/vnd\.google-apps\.folder"/g;
    let am2;
    while ((am2 = arrayRegex2.exec(script)) !== null) {
      folderMap.set(am2[2], { id: am2[2], name: am2[1] });
    }

    // Look for image files: ["file-id","file-name",null,"image/jpeg"...]
    const imgRegex = /\["([a-zA-Z0-9_-]{20,})","([^"\\]+)",null,"image\/(?:jpeg|png|webp|heic)"/g;
    let im;
    while ((im = imgRegex.exec(script)) !== null) {
      fileMap.set(im[1], { id: im[1], name: im[2] });
    }
  }

  return {
    folders: Array.from(folderMap.values()),
    files: Array.from(fileMap.values()),
  };
}

async function run() {
  console.log("🔍 Extrayendo todas las carpetas de Drive 1...");
  const d1 = await deepExtractDrive("1VQ6IHTjk5sJYjJckZY1kzeRJAI5d09Od");
  console.log(`Drive 1: ${d1.folders.length} carpetas detectadas, ${d1.files.length} archivos.`);

  console.log("🔍 Extrayendo todas las carpetas de Drive 2...");
  const d2 = await deepExtractDrive("1zqX6z_sKWHjHyNoMlS_rtkkF6pK_FqVh");
  console.log(`Drive 2: ${d2.folders.length} carpetas detectadas, ${d2.files.length} archivos.`);

  // Combine
  const allFolders = [...d1.folders, ...d2.folders];
  console.log(`\nTotal carpetas combinadas en primer nivel: ${allFolders.length}`);

  // Inspect if any of the folders is "UNIDADES CHILE" or similar parent folder
  const subParents = allFolders.filter(f => 
    f.name.toLowerCase().includes("unidades") || 
    f.name.toLowerCase().includes("chile") || 
    f.name.toLowerCase().includes("stock") ||
    f.name.toLowerCase().includes("autos") ||
    f.name.toLowerCase().includes("camionetas")
  );

  console.log("\nCarpetas contenedor detectadas:", subParents);

  // Check each subparent recursively
  for (const sp of subParents) {
    console.log(`\n🔍 Explorando sub-carpeta contenedora: "${sp.name}" (${sp.id})...`);
    const subRes = await deepExtractDrive(sp.id);
    console.log(`  -> Contiene ${subRes.folders.length} carpetas y ${subRes.files.length} archivos.`);
    for (const subF of subRes.folders) {
      if (!allFolders.some(x => x.id === subF.id)) {
        allFolders.push(subF);
      }
    }
  }

  console.log(`\n🔥 GRAN TOTAL DE CARPETAS DE VEHÍCULOS: ${allFolders.length}`);
  
  writeFileSync("scratch/all_drive_folders_extracted.json", JSON.stringify(allFolders, null, 2));
  console.log("Guardado en scratch/all_drive_folders_extracted.json");
}

run();
