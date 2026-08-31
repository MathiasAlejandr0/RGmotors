import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const INVENTORY_DIR = "public/cars/inventory";

function createPlateSvg(w, h) {
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
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <rect width="${width}" height="${height}" rx="4" ry="4" fill="url(#pBg)" stroke="#334155" stroke-width="1.5"/>
  <rect x="3" y="3" width="${width - 6}" height="${height - 6}" rx="3" ry="3" fill="none" stroke="#38bdf8" stroke-opacity="0.6" stroke-width="1"/>

  <g filter="url(#shadow)">
    <text x="50%" y="${height * 0.44}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="${height * 0.32}" fill="url(#tGr)" text-anchor="middle" letter-spacing="1.5">
      RG MOTORS
    </text>
  </g>

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

async function findAndCoverSalgadoPlate(filePath) {
  try {
    const { data, info } = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
    const { width, height, channels } = info;

    // Detect blue Salgado plate box
    let minX = width, maxX = 0, minY = height, maxY = 0, count = 0;
    for (let y = Math.floor(height * 0.55); y < Math.floor(height * 0.95); y++) {
      for (let x = Math.floor(width * 0.25); x < Math.floor(width * 0.75); x++) {
        const idx = (y * width + x) * channels;
        const r = data[idx], g = data[idx+1], b = data[idx+2];
        if (b > 90 && b > r * 1.35 && b > g * 1.15) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          count++;
        }
      }
    }

    const boxW = maxX - minX;
    const boxH = maxY - minY;

    // If blue plate detected (at least 200 blue pixels forming a license plate shape)
    if (count > 200 && boxW > 80 && boxW < 500 && boxH > 35 && boxH < 250) {
      const plateSvg = createPlateSvg(boxW + 16, boxH + 12);
      const platePng = await sharp(plateSvg).png().toBuffer();

      const inputBuffer = fs.readFileSync(filePath);
      const outputBuffer = await sharp(inputBuffer)
        .composite([{ input: platePng, left: Math.max(0, minX - 8), top: Math.max(0, minY - 6) }])
        .jpeg({ quality: 88 })
        .toBuffer();

      fs.writeFileSync(filePath, outputBuffer);
      return true;
    }
  } catch (err) {
    // Ignore read errors
  }
  return false;
}

async function run() {
  const folders = fs.readdirSync(INVENTORY_DIR);
  console.log(`🔍 Buscando cubrepatentes antiguos en ${folders.length} carpetas de vehículos...`);

  let replacedCount = 0;

  for (const folder of folders) {
    const fullFolderPath = path.join(INVENTORY_DIR, folder);
    if (!fs.statSync(fullFolderPath).isDirectory()) continue;

    const files = fs.readdirSync(fullFolderPath);
    for (const f of files) {
      if (/\.jpg$/i.test(f)) {
        const p = path.join(fullFolderPath, f);
        const replaced = await findAndCoverSalgadoPlate(p);
        if (replaced) {
          replacedCount++;
          console.log(`✅ RG Motors aplicado en: ${folder}/${f}`);
        }
      }
    }
  }

  console.log(`🎉 Total de fotos con cubrepatente RG Motors actualizado: ${replacedCount}`);
}

run();
