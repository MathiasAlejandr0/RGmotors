/**
 * Convierte los renders de estudio generados (assets/veh-<slug>.png) a JPG
 * optimizados y los deja en public/cars/<slug>.jpg, listos para el catálogo.
 *
 * Uso: node scripts/build-catalog-images.mjs
 */
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { mkdir, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SRC_DIR = "C:\\Users\\mathi\\.cursor\\projects\\d-RgMotors\\assets";
const OUT_DIR = join(__dirname, "..", "public", "cars");

// Slugs a montar (uno por vehículo, el CX-5 ya tiene su giro 360°).
const SLUGS = [
  "toyota-rav4-2022",
  "hyundai-tucson-2020",
  "ford-ranger-2021",
  "toyota-hilux-2020",
  "kia-sportage-2019",
  "chevrolet-sail-2020",
  "nissan-versa-2021",
  "suzuki-swift-2022",
];

// Tamaño de salida uniforme (16:9).
const W = 1280;
const H = 720;

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  let done = 0;
  for (const slug of SLUGS) {
    const src = join(SRC_DIR, `veh-${slug}.png`);
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

    // Dibujo "cover" centrado para llenar el cuadro sin bordes.
    const scale = Math.max(W / img.width, H / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);

    const jpg = await canvas.encode("jpeg", 84);
    await writeFile(join(OUT_DIR, `${slug}.jpg`), jpg);
    done += 1;
    process.stdout.write(`\r  Montando catálogo... ${done}/${SLUGS.length}`);
  }

  console.log(`\n✓ ${done} imágenes en public/cars/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
