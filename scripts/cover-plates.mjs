/**
 * Tapa patentes del RAV4: busca placa en la zona inferior del auto
 * (bbox del vehículo) y, si hay vista frontal, cubre el paragolpes central.
 *
 * Uso: node scripts/cover-plates.mjs [--slug toyota-rav4-hibrido]
 */
import { createCanvas, loadImage } from "@napi-rs/canvas";
import {
  readdir,
  readFile,
  writeFile,
  copyFile,
  mkdir,
  access,
} from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const slug =
  process.argv.includes("--slug")
    ? process.argv[process.argv.indexOf("--slug") + 1]
    : "toyota-rav4-hibrido";

const DIR = join(__dirname, "..", "public", "cars", "spin", slug);
const BACKUP = join(__dirname, "..", "tmp-plate-backup", slug);
const EXTRA = [
  join(__dirname, "..", "public", "cars", "hero-rav4-real.jpg"),
  join(__dirname, "..", "public", "cars", "toyota-rav4-hibrido.jpg"),
];

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/** BBox aproximado del auto (excluye cielo y bordes). */
function carBBox(data, w, h) {
  let minX = w,
    minY = h,
    maxX = 0,
    maxY = 0,
    n = 0;
  for (let y = Math.floor(h * 0.15); y < Math.floor(h * 0.9); y += 3) {
    for (let x = Math.floor(w * 0.05); x < Math.floor(w * 0.95); x += 3) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // cielo azul / muy brillante arriba
      if (b > 150 && b > r + 20 && b > g + 10) continue;
      if ((r + g + b) / 3 > 230) continue;
      // asfalto muy oscuro uniforme abajo no cuenta si es borde
      const avg = (r + g + b) / 3;
      // carrocería plata / negros del trim / vidrios
      if (avg < 25) continue;
      if (avg > 40 || Math.max(r, g, b) - Math.min(r, g, b) > 15) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        n += 1;
      }
    }
  }
  if (n < 200) return null;
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

function isPlateWhite(r, g, b) {
  const a = (r + g + b) / 3;
  return a > 150 && Math.max(r, g, b) - Math.min(r, g, b) < 55;
}

function findPlateInZone(data, w, h, zone) {
  const sizes = [
    [100, 32],
    [115, 36],
    [130, 40],
    [90, 30],
    [145, 42],
  ];
  let best = null;

  for (const [bw, bh] of sizes) {
    for (let y = zone.y; y <= zone.y + zone.h - bh; y += 3) {
      for (let x = zone.x; x <= zone.x + zone.w - bw; x += 3) {
        let wh = 0;
        let dk = 0;
        let tot = 0;
        let sum = 0;
        for (let yy = y; yy < y + bh; yy += 2) {
          for (let xx = x; xx < x + bw; xx += 2) {
            const i = (yy * w + xx) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const avg = (r + g + b) / 3;
            tot += 1;
            sum += avg;
            if (isPlateWhite(r, g, b)) wh += 1;
            else if (avg < 100) dk += 1;
          }
        }
        const wr = wh / tot;
        const dr = dk / tot;
        const mean = sum / tot;
        // Umbral alto: evita tapar puertas/trim en vistas laterales
        if (mean < 145 || wr < 0.42 || dr < 0.1 || dr > 0.38) continue;
        const score = wr * dr * mean;
        if (!best || score > best.score) {
          best = { x, y, w: bw, h: bh, score };
        }
      }
    }
  }
  return best;
}

function expandPlate(data, w, h, box) {
  // A menudo el detector pilla solo la mitad derecha: ampliar fuerte a la izq.
  let x0 = box.x;
  let x1 = box.x + box.w;
  const y0 = Math.max(0, box.y - 2);
  const y1 = Math.min(h, box.y + box.h + 2);

  const colScore = (x) => {
    let white = 0;
    let dark = 0;
    for (let y = y0; y < y1; y += 1) {
      const i = (y * w + x) * 4;
      const a = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (isPlateWhite(data[i], data[i + 1], data[i + 2])) white += 1;
      else if (a < 110) dark += 1;
    }
    return white >= 2 || (white >= 1 && dark >= 2);
  };

  while (x0 > 8 && colScore(x0 - 1)) x0 -= 1;
  while (x1 < w - 8 && colScore(x1 + 1)) x1 += 1;

  // Ancho mínimo generoso + sesgo a la izquierda
  const minW = Math.max(x1 - x0, Math.floor(w * 0.11));
  let cx = (x0 + x1) / 2 - minW * 0.12;
  x0 = Math.floor(cx - minW / 2);
  x1 = Math.floor(cx + minW / 2);

  return {
    x: Math.max(0, x0),
    y: Math.max(0, box.y - 6),
    w: Math.min(w, x1) - Math.max(0, x0),
    h: Math.min(h - box.y + 6, Math.max(box.h + 14, Math.floor(h * 0.055))),
    score: box.score,
  };
}

function coverBox(ctx, box, W, H) {
  const padX = 14;
  const padY = 8;
  const x = Math.max(0, Math.floor(box.x - padX));
  const y = Math.max(0, Math.floor(box.y - padY));
  const bw = Math.min(W - x, Math.ceil(Math.max(box.w, W * 0.09) + padX * 2));
  const bh = Math.min(H - y, Math.ceil(box.h + padY * 2));

  // Color local del paragolpes
  const sx = Math.max(0, x - 10);
  const sy = Math.max(0, y - 10);
  const sample = ctx.getImageData(
    sx,
    sy,
    Math.min(W - sx, bw + 20),
    Math.min(H - sy, bh + 20)
  ).data;
  let r = 0,
    g = 0,
    b = 0,
    n = 0;
  for (let i = 0; i < sample.length; i += 20) {
    const rr = sample[i];
    const gg = sample[i + 1];
    const bb = sample[i + 2];
    const a = (rr + gg + bb) / 3;
    if (a > 40 && a < 160) {
      r += rr;
      g += gg;
      b += bb;
      n += 1;
    }
  }
  if (n < 6) {
    r = 45;
    g = 48;
    b = 52;
  } else {
    r = (r / n) | 0;
    g = (g / n) | 0;
    b = (b / n) | 0;
  }

  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(x, y, bw, bh);
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(x, y, bw, bh);
}

async function processFile(path, { restoreFrom, backupDir } = {}) {
  const name = path.split(/[/\\]/).pop();
  let src = path;
  if (restoreFrom) {
    const bak = join(restoreFrom, name);
    if (await exists(bak)) src = bak;
  }

  const img = await loadImage(await readFile(src));
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const { width: w, height: h } = img;
  const imgData = ctx.getImageData(0, 0, w, h);
  const box = carBBox(imgData.data, w, h);

  const covers = [];

  if (box) {
    // Zona inferior del auto (paragolpes), centro horizontal
    const zone = {
      x: Math.floor(box.x + box.w * 0.15),
      y: Math.floor(box.y + box.h * 0.62),
      w: Math.floor(box.w * 0.7),
      h: Math.floor(box.h * 0.32),
    };
    zone.x = Math.max(0, zone.x);
    zone.y = Math.max(0, zone.y);
    zone.w = Math.min(w - zone.x, zone.w);
    zone.h = Math.min(h - zone.y, zone.h);

    const plate = findPlateInZone(imgData.data, w, h, zone);
    // Solo tapa si está lo bastante abajo (evita manchas en puertas laterales)
    if (plate && plate.y + plate.h / 2 >= h * 0.6) {
      covers.push(expandPlate(imgData.data, w, h, plate));
    }
  }

  if (!covers.length) {
    if (src !== path) await writeFile(path, await canvas.encode("jpeg", 88));
    return { covered: 0 };
  }

  if (backupDir && src === path) {
    await mkdir(backupDir, { recursive: true });
    const bak = join(backupDir, name);
    if (!(await exists(bak))) await copyFile(path, bak);
  }

  for (const c of covers) coverBox(ctx, c, w, h);
  await writeFile(path, await canvas.encode("jpeg", 88));
  return { covered: covers.length };
}

async function main() {
  const files = (await readdir(DIR))
    .filter((f) => /^\d+\.jpg$/i.test(f))
    .sort()
    .map((f) => join(DIR, f));
  const hasBackup = await exists(BACKUP);

  console.log(
    `→ Tapando patentes · ${files.length} frames` +
      (hasBackup ? " (desde backup)" : "")
  );

  let n = 0;
  let hits = 0;
  for (const f of files) {
    const r = await processFile(f, {
      restoreFrom: hasBackup ? BACKUP : undefined,
      backupDir: BACKUP,
    });
    n += 1;
    if (r.covered) hits += 1;
    if (n % 20 === 0 || r.covered) {
      process.stdout.write(`\r  ${n}/${files.length}  tapadas: ${hits}   `);
    }
  }

  const extraBak = join(__dirname, "..", "tmp-plate-backup", "extras");
  for (const f of EXTRA) {
    try {
      const r = await processFile(f, {
        restoreFrom: (await exists(extraBak)) ? extraBak : undefined,
        backupDir: extraBak,
      });
      console.log(
        `\n  ${f.split(/[/\\]/).pop()}: ${r.covered ? "ok" : "sin detect"}`
      );
    } catch (e) {
      console.warn(`\n  ! ${e.message}`);
    }
  }

  await writeFile(
    join(DIR, "manifest.json"),
    JSON.stringify(
      {
        slug,
        count: files.length,
        platesCovered: true,
        updatedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );

  console.log(`\n✓ Listo: ${hits}/${files.length} frames con tapa`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
