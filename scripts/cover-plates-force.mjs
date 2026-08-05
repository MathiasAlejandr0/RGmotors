/**
 * Tapa la patente en el paragolpes inferior.
 * Coordenadas verificadas con regla en frame 083: placa ~y 0.84–0.92.
 */
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { readFile, writeFile, access } from "node:fs/promises";
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

async function paintFrom(srcPath, outPath, fx, fy, fw, fh) {
  const img = await loadImage(await readFile(srcPath));
  const c = createCanvas(img.width, img.height);
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const x = Math.max(0, Math.floor(fx * img.width));
  const y = Math.max(0, Math.floor(fy * img.height));
  const w = Math.min(img.width - x, Math.floor(fw * img.width));
  const h = Math.min(img.height - y, Math.floor(fh * img.height));

  ctx.fillStyle = "rgb(18, 20, 24)";
  ctx.fillRect(x, y, w, h);

  await writeFile(outPath, await c.encode("jpeg", 88));
}

/**
 * Rangos [from, to, x, y, w, h] — y medido con regla sobre 083:
 * placa entre ~0.84 y ~0.92 (NO 0.55–0.75 parrilla/cromado).
 */
const RANGES = [
  [40, 55, 0.52, 0.84, 0.38, 0.11],
  [56, 69, 0.45, 0.84, 0.38, 0.11],
  [70, 77, 0.36, 0.83, 0.34, 0.11],
  [78, 81, 0.36, 0.83, 0.32, 0.11],
  [82, 86, 0.34, 0.83, 0.34, 0.11],
  [87, 95, 0.28, 0.83, 0.36, 0.11],
  [96, 110, 0.12, 0.83, 0.38, 0.12],
  [111, 130, 0.06, 0.82, 0.38, 0.12],
];

const FINE = {
  81: [0.36, 0.82, 0.32, 0.12],
  82: [0.34, 0.83, 0.34, 0.11],
  83: [0.34, 0.83, 0.34, 0.11],
  84: [0.33, 0.83, 0.34, 0.11],
  85: [0.30, 0.82, 0.36, 0.12],
};

const EXTRAS = [
  ["public/cars/hero-rav4-real.jpg", 0.55, 0.80, 0.32, 0.14],
  ["public/cars/toyota-rav4-hibrido.jpg", 0.55, 0.80, 0.32, 0.14],
];

async function main() {
  let n = 0;

  for (const [from, to, x, y, w, h] of RANGES) {
    for (let i = from; i <= to; i++) {
      const id = String(i).padStart(3, "0");
      const out = join(SPIN, `${id}.jpg`);
      const bak = join(BACKUP, `${id}.jpg`);
      if (!(await exists(bak)) && !(await exists(out))) continue;
      const src = (await exists(bak)) ? bak : out;
      const [fx, fy, fw, fh] = FINE[i] || [x, y, w, h];
      await paintFrom(src, out, fx, fy, fw, fh);
      n += 1;
    }
  }

  for (const [path, x, y, w, h] of EXTRAS) {
    if (!(await exists(path))) continue;
    const name = path.split(/[/\\]/).pop();
    const bak = join("tmp-plate-backup", "extras", name);
    const src = (await exists(bak)) ? bak : path;
    await paintFrom(src, path, x, y, w, h);
    n += 1;
  }

  await writeFile(
    join(SPIN, "manifest.json"),
    JSON.stringify(
      {
        slug: "toyota-rav4-hibrido",
        count: 200,
        platesCovered: true,
        plateBand: "0.83-0.94",
        updatedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );

  console.log(`✓ ${n} frames — barra en y≈0.83–0.94 (paragolpes / placa)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
