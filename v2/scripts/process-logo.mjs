/**
 * Procesa los logos de RG Motors: quita el fondo negro (lo vuelve transparente)
 * y recorta al contenido, para que el logo se integre sobre cualquier fondo
 * oscuro de la interfaz.
 *
 * Uso: node scripts/process-logo.mjs
 */
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const LOW = 34; // por debajo => transparente
const HIGH = 92; // por encima => opaco

async function process(inputName, outputName) {
  const img = await loadImage(join(ROOT, inputName));
  const w = img.width;
  const h = img.height;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;

  let minX = w, minY = h, maxX = 0, maxY = 0;

  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], g = px[i + 1], b = px[i + 2];
    const maxC = Math.max(r, g, b);
    let a = (maxC - LOW) / (HIGH - LOW);
    a = Math.max(0, Math.min(1, a));
    px[i + 3] = Math.round(a * 255);

    if (a > 0.25) {
      const idx = i / 4;
      const x = idx % w;
      const y = (idx - x) / w;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  ctx.putImageData(data, 0, 0);

  // Recorte con un pequeño margen
  const pad = Math.round(h * 0.02);
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;

  const out = createCanvas(cw, ch);
  const octx = out.getContext("2d");
  octx.drawImage(canvas, minX, minY, cw, ch, 0, 0, cw, ch);

  const png = await out.encode("png");
  await writeFile(join(ROOT, "public", outputName), png);
  console.log(`✓ ${outputName}  (${cw}x${ch})`);
}

await process("LogoRGmotors.png", "logo.png");
await process("Logo2.png", "logo-alt.png");
console.log("Listo.");
