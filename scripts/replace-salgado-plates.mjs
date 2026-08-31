import sharp from "sharp";

export function createPlateSvg(w, h) {
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

async function test() {
  const plate1 = await sharp(createPlateSvg(270, 120)).png().toBuffer();
  await sharp("public/cars/real_stock/test-crop-dxtz99-0.jpg")
    .composite([{ input: plate1, left: 5, top: 5 }])
    .toFile("public/cars/real_stock/test-result-dxtz99-0.jpg");

  const plate2 = await sharp(createPlateSvg(240, 110)).png().toBuffer();
  await sharp("public/cars/real_stock/test-crop-lpbr18-0.jpg")
    .composite([{ input: plate2, left: 5, top: 5 }])
    .toFile("public/cars/real_stock/test-result-lpbr18-0.jpg");

  console.log("✅ Updated test composite saved!");
}

test();
