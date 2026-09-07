/**
 * Empareja fotos locales por patente (carpeta descargada de Drive) al stock.
 * Sin match → placeholder azul "fotografías en preparación".
 *
 * Uso:
 *   node scripts/apply-local-plate-photos.mjs "C:\ruta\a\carpeta-descargada"
 *
 * Estructura esperada:
 *   <carpeta>/<PATENTE>/*.jpg
 *   o <carpeta>/<cualquier-nombre-con-patente>/*.jpg
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pickFrontCoverFile, withFrontCover } from "./lib/front-cover-map.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PLACEHOLDER = "/images/placeholder-pending-car.svg";
const MAX_PHOTOS = 12;

function cleanPlate(p) {
  return String(p || "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
}

function extractPlate(text) {
  const compact = cleanPlate(text);
  const m =
    compact.match(/[A-Z]{4}\d{2}/) ||
    compact.match(/[A-Z]{2}\d{4}/) ||
    compact.match(/[A-Z]{3}\d{3}/);
  return m ? m[0] : "";
}

function listImages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp|heic)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function copyPhotos(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  const imgs = listImages(srcDir).slice(0, MAX_PHOTOS);
  const files = [];
  imgs.forEach((srcName, i) => {
    const ext = path.extname(srcName).toLowerCase() || ".jpg";
    const destName = `photo-${String(i + 1).padStart(2, "0")}${ext === ".jpeg" ? ".jpg" : ext}`;
    fs.copyFileSync(path.join(srcDir, srcName), path.join(destDir, destName));
    files.push(destName);
  });
  return files;
}

function writeVehiclesTs(vehicles) {
  const existing = path.join(ROOT, "lib", "vehicles.ts");
  const src = fs.readFileSync(existing, "utf8");
  const marker = "export const initialVehicles: Vehicle[] = ";
  const start = src.indexOf(marker);
  const arrStart = src.indexOf("[", start);
  const end = src.indexOf("\nexport const HERO_SHOWCASE_VEHICLES");
  if (start < 0 || arrStart < 0 || end < 0) {
    throw new Error("No se pudo regenerar lib/vehicles.ts");
  }
  fs.writeFileSync(
    existing,
    src.slice(0, arrStart) + JSON.stringify(vehicles, null, 2) + ";" + src.slice(end),
    "utf8",
  );
}

function indexPlateFolders(rootDir) {
  const map = new Map(); // plate -> abs path
  if (!fs.existsSync(rootDir)) return map;

  const walk = (dir, depth = 0) => {
    if (depth > 3) return;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!ent.isDirectory()) continue;
      const full = path.join(dir, ent.name);
      const plate = extractPlate(ent.name);
      const imgs = listImages(full);
      if (plate && imgs.length) {
        if (!map.has(plate)) map.set(plate, full);
      }
      walk(full, depth + 1);
    }
  };
  walk(rootDir, 0);
  return map;
}

const localRoot = process.argv[2];
if (!localRoot) {
  console.error(
    'Falta la ruta local.\nEjemplo: node scripts/apply-local-plate-photos.mjs "C:\\\\Users\\\\mathi\\\\Downloads\\\\fotos-rg"',
  );
  process.exit(1);
}

const absRoot = path.resolve(localRoot);
const plateDirs = indexPlateFolders(absRoot);
console.log(`Carpetas con patente+fotos en ${absRoot}: ${plateDirs.size}`);

const vehiclesPath = path.join(ROOT, "data", "vehicles.json");
const vehicles = JSON.parse(fs.readFileSync(vehiclesPath, "utf8"));

let matched = 0;
let placeholders = 0;
const matchedPlates = new Set();

for (const v of vehicles) {
  const plate = cleanPlate(v.plate);
  const srcDir = plateDirs.get(plate);
  if (srcDir) {
    const destDir = path.join(ROOT, "public", "cars", "uploads", v.slug);
    const files = copyPhotos(srcDir, destDir);
    if (files.length) {
      const preferred = pickFrontCoverFile(v.slug, files);
      const cover = `/cars/uploads/${v.slug}/${preferred}`;
      v.image = cover;
      v.gallery = [
        cover,
        ...files.filter((f) => f !== preferred).map((f) => `/cars/uploads/${v.slug}/${f}`),
      ];
      v.hasRealPhotos = true;
      Object.assign(v, withFrontCover(v));
      matched++;
      matchedPlates.add(plate);
      console.log(`[OK] ${v.plate} ← ${path.basename(srcDir)} (${files.length} fotos)`);
      continue;
    }
  }

  // Sin carpeta Drive local: conservar uploads ya existentes, si no → placeholder
  const existingUploads = path.join(ROOT, "public", "cars", "uploads", v.slug);
  const localFiles = listImages(existingUploads);
  if (localFiles.length) {
    const preferred = pickFrontCoverFile(v.slug, localFiles);
    const cover = `/cars/uploads/${v.slug}/${preferred}`;
    v.image = cover;
    v.gallery = [
      cover,
      ...localFiles.filter((f) => f !== preferred).map((f) => `/cars/uploads/${v.slug}/${f}`),
    ];
    v.hasRealPhotos = true;
    Object.assign(v, withFrontCover(v));
    matchedPlates.add(plate);
    console.log(`[KEEP] ${v.plate} · uploads locales (${localFiles.length})`);
  } else {
    v.image = PLACEHOLDER;
    v.gallery = [];
    v.hasRealPhotos = false;
    placeholders++;
    console.log(`[PLACEHOLDER] ${v.plate}`);
  }
}

fs.writeFileSync(vehiclesPath, JSON.stringify(vehicles, null, 2), "utf8");
writeVehiclesTs(vehicles);

console.log("\n=== Resumen ===");
console.log(`Match desde carpeta Drive local: ${matched}`);
console.log(`Placeholder: ${placeholders}`);
console.log(`Con fotos reales: ${vehicles.filter((v) => v.hasRealPhotos).length}/${vehicles.length}`);
console.log("Actualizado data/vehicles.json + lib/vehicles.ts");
