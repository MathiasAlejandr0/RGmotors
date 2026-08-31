import fs from "node:fs";
import path from "node:path";

const LOCAL_DRIVE_PATH = "C:/Users/mathi/OneDrive/Escritorio/drive rgmotors";

function scanLocalDrive() {
  if (!fs.existsSync(LOCAL_DRIVE_PATH)) {
    console.error("❌ No se encontró la carpeta en:", LOCAL_DRIVE_PATH);
    return;
  }

  const entries = fs.readdirSync(LOCAL_DRIVE_PATH, { withFileTypes: true });
  console.log(`📂 Total de elementos en "${LOCAL_DRIVE_PATH}": ${entries.length}`);

  const folders = entries.filter(e => e.isDirectory());
  console.log(`📁 Total de carpetas de vehículos: ${folders.length}`);

  for (const f of folders.slice(0, 30)) {
    const fullPath = path.join(LOCAL_DRIVE_PATH, f.name);
    try {
      const files = fs.readdirSync(fullPath);
      const imgFiles = files.filter(file => /\.(jpg|jpeg|png|webp|heic)$/i.test(file));
      console.log(`  - [${f.name}] -> ${imgFiles.length} fotos (${files.length} archivos en total)`);
    } catch (err) {
      console.log(`  - [${f.name}] -> Error leyendo carpeta:`, err.message);
    }
  }
}

scanLocalDrive();
