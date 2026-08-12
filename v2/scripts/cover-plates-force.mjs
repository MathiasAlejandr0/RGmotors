/**
 * Tour 360 únicamente: pinta SOLO la patente (delantera y trasera).
 * Fotos estáticas se restauran sin tapa.
 *
 * Coordenadas [x, y, w, h] en fracción 0–1, medidas con grilla.
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

/** Patente DELANTERA — solo frames donde se lee */
const FRONT = {
  62: [0.58, 0.78, 0.18, 0.06],
  63: [0.56, 0.78, 0.19, 0.06],
  64: [0.55, 0.78, 0.19, 0.06],
  65: [0.54, 0.78, 0.19, 0.06],
  66: [0.53, 0.78, 0.20, 0.06],
  67: [0.52, 0.78, 0.20, 0.06],
  68: [0.51, 0.78, 0.22, 0.065],
  69: [0.50, 0.78, 0.23, 0.065],
  70: [0.49, 0.78, 0.24, 0.065],
  71: [0.48, 0.78, 0.25, 0.07],
  72: [0.48, 0.78, 0.26, 0.07],
  73: [0.48, 0.78, 0.27, 0.07],
  74: [0.47, 0.785, 0.26, 0.07],
  75: [0.45, 0.79, 0.24, 0.07],
  76: [0.43, 0.80, 0.22, 0.07],
  77: [0.42, 0.81, 0.20, 0.07],
  78: [0.41, 0.815, 0.18, 0.07],
  79: [0.40, 0.82, 0.18, 0.07],
  80: [0.40, 0.825, 0.17, 0.07],
  81: [0.39, 0.83, 0.17, 0.07],
  82: [0.39, 0.835, 0.16, 0.07],
  83: [0.39, 0.84, 0.16, 0.07],
  84: [0.36, 0.83, 0.16, 0.07],
  85: [0.34, 0.82, 0.16, 0.07],
  86: [0.31, 0.815, 0.16, 0.07],
  87: [0.28, 0.81, 0.16, 0.07],
  88: [0.25, 0.80, 0.16, 0.07],
  89: [0.23, 0.795, 0.16, 0.07],
  90: [0.21, 0.78, 0.16, 0.07],
  91: [0.20, 0.775, 0.16, 0.07],
  92: [0.20, 0.77, 0.16, 0.07],
  93: [0.21, 0.76, 0.16, 0.06],
  94: [0.23, 0.765, 0.13, 0.05],
  95: [0.225, 0.76, 0.13, 0.055],
  96: [0.22, 0.76, 0.125, 0.065],
  97: [0.215, 0.76, 0.12, 0.07],
  98: [0.21, 0.76, 0.115, 0.075],
  99: [0.20, 0.76, 0.115, 0.075],
  100: [0.18, 0.76, 0.115, 0.075],
  101: [0.16, 0.765, 0.115, 0.065],
  102: [0.14, 0.77, 0.115, 0.055],
};

/** Patente TRASERA — solo placa en el portón (no logo Toyota) */
const REAR = {
  155: [0.48, 0.56, 0.16, 0.07],
  156: [0.46, 0.555, 0.16, 0.07],
  157: [0.44, 0.55, 0.17, 0.07],
  158: [0.42, 0.545, 0.18, 0.07],
  159: [0.40, 0.545, 0.20, 0.075],
  160: [0.37, 0.535, 0.16, 0.07],
  161: [0.34, 0.525, 0.13, 0.07],
  162: [0.32, 0.52, 0.12, 0.065],
  163: [0.30, 0.515, 0.12, 0.065],
  164: [0.31, 0.515, 0.11, 0.065],
  165: [0.30, 0.515, 0.12, 0.07],
  166: [0.325, 0.515, 0.11, 0.07],
  167: [0.30, 0.51, 0.11, 0.07],
  168: [0.285, 0.505, 0.11, 0.075],
  169: [0.275, 0.51, 0.115, 0.075],
  170: [0.275, 0.53, 0.12, 0.065],
  171: [0.215, 0.53, 0.125, 0.065],
  172: [0.185, 0.53, 0.125, 0.065],
  173: [0.145, 0.53, 0.125, 0.06],
};

const STATIC_RESTORE = [
  "public/cars/hero-rav4-real.jpg",
  "public/cars/toyota-rav4-hibrido.jpg",
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
  // 1) Restaurar spin completo
  let restored = 0;
  for (let i = 1; i <= 200; i++) {
    const id = String(i).padStart(3, "0");
    const bak = join(BACKUP, `${id}.jpg`);
    const out = join(SPIN, `${id}.jpg`);
    if (!(await exists(bak))) continue;
    await copyFile(bak, out);
    restored += 1;
  }

  // 2) Restaurar estáticas (sin tapa)
  let statics = 0;
  for (const path of STATIC_RESTORE) {
    const name = path.split(/[/\\]/).pop();
    const bak = join("tmp-plate-backup", "extras", name);
    if (!(await exists(bak))) continue;
    await copyFile(bak, path);
    statics += 1;
  }

  // 3) Solo tour: delantera + trasera
  let covered = 0;
  for (const map of [FRONT, REAR]) {
    for (const [num, box] of Object.entries(map)) {
      const id = String(num).padStart(3, "0");
      const bak = join(BACKUP, `${id}.jpg`);
      const out = join(SPIN, `${id}.jpg`);
      if (!(await exists(bak))) continue;
      await paintTight(bak, out, ...box);
      covered += 1;
    }
  }

  const frontIds = Object.keys(FRONT).map(Number).sort((a, b) => a - b);
  const rearIds = Object.keys(REAR).map(Number).sort((a, b) => a - b);

  await writeFile(
    join(SPIN, "manifest.json"),
    JSON.stringify(
      {
        slug: "toyota-rav4-hibrido",
        count: 200,
        platesCovered: true,
        method: "tour-only-tight-manual",
        front: frontIds,
        rear: rearIds,
        staticUntouched: true,
        updatedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );

  console.log(
    `✓ spin ${restored}, estáticas restauradas ${statics}, patentes tour ${covered}`
  );
  console.log(`  delantera ${frontIds[0]}–${frontIds.at(-1)} (${frontIds.length})`);
  console.log(`  trasera ${rearIds[0]}–${rearIds.at(-1)} (${rearIds.length})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
