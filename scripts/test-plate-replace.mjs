import sharp from "sharp";
import fs from "node:fs";

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

async function testApply() {
  const imgPath = "public/cars/inventory/dxtz99/0.jpg";
  const left = 765;
  const top = 770;
  const width = 245;
  const height = 108;

  const svg = createPlateSvg(width, height);
  const png = await sharp(svg).png().toBuffer();

  const inputBuf = fs.readFileSync(imgPath);
  const out = await sharp(inputBuf)
    .composite([{ input: png, left, top }])
    .jpeg({ quality: 92 })
    .toBuffer();

  fs.writeFileSync("public/cars/inventory/dxtz99/0.jpg", out);
  console.log("✅ Plate applied successfully to dxtz99/0.jpg");
}

testApply().catch(console.error);
