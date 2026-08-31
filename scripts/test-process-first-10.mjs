import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import decode from "heic-decode";

const BATCH_JSON = "scratch/local_all_car_folders.json";
const OUTPUT_BASE = "public/cars/inventory";

if (!fs.existsSync(OUTPUT_BASE)) {
  fs.mkdirSync(OUTPUT_BASE, { recursive: true });
}

function createRgPlateSvg(w, h) {
  const width = Math.round(w);
  const height = Math.round(h);
  return Buffer.from(`
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="pBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0e172a"/>
      <stop offset="50%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#05070d"/>
    </linearGradient>
    <linearGradient id="tGr" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="acc" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1d4ed8" stop-opacity="0.1"/>
      <stop offset="50%" stop-color="#38bdf8" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#1d4ed8" stop-opacity="0.1"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" rx="4" ry="4" fill="url(#pBg)" stroke="#334155" stroke-width="1.5"/>
  <rect x="3" y="3" width="${width - 6}" height="${height - 6}" rx="3" ry="3" fill="none" stroke="#38bdf8" stroke-opacity="0.6" stroke-width="1"/>
  <text x="50%" y="${height * 0.44}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="${height * 0.32}" fill="url(#tGr)" text-anchor="middle" letter-spacing="1.5">
    RG MOTORS
  </text>
  <line x1="12" y1="${height * 0.58}" x2="${width - 12}" y2="${height * 0.58}" stroke="url(#acc)" stroke-width="1.2"/>
  <text x="50%" y="${height * 0.74}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="${height * 0.12}" fill="#38bdf8" text-anchor="middle" letter-spacing="2.5">
    AUTOMOTRIZ
  </text>
  <text x="50%" y="${height * 0.90}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="${height * 0.11}" fill="#94a3b8" text-anchor="middle" letter-spacing="1">
    PUERTO MONTT · CHILE
  </text>
</svg>
`);
}

async function convertFileToBuffer(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const fileBuf = fs.readFileSync(filePath);
  
  if (ext === ".heic") {
    const { data, width, height } = await decode({ buffer: fileBuf });
    return sharp(data, { raw: { width, height, channels: 4 } });
  } else {
    return sharp(fileBuf);
  }
}

async function processFirst10() {
  const list = JSON.parse(fs.readFileSync(BATCH_JSON));
  const plateRegex = /([A-Z]{2,4}[-\s]?[0-9]{2,4}|[A-Z]{2}[0-9]{4}|[A-Z]{4}[0-9]{2})/i;
  
  // Group by plate
  const vehicleGroups = new Map();
  for (const item of list) {
    const match = item.folderName.match(plateRegex);
    const plate = match ? match[0].replace(/[-\s]/g, "").toUpperCase() : item.folderName.trim();
    if (!vehicleGroups.has(plate)) {
      vehicleGroups.set(plate, []);
    }
    vehicleGroups.get(plate).push(item);
  }

  const plates = Array.from(vehicleGroups.keys()).slice(0, 10);
  console.log(`🚀 Procesando lote de prueba de 10 vehículos:`, plates);

  for (const plate of plates) {
    const groups = vehicleGroups.get(plate);
    const targetDir = path.join(OUTPUT_BASE, plate.toLowerCase());
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // Collect all image files
    const allImages = [];
    for (const g of groups) {
      for (const file of g.files) {
        if (/\.(jpg|jpeg|png|webp|heic)$/i.test(file)) {
          allImages.push(path.join(g.path, file));
        }
      }
    }

    console.log(`\n🚗 [${plate}] -> Encontradas ${allImages.length} fotos.`);

    let processedCount = 0;
    for (let i = 0; i < Math.min(allImages.length, 12); i++) {
      const src = allImages[i];
      const dest = path.join(targetDir, `${i}.jpg`);
      try {
        const sharpInstance = await convertFileToBuffer(src);
        const buffer = await sharpInstance
          .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 88 })
          .toBuffer();

        fs.writeFileSync(dest, buffer);
        processedCount++;
      } catch (err) {
        console.error(`  ❌ Error procesando foto ${src}:`, err.message);
      }
    }

    console.log(`  ✅ Guardadas ${processedCount} fotos en ${targetDir}`);
  }

  console.log("\n🎉 Lote de prueba completado!");
}

processFirst10();
