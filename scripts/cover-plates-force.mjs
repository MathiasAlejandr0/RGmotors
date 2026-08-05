/**
 * Tapas amplias en frames frontales donde aún se lee la patente.
 */
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { readFile, writeFile } from "node:fs/promises";

const JOBS = [];

// Vista frontal (patente a la izquierda del frame)
for (let i = 90; i <= 120; i++) {
  const id = String(i).padStart(3, "0");
  JOBS.push([
    `public/cars/spin/toyota-rav4-hibrido/${id}.jpg`,
    0.16,
    0.65,
    0.26,
    0.18,
  ]);
}

// Vista 3/4 delantera (patente a la derecha)
for (let i = 48; i <= 72; i++) {
  const id = String(i).padStart(3, "0");
  JOBS.push([
    `public/cars/spin/toyota-rav4-hibrido/${id}.jpg`,
    0.62,
    0.66,
    0.28,
    0.16,
  ]);
}

JOBS.push(
  ["public/cars/hero-rav4-real.jpg", 0.68, 0.62, 0.24, 0.18],
  ["public/cars/toyota-rav4-hibrido.jpg", 0.68, 0.62, 0.24, 0.18]
);

async function paint(path, fx, fy, fw, fh) {
  const img = await loadImage(await readFile(path));
  const c = createCanvas(img.width, img.height);
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const x = (fx * img.width) | 0;
  const y = (fy * img.height) | 0;
  const w = (fw * img.width) | 0;
  const h = (fh * img.height) | 0;

  const sx = Math.max(0, x - 20);
  const sy = Math.max(0, y - 20);
  const s = ctx.getImageData(
    sx,
    sy,
    Math.min(img.width - sx, w + 40),
    Math.min(img.height - sy, h + 40)
  ).data;
  let r = 0,
    g = 0,
    b = 0,
    n = 0;
  for (let i = 0; i < s.length; i += 16) {
    const a = (s[i] + s[i + 1] + s[i + 2]) / 3;
    if (a > 35 && a < 140) {
      r += s[i];
      g += s[i + 1];
      b += s[i + 2];
      n += 1;
    }
  }
  if (n < 5) {
    r = 40;
    g = 42;
    b = 46;
  } else {
    r = (r / n) | 0;
    g = (g / n) | 0;
    b = (b / n) | 0;
  }
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(x, y, w, h);
  await writeFile(path, await c.encode("jpeg", 88));
  console.log("ok", path.split(/[/\\]/).pop());
}

for (const j of JOBS) await paint(...j);
console.log("✓ tapas forzadas");
