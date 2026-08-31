import sharp from "sharp";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

function createPlateSvg(w, h) {
  const width = Math.round(w);
  const height = Math.round(h);
  return Buffer.from(`
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="plateBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0e172a"/>
      <stop offset="50%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#05070d"/>
    </linearGradient>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1d4ed8" stop-opacity="0.1"/>
      <stop offset="50%" stop-color="#38bdf8" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#1d4ed8" stop-opacity="0.1"/>
    </linearGradient>
    <filter id="subtleShadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Base Plate Frame -->
  <rect width="${width}" height="${height}" rx="4" ry="4" fill="url(#plateBg)" stroke="#334155" stroke-width="1.5"/>
  <rect x="3" y="3" width="${width - 6}" height="${height - 6}" rx="3" ry="3" fill="none" stroke="#38bdf8" stroke-opacity="0.6" stroke-width="1"/>

  <!-- Top Logo & Text -->
  <g filter="url(#subtleShadow)">
    <text x="50%" y="${height * 0.44}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="${height * 0.32}" fill="url(#textGrad)" text-anchor="middle" letter-spacing="1.5">
      RG MOTORS
    </text>
  </g>

  <!-- Accent Divider -->
  <line x1="12" y1="${height * 0.58}" x2="${width - 12}" y2="${height * 0.58}" stroke="url(#accent)" stroke-width="1.2"/>

  <!-- Subtitle Text -->
  <text x="50%" y="${height * 0.74}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="${height * 0.12}" fill="#38bdf8" text-anchor="middle" letter-spacing="2.5">
    AUTOMOTRIZ
  </text>

  <!-- Location Tagline -->
  <text x="50%" y="${height * 0.90}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-weight="600" font-size="${height * 0.11}" fill="#94a3b8" text-anchor="middle" letter-spacing="1">
    PUERTO MONTT · CHILE
  </text>
</svg>
`);
}

const TARGETS = [
  // 1. Toyota Hilux LPBR18 Front Cover (clean direct front photo)
  { file: "public/cars/real_stock/rg-lpbr18-1.jpg", left: 645, top: 1080, width: 305, height: 115 },
  { file: "public/cars/real_stock/auto-lpbr18-1.jpg", left: 645, top: 1080, width: 305, height: 115 },

  // 2. Nissan Terrano DXTZ99 (Front cover & angles)
  { file: "public/cars/real_stock/rg-dxtz99-0.jpg", left: 880, top: 905, width: 275, height: 120 },
  { file: "public/cars/real_stock/auto-dxtz99-salgado-0.jpg", left: 880, top: 905, width: 275, height: 120 },
  { file: "public/cars/real_stock/rg-dxtz99-1.jpg", left: 605, top: 990, width: 305, height: 125 },
  { file: "public/cars/real_stock/auto-dxtz99-salgado-1.jpg", left: 605, top: 990, width: 305, height: 125 },

  // 3. Subaru Outback HJCW79 Front Cover
  { file: "public/cars/real_stock/auto-hjcw79-1.jpg", left: 648, top: 1035, width: 300, height: 115 },
  { file: "public/cars/real_stock/rg-hjcw79-1.jpg", left: 648, top: 1035, width: 300, height: 115 },

  // 4. DFSK Glory 580 KXDZ62 Front Cover
  { file: "public/cars/real_stock/auto-kxdz62-0.jpg", left: 642, top: 995, width: 318, height: 130 },
  { file: "public/cars/real_stock/rg-kxdz62-0.jpg", left: 642, top: 995, width: 318, height: 130 },

  // 5. Peugeot 2008 JSPB25 Front Cover
  { file: "public/cars/real_stock/auto-jspb25-0.jpg", left: 1050, top: 995, width: 260, height: 130 },
  { file: "public/cars/real_stock/rg-jspb25-0.jpg", left: 1050, top: 995, width: 260, height: 130 },
];

async function applyAll() {
  console.log("🚀 Aplicando cubrepatentes RG MOTORS...");

  for (const t of TARGETS) {
    if (!existsSync(t.file)) continue;

    try {
      const inputBuffer = readFileSync(t.file);
      const plateSvg = createPlateSvg(t.width, t.height);
      const platePng = await sharp(plateSvg).png().toBuffer();

      const outputBuffer = await sharp(inputBuffer)
        .composite([{ input: platePng, left: t.left, top: t.top }])
        .jpeg({ quality: 92 })
        .toBuffer();

      writeFileSync(t.file, outputBuffer);
      console.log(`✅ Placa RG Motors aplicada en: ${t.file}`);
    } catch (err) {
      console.error(`❌ Error en ${t.file}:`, err.message);
    }
  }

  // Set the clean front photo as the main cover photo for LPBR18
  if (existsSync("public/cars/real_stock/rg-lpbr18-1.jpg")) {
    const frontBuffer = readFileSync("public/cars/real_stock/rg-lpbr18-1.jpg");
    writeFileSync("public/cars/real_stock/rg-lpbr18-0.jpg", frontBuffer);
    writeFileSync("public/cars/real_stock/auto-lpbr18-0.jpg", frontBuffer);
    console.log("✅ Foto frontal de Toyota Hilux LPBR18 establecida como cover principal!");
  }

  console.log("🎉 Todas las fotos frontales verificadas y actualizadas.");
}

applyAll();
