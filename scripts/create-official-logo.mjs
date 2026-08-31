import { createCanvas } from "@napi-rs/canvas";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

async function generateLogo() {
  const width = 1600;
  const height = 750;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Pure transparent background
  ctx.clearRect(0, 0, width, height);

  // Smooth antialiasing
  ctx.imageSmoothingEnabled = true;

  const centerX = width / 2;

  // ==========================================
  // 1. CAR SILHOUETTE (Liquid Chrome / Silver)
  // ==========================================
  ctx.save();
  ctx.translate(centerX - 560, 50);

  // Linear chrome gradient for the car lines
  const chromeGrad = ctx.createLinearGradient(0, 0, 1120, 200);
  chromeGrad.addColorStop(0, "#818CF8"); // subtle blue tint at rear
  chromeGrad.addColorStop(0.15, "#94A3B8");
  chromeGrad.addColorStop(0.35, "#F8FAFC"); // bright highlight
  chromeGrad.addColorStop(0.5, "#CBD5E1");
  chromeGrad.addColorStop(0.7, "#FFFFFF"); // roof highlight
  chromeGrad.addColorStop(0.85, "#E2E8F0");
  chromeGrad.addColorStop(1, "#F43F5E"); // subtle red reflection at front

  ctx.strokeStyle = chromeGrad;
  ctx.fillStyle = chromeGrad;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // --- Main Roof & Fastback Curve ---
  ctx.beginPath();
  ctx.lineWidth = 14;
  ctx.moveTo(130, 160); // rear spoiler tip
  ctx.bezierCurveTo(200, 140, 310, 85, 480, 58); // rear window slope up
  ctx.bezierCurveTo(620, 36, 750, 48, 880, 105); // windshield slope down
  ctx.bezierCurveTo(940, 130, 1010, 155, 1050, 165); // hood down to nose
  ctx.stroke();

  // Highlight over roof
  ctx.beginPath();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#FFFFFF";
  ctx.moveTo(350, 92);
  ctx.bezierCurveTo(500, 52, 650, 42, 800, 78);
  ctx.stroke();

  // --- Side Window Graphic (Glass Outline) ---
  ctx.beginPath();
  ctx.lineWidth = 7;
  ctx.strokeStyle = chromeGrad;
  ctx.moveTo(380, 100);
  ctx.bezierCurveTo(520, 68, 680, 62, 790, 105);
  ctx.bezierCurveTo(730, 120, 650, 130, 520, 130);
  ctx.bezierCurveTo(450, 130, 400, 120, 380, 100);
  ctx.stroke();

  // Side Mirror
  ctx.beginPath();
  ctx.lineWidth = 8;
  ctx.moveTo(730, 108);
  ctx.lineTo(760, 112);
  ctx.stroke();

  // --- Body Character Lines & Air Scoop ---
  // Rear fender arch
  ctx.beginPath();
  ctx.lineWidth = 11;
  ctx.strokeStyle = chromeGrad;
  ctx.moveTo(90, 175);
  ctx.bezierCurveTo(120, 172, 170, 170, 240, 205);
  ctx.stroke();

  // Rear Wheel Arch
  ctx.beginPath();
  ctx.lineWidth = 13;
  ctx.arc(260, 235, 95, Math.PI * 1.08, Math.PI * 1.92, false);
  ctx.stroke();

  // Side Sill & Mid Air-Intake Scoop
  ctx.beginPath();
  ctx.lineWidth = 10;
  ctx.moveTo(350, 218);
  ctx.bezierCurveTo(410, 195, 490, 185, 620, 185);
  ctx.bezierCurveTo(700, 185, 760, 195, 820, 218);
  ctx.stroke();

  // Distinctive side scoop wedge
  ctx.beginPath();
  ctx.lineWidth = 8;
  ctx.moveTo(420, 160);
  ctx.bezierCurveTo(480, 175, 540, 182, 600, 170);
  ctx.stroke();

  // Front Wheel Arch
  ctx.beginPath();
  ctx.lineWidth = 13;
  ctx.arc(910, 235, 95, Math.PI * 1.08, Math.PI * 1.92, false);
  ctx.stroke();

  // Front Nose & Aerodynamic Splitter / Headlight
  ctx.beginPath();
  ctx.lineWidth = 11;
  ctx.moveTo(1000, 212);
  ctx.bezierCurveTo(1040, 190, 1075, 175, 1100, 175);
  ctx.stroke();

  // Sleek LED Headlight Glow Accent
  ctx.beginPath();
  ctx.lineWidth = 7;
  ctx.strokeStyle = "#FFFFFF";
  ctx.moveTo(1010, 168);
  ctx.lineTo(1065, 174);
  ctx.stroke();

  ctx.restore();

  // ==========================================
  // 2. HORIZONTAL RACING BASELINE BARS
  // ==========================================
  const barY = 325;
  const barLeft = centerX - 560;
  const barRight = centerX + 560;

  // Thin silver separator bar above "automotora"
  const lineGrad = ctx.createLinearGradient(barLeft, 0, barRight, 0);
  lineGrad.addColorStop(0, "rgba(37, 99, 235, 0.8)"); // blue start
  lineGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.95)"); // chrome center
  lineGrad.addColorStop(0.7, "rgba(255, 255, 255, 0.95)");
  lineGrad.addColorStop(1, "rgba(220, 38, 38, 0.8)"); // red end

  ctx.beginPath();
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 3.5;
  ctx.moveTo(barLeft + 40, barY + 165);
  ctx.lineTo(barRight - 40, barY + 165);
  ctx.stroke();

  // ==========================================
  // 3. TYPOGRAPHY: R (Blue) + G (Red) + MOTORS (Chrome)
  // ==========================================
  ctx.save();
  ctx.font = "italic 900 155px 'SF Pro Display', 'Arial Black', Impact, sans-serif";
  ctx.textBaseline = "alphabetic";

  // Coordinates
  const startX = centerX - 540;
  const textY = barY + 140;

  // 1. "R" in Electric Royal Blue
  const blueGrad = ctx.createLinearGradient(startX, textY - 140, startX + 130, textY);
  blueGrad.addColorStop(0, "#3B82F6"); // bright royal
  blueGrad.addColorStop(0.5, "#2563EB");
  blueGrad.addColorStop(1, "#1D4ED8"); // deep cobalt

  ctx.fillStyle = blueGrad;
  ctx.fillText("R", startX, textY);

  // 2. "G" in Racing Crimson Red
  const gX = startX + 140;
  const redGrad = ctx.createLinearGradient(gX, textY - 140, gX + 140, textY);
  redGrad.addColorStop(0, "#F43F5E"); // bright rose red
  redGrad.addColorStop(0.5, "#DC2626"); // racing crimson
  redGrad.addColorStop(1, "#991B1B"); // deep scarlet

  ctx.fillStyle = redGrad;
  ctx.fillText("G", gX, textY);

  // 3. "MOTORS" in Liquid Chrome / Platinum White
  const motorsX = gX + 165;
  const motorsGrad = ctx.createLinearGradient(motorsX, textY - 140, motorsX, textY);
  motorsGrad.addColorStop(0, "#FFFFFF");
  motorsGrad.addColorStop(0.35, "#F1F5F9");
  motorsGrad.addColorStop(0.55, "#E2E8F0");
  motorsGrad.addColorStop(0.75, "#CBD5E1");
  motorsGrad.addColorStop(1, "#94A3B8");

  // Subtle dark outline on MOTORS for sports contrast
  ctx.strokeStyle = "rgba(0, 0, 0, 0.75)";
  ctx.lineWidth = 8;
  ctx.strokeText("MOTORS", motorsX, textY);

  ctx.fillStyle = motorsGrad;
  ctx.fillText("MOTORS", motorsX, textY);

  // Highlight line on MOTORS
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("MOTORS", motorsX, textY - 2);

  ctx.restore();

  // ==========================================
  // 4. SUBTITLE: "automotora" (Wide Italic White)
  // ==========================================
  ctx.save();
  ctx.font = "italic 700 58px 'SF Pro Display', 'Helvetica Neue', 'Arial', sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.letterSpacing = "22px";
  ctx.textAlign = "center";
  ctx.fillText("a u t o m o t o r a", centerX, barY + 235);
  ctx.restore();

  // Crop tightly to content
  const fullData = ctx.getImageData(0, 0, width, height);
  const px = fullData.data;

  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let i = 0; i < px.length; i += 4) {
    const a = px[i + 3];
    if (a > 10) {
      const idx = i / 4;
      const x = idx % width;
      const y = Math.floor(idx / width);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  const pad = 24;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);

  const croppedW = maxX - minX + 1;
  const croppedH = maxY - minY + 1;

  const croppedCanvas = createCanvas(croppedW, croppedH);
  const cropCtx = croppedCanvas.getContext("2d");
  cropCtx.drawImage(canvas, minX, minY, croppedW, croppedH, 0, 0, croppedW, croppedH);

  await mkdir(join(ROOT, "public", "brand"), { recursive: true });

  const pngBuffer = await croppedCanvas.encode("png");
  await writeFile(join(ROOT, "public", "logo.png"), pngBuffer);
  await writeFile(join(ROOT, "public", "logo-transparent.png"), pngBuffer);
  await writeFile(join(ROOT, "public", "logo-alt.png"), pngBuffer);
  await writeFile(join(ROOT, "public", "brand", "logo.png"), pngBuffer);

  console.log(`✅ Official Transparent Logo Generated: ${croppedW}x${croppedH}px`);
}

generateLogo().catch(console.error);
