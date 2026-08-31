import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

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

  <rect width="${width}" height="${height}" rx="3" ry="3" fill="url(#pBg)" stroke="#334155" stroke-width="1.2"/>
  <rect x="2" y="2" width="${width - 4}" height="${height - 4}" rx="2" ry="2" fill="none" stroke="#38bdf8" stroke-opacity="0.7" stroke-width="1"/>

  <g filter="url(#shadow)">
    <text x="50%" y="${height * 0.44}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="${Math.max(7, height * 0.32)}" fill="url(#tGr)" text-anchor="middle" letter-spacing="1.2">
      RG MOTORS
    </text>
  </g>

  <line x1="6" y1="${height * 0.58}" x2="${width - 6}" y2="${height * 0.58}" stroke="url(#acc)" stroke-width="0.8"/>

  <text x="50%" y="${height * 0.74}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="${Math.max(4, height * 0.12)}" fill="#38bdf8" text-anchor="middle" letter-spacing="1.5">
    AUTOMOTRIZ
  </text>

  <text x="50%" y="${height * 0.90}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="${Math.max(3.5, height * 0.11)}" fill="#94a3b8" text-anchor="middle" letter-spacing="0.6">
    PUERTO MONTT
  </text>
</svg>
`);
}

async function fixFvrg86() {
  const dir = "C:/Users/mathi/OneDrive/Escritorio/drive rgmotors/drive-download-20260828T150704Z-1-001/FVRG86";
  
  // 1. FRONT PHOTO (47c9510c-2290-440d-9e0d-7d82c15424e4.jpg)
  const frontSrc = path.join(dir, "47c9510c-2290-440d-9e0d-7d82c15424e4.jpg");
  const resizedFront = await sharp(frontSrc).resize({ width: 1400, height: 1400, fit: "inside" }).jpeg({ quality: 92 }).toBuffer();
  
  // Exact 100% plate coverage: left: 190, top: 560, width: 172, height: 85
  const svgFront = createPlateSvg(172, 85);
  const pngFront = await sharp(svgFront).png().toBuffer();
  
  const finalFront = await sharp(resizedFront)
    .composite([{ input: pngFront, left: 190, top: 560 }])
    .jpeg({ quality: 92 })
    .toBuffer();

  fs.writeFileSync("public/cars/inventory/fvrg86/2.jpg", finalFront);
  fs.writeFileSync("public/cars/inventory/fvrg86/0.jpg", finalFront);
  console.log("✅ FVRG86 Front photo fixed 100%!");

  // 2. REAR PHOTO (03cc5352-91db-430e-9403-69a676892d90.jpg)
  const rearSrc = path.join(dir, "03cc5352-91db-430e-9403-69a676892d90.jpg");
  const resizedRear = await sharp(rearSrc).resize({ width: 1400, height: 1400, fit: "inside" }).jpeg({ quality: 92 }).toBuffer();
  
  // Rear plate: left: 240, top: 430, width: 220, height: 85
  const svgRear = createPlateSvg(220, 85);
  const pngRear = await sharp(svgRear).png().toBuffer();
  
  const finalRear = await sharp(resizedRear)
    .composite([{ input: pngRear, left: 240, top: 430 }])
    .jpeg({ quality: 92 })
    .toBuffer();

  fs.writeFileSync("public/cars/inventory/fvrg86/1.jpg", finalRear);
  console.log("✅ FVRG86 Rear photo fixed 100%!");
}

fixFvrg86().catch(console.error);
