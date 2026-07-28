/**
 * Monta el giro 360° del Mazda CX-5 a partir de los renders generados.
 * Toma los 24 renders (en orden de rotación) y los exporta como JPG
 * optimizados: public/cars/spin/mazda-cx5-2021/001.jpg ... 024.jpg
 *
 * Uso: node scripts/build-cx5-spin.mjs
 */
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { mkdir, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Carpeta donde quedaron los renders generados.
const SRC_DIR = "C:\\Users\\mathi\\.cursor\\projects\\d-RgMotors\\assets";

const OUT_DIR = join(
  __dirname,
  "..",
  "public",
  "cars",
  "spin",
  "mazda-cx5-2021"
);

// Orden de rotación completo (0° -> 345°, cada 15°).
const ORDER = [
  "spin-front-000.png", // 0°  frente
  "a015.png",
  "a030.png",
  "spin-hero-000.png", // 45° 3/4 delantero izq
  "a060.png",
  "a075.png",
  "spin-side-090.png", // 90° perfil izq
  "a105.png",
  "a120.png",
  "spin-rear34-135.png", // 135° 3/4 trasero izq
  "a150.png",
  "a165.png",
  "spin-rear-180.png", // 180° trasera
  "a195.png",
  "a210.png",
  "a225.png",
  "a240.png",
  "a255.png",
  "a270.png", // 270° perfil der
  "a285.png",
  "a300.png",
  "a315.png",
  "a330.png",
  "a345.png",
];

// Tamaño de salida uniforme (16:9). Todos los renders se dibujan "contain".
const W = 1280;
const H = 720;

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  let i = 0;
  for (const file of ORDER) {
    const src = join(SRC_DIR, file);
    try {
      await access(src);
    } catch {
      console.error(`\n✗ Falta el render: ${src}`);
      process.exit(1);
    }

    const img = await loadImage(src);
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    // Fondo del estudio (por si el aspecto no calza exacto).
    ctx.fillStyle = "#0b0d10";
    ctx.fillRect(0, 0, W, H);

    // Dibujo "contain" centrado.
    const scale = Math.min(W / img.width, H / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);

    const jpg = await canvas.encode("jpeg", 82);
    const name = `${String(i + 1).padStart(3, "0")}.jpg`;
    await writeFile(join(OUT_DIR, name), jpg);
    i += 1;
    process.stdout.write(`\r  Montando 360°... ${i}/${ORDER.length}`);
  }

  console.log(
    `\n✓ ${ORDER.length} frames en public/cars/spin/mazda-cx5-2021/`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
