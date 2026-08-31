import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";

async function cleanBackgrounds() {
  const svg1 = Buffer.from('<svg width="120" height="60"><rect width="100%" height="100%" rx="3" fill="#090d16" stroke="#1e293b"/></svg>');
  const png1 = await sharp(svg1).png().toBuffer();

  // 1. rg-lpbr18-0.jpg (Car on the right bumper)
  let buf0 = readFileSync("public/cars/real_stock/rg-lpbr18-0.jpg");
  buf0 = await sharp(buf0).composite([{ input: png1, left: 1475, top: 520 }]).jpeg({ quality: 92 }).toBuffer();
  // Bumper on the far right:
  const svgBumper = Buffer.from('<svg width="115" height="65"><rect width="100%" height="100%" rx="4" fill="#090d16" stroke="#1e293b"/></svg>');
  const pngBumper = await sharp(svgBumper).png().toBuffer();
  buf0 = await sharp(buf0).composite([{ input: pngBumper, left: 1470, top: 520 }]).jpeg({ quality: 92 }).toBuffer();

  // Actual coordinates on 1600x1600 image for the blue plate on the right car bumper:
  // x: [1470, 1590], y: [520, 580]
  writeFileSync("public/cars/real_stock/rg-lpbr18-0.jpg", buf0);
  writeFileSync("public/cars/real_stock/auto-lpbr18-0.jpg", buf0);

  console.log("✅ Background plates cleanly covered!");
}

cleanBackgrounds();
