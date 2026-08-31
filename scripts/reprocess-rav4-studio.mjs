import { createCanvas, loadImage } from "@napi-rs/canvas";
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const IN_DIR = "public/cars/spin/toyota-rav4-hibrido";
const OUT_DIR = "public/cars/spin/toyota-rav4-hibrido";
const W = 1600;
const H = 900;

function drawStudioEnvironment(ctx) {
  // 1. Fondo de estudio cinematográfico oscuro con profundidad
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, "#080b11");
  bgGrad.addColorStop(0.48, "#0d131d");
  bgGrad.addColorStop(0.68, "#111824");
  bgGrad.addColorStop(0.72, "#0c111a");
  bgGrad.addColorStop(1, "#05070a");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // 2. Luz de horizonte azulada elegante detrás del auto (como en showroom oficial)
  const horizonY = H * 0.69;
  const horizonLight = ctx.createLinearGradient(0, horizonY - 140, 0, horizonY + 40);
  horizonLight.addColorStop(0, "rgba(23, 58, 121, 0)");
  horizonLight.addColorStop(0.65, "rgba(46, 98, 184, 0.28)");
  horizonLight.addColorStop(0.85, "rgba(101, 151, 229, 0.45)");
  horizonLight.addColorStop(1, "rgba(23, 58, 121, 0.05)");
  ctx.fillStyle = horizonLight;
  ctx.fillRect(0, horizonY - 140, W, 180);

  // 3. Foco cenital suave sobre el vehículo
  const topSpot = ctx.createRadialGradient(W / 2, H * 0.25, 40, W / 2, H * 0.35, W * 0.55);
  topSpot.addColorStop(0, "rgba(200, 225, 255, 0.12)");
  topSpot.addColorStop(0.5, "rgba(100, 150, 220, 0.04)");
  topSpot.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = topSpot;
  ctx.fillRect(0, 0, W, H);

  // 4. Plataforma giratoria (Turntable) en el piso
  const floorY = H * 0.70;
  
  // Base del piso oscuro reflectante
  const floorGrad = ctx.createLinearGradient(0, floorY, 0, H);
  floorGrad.addColorStop(0, "#0a0e14");
  floorGrad.addColorStop(0.4, "#06080c");
  floorGrad.addColorStop(1, "#030406");
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, floorY, W, H - floorY);

  // Anillo de luz en la plataforma giratoria
  ctx.save();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "rgba(101, 151, 229, 0.35)";
  ctx.beginPath();
  ctx.ellipse(W / 2, floorY + 110, W * 0.46, H * 0.14, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Brillo del anillo
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(46, 98, 184, 0.12)";
  ctx.beginPath();
  ctx.ellipse(W / 2, floorY + 110, W * 0.46, H * 0.14, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

async function processSingleFrame(srcPath, idx, total) {
  const rawImg = await loadImage(srcPath);
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Dibuja el entorno realista
  drawStudioEnvironment(ctx);

  // Extrae la porción del auto desde la imagen original
  // El auto original está en el centro superior (y entre 0.15*H y 0.73*H)
  const tempCanvas = createCanvas(W, H);
  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.drawImage(rawImg, 0, 0, W, H);

  // Recortamos la zona del auto para no arrastrar el viejo fondo y reflejo cortado
  // En las fotos actuales de toyota-rav4-hibrido, el auto está en ~ y: 150 a 660
  const carCutH = Math.round(H * 0.58);
  const carCutY = Math.round(H * 0.14);
  const carCanvas = createCanvas(W, carCutH);
  const carCtx = carCanvas.getContext("2d");
  carCtx.drawImage(rawImg, 0, carCutY, W, carCutH, 0, 0, W, carCutH);

  // Posición de asentamiento en el nuevo estudio
  const targetFloorY = H * 0.72;
  const targetCarY = targetFloorY - carCutH;

  // 1. Sombras de contacto orgánicas multi-nivel bajo los neumáticos
  ctx.save();
  const shadowY = targetFloorY - 4;

  // Sombra de contacto difusa amplia (bajo el chasis entero)
  const ambShadow = ctx.createRadialGradient(W / 2, shadowY, 80, W / 2, shadowY, W * 0.42);
  ambShadow.addColorStop(0, "rgba(0, 0, 0, 0.85)");
  ambShadow.addColorStop(0.4, "rgba(0, 0, 0, 0.50)");
  ambShadow.addColorStop(0.8, "rgba(0, 0, 0, 0.18)");
  ambShadow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = ambShadow;
  ctx.beginPath();
  ctx.ellipse(W / 2, shadowY, W * 0.40, 36, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sombras directas oscuras bajo ruedas (izquierda y derecha)
  const leftTireX = W * 0.28;
  const rightTireX = W * 0.72;
  for (const tx of [leftTireX, rightTireX]) {
    const tireShadow = ctx.createRadialGradient(tx, shadowY + 2, 10, tx, shadowY + 2, 140);
    tireShadow.addColorStop(0, "rgba(0, 0, 0, 0.95)");
    tireShadow.addColorStop(0.5, "rgba(0, 0, 0, 0.60)");
    tireShadow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = tireShadow;
    ctx.beginPath();
    ctx.ellipse(tx, shadowY + 2, 120, 22, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 2. Reflejo orgánico suave y difuminado en el piso (sin cortes)
  ctx.save();
  ctx.translate(0, targetFloorY * 2);
  ctx.scale(1, -1);
  ctx.globalAlpha = 0.22;
  ctx.drawImage(carCanvas, 0, 0, W, carCutH, 0, targetFloorY, W, carCutH);

  // Gradiente de desvanecimiento del reflejo
  const refFade = ctx.createLinearGradient(0, targetFloorY, 0, targetFloorY + carCutH * 0.6);
  refFade.addColorStop(0, "rgba(5, 7, 10, 0)");
  refFade.addColorStop(0.5, "rgba(5, 7, 10, 0.75)");
  refFade.addColorStop(1, "rgba(5, 7, 10, 1.0)");
  ctx.fillStyle = refFade;
  ctx.globalAlpha = 1.0;
  ctx.fillRect(0, targetFloorY, W, carCutH);
  ctx.restore();

  // 3. Dibujar el auto asentado naturalmente
  ctx.drawImage(carCanvas, 0, 0, W, carCutH, 0, targetCarY, W, carCutH);

  // 4. Viñeta cinematográfica en los bordes
  const vin = ctx.createRadialGradient(W / 2, H / 2, W * 0.35, W / 2, H / 2, W * 0.70);
  vin.addColorStop(0, "rgba(0, 0, 0, 0)");
  vin.addColorStop(1, "rgba(0, 0, 0, 0.45)");
  ctx.fillStyle = vin;
  ctx.fillRect(0, 0, W, H);

  return canvas.encode("jpeg", 90);
}

async function main() {
  const files = (await readdir(IN_DIR))
    .filter((f) => f.endsWith(".jpg"))
    .sort();

  console.log(`Procesando ${files.length} frames para estudio realista...`);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const src = join(IN_DIR, file);
    const jpg = await processSingleFrame(src, i, files.length);
    await writeFile(join(OUT_DIR, file), jpg);
    process.stdout.write(`\r  Frame ${i + 1}/${files.length} completado`);
  }

  console.log("\n✅ ¡Frames de estudio realista generados con éxito!");
}

main().catch(console.error);
