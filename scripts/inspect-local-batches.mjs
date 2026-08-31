import fs from "node:fs";
import path from "node:path";

const LOCAL_DRIVE_PATH = "C:/Users/mathi/OneDrive/Escritorio/drive rgmotors";

function inspectAll() {
  const topEntries = fs.readdirSync(LOCAL_DRIVE_PATH, { withFileTypes: true });
  let totalCarFolders = 0;
  const allCarFolders = [];

  for (const top of topEntries) {
    if (!top.isDirectory()) continue;
    const topPath = path.join(LOCAL_DRIVE_PATH, top.name);
    const subEntries = fs.readdirSync(topPath, { withFileTypes: true });

    console.log(`\n📦 Lote "${top.name}": contiene ${subEntries.length} elementos`);

    for (const sub of subEntries) {
      const subPath = path.join(topPath, sub.name);
      if (sub.isDirectory()) {
        const files = fs.readdirSync(subPath);
        const images = files.filter(f => /\.(jpg|jpeg|png|webp|heic|mp4|mov)$/i.test(f));
        totalCarFolders++;
        allCarFolders.push({
          batch: top.name,
          folderName: sub.name,
          path: subPath,
          imagesCount: images.length,
          files: images,
        });
      } else {
        // In case files are directly here
        console.log(`  (Archivo suelto): ${sub.name}`);
      }
    }
  }

  console.log(`\n🔥 GRAN TOTAL DE CARPETAS DE VEHÍCULOS ENCONTRADAS: ${totalCarFolders}`);
  console.log("\nPrimeras 25 carpetas:");
  for (const c of allCarFolders.slice(0, 25)) {
    console.log(`  - [${c.folderName}] (${c.imagesCount} fotos) en ${c.batch}`);
  }

  fs.writeFileSync("scratch/local_all_car_folders.json", JSON.stringify(allCarFolders, null, 2));
  console.log("\nLista guardada en scratch/local_all_car_folders.json");
}

inspectAll();
