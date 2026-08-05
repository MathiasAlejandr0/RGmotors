/**
 * Pinta de negro SOLO el rectángulo de la patente (ajustado por frame).
 * En ángulos la placa sube (~0.78); de frente baja (~0.84).
 */
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { readFile, writeFile, access, copyFile } from "node:fs/promises";
import { join } from "node:path";

const SPIN = "public/cars/spin/toyota-rav4-hibrido";
const BACKUP = "tmp-plate-backup/toyota-rav4-hibrido";

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/** Overrides medidos con grilla/regla (fracción 0–1): [x, y, w, h] — solo la placa */
const MANUAL = {
  // 073: grilla → placa cols ~0.60–0.75, filas ~0.77–0.83
  68: [0.66, 0.77, 0.16, 0.06],
  69: [0.64, 0.775, 0.16, 0.06],
  70: [0.63, 0.778, 0.16, 0.06],
  71: [0.61, 0.78, 0.17, 0.06],
  72: [0.50, 0.78, 0.28, 0.07],
  73: [0.48, 0.78, 0.30, 0.075],
  74: [0.47, 0.785, 0.28, 0.075],
  75: [0.45, 0.79, 0.26, 0.075],
  76: [0.43, 0.80, 0.24, 0.075],
  77: [0.41, 0.81, 0.22, 0.07],
  78: [0.40, 0.815, 0.20, 0.07],
  79: [0.39, 0.82, 0.20, 0.07],
  80: [0.38, 0.825, 0.20, 0.07],
  81: [0.37, 0.83, 0.20, 0.07],
  82: [0.36, 0.835, 0.20, 0.07],
  83: [0.375, 0.84, 0.18, 0.07],
  84: [0.35, 0.835, 0.20, 0.07],
  85: [0.33, 0.825, 0.20, 0.07],
  86: [0.30, 0.82, 0.20, 0.07],
  87: [0.26, 0.815, 0.20, 0.07],
  88: [0.23, 0.81, 0.20, 0.065],
  89: [0.20, 0.805, 0.20, 0.065],
  90: [0.18, 0.80, 0.20, 0.065],
  91: [0.16, 0.795, 0.18, 0.06],
  92: [0.14, 0.79, 0.18, 0.06],
};

const EXTRAS = [
  ["public/cars/hero-rav4-real.jpg", 0.55, 0.80, 0.22, 0.08],
  ["public/cars/toyota-rav4-hibrido.jpg", 0.55, 0.80, 0.22, 0.08],
];

async function paintTight(srcPath, outPath, fx, fy, fw, fh) {
  const img = await loadImage(await readFile(srcPath));
  const c = createCanvas(img.width, img.height);
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  ctx.fillStyle = "rgb(18, 20, 24)";
  ctx.fillRect(
    Math.floor(fx * img.width),
    Math.floor(fy * img.height),
    Math.floor(fw * img.width),
    Math.floor(fh * img.height)
  );
  await writeFile(outPath, await c.encode("jpeg", 88));
}

async function main() {
  let restored = 0;
  for (let i = 1; i <= 200; i++) {
    const id = String(i).padStart(3, "0");
    const bak = join(BACKUP, `${id}.jpg`);
    const out = join(SPIN, `${id}.jpg`);
    if (!(await exists(bak))) continue;
    await copyFile(bak, out);
    restored += 1;
  }

  let covered = 0;
  for (const [num, box] of Object.entries(MANUAL)) {
    const id = String(num).padStart(3, "0");
    const bak = join(BACKUP, `${id}.jpg`);
    const out = join(SPIN, `${id}.jpg`);
    if (!(await exists(bak))) continue;
    await paintTight(bak, out, ...box);
    covered += 1;
  }

  for (const [path, x, y, w, h] of EXTRAS) {
    if (!(await exists(path))) continue;
    const name = path.split(/[/\\]/).pop();
    const bak = join("tmp-plate-backup", "extras", name);
    const src = (await exists(bak)) ? bak : path;
    await paintTight(src, path, x, y, w, h);
  }

  await writeFile(
    join(SPIN, "manifest.json"),
    JSON.stringify(
      {
        slug: "toyota-rav4-hibrido",
        count: 200,
        platesCovered: true,
        method: "tight-manual-plate",
        frames: Object.keys(MANUAL)
          .map(Number)
          .sort((a, b) => a - b),
        updatedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );

  console.log(
    `✓ restaurados ${restored}, patentes pintadas (solo placa): ${covered}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
