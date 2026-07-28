/**
 * Genera una lámina de contacto (6x4) con los 24 frames del giro 360°
 * del Mazda CX-5, para revisar la secuencia completa de un vistazo.
 * Salida: assets/cx5-360-contactsheet.png
 */
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SPIN_DIR = join(__dirname, "..", "public", "cars", "spin", "mazda-cx5-2021");
const OUT = "C:\\Users\\mathi\\.cursor\\projects\\d-RgMotors\\assets\\cx5-360-contactsheet.png";

const COLS = 6;
const ROWS = 4;
const CELL_W = 360;
const CELL_H = 203; // 16:9
const PAD = 8;

async function main() {
  const W = COLS * CELL_W + PAD * (COLS + 1);
  const H = ROWS * CELL_H + PAD * (ROWS + 1);
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#090909";
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 24; i++) {
    const name = `${String(i + 1).padStart(3, "0")}.jpg`;
    const img = await loadImage(join(SPIN_DIR, name));
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = PAD + col * (CELL_W + PAD);
    const y = PAD + row * (CELL_H + PAD);
    ctx.drawImage(img, x, y, CELL_W, CELL_H);

    // etiqueta de ángulo
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(x, y, 54, 20);
    ctx.fillStyle = "#49A7FF";
    ctx.font = "12px sans-serif";
    ctx.fillText(`${i * 15}°`, x + 8, y + 14);
  }

  const png = await canvas.encode("png");
  await writeFile(OUT, png);
  console.log(`✓ Lámina de contacto en ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
