/**
 * Aplica portadas delanteras 3/4 a data/vehicles.json (+ KV si hay credenciales).
 * Regenera lib/vehicles.ts con: node scripts/import-tiempo-real-inventory.mjs
 * Uso: node scripts/apply-front-covers.mjs
 */
import fs from "fs";
import path from "path";
import { createClient } from "@vercel/kv";
import { fileURLToPath } from "url";
import { FRONT_COVER_BY_SLUG, withFrontCover } from "./lib/front-cover-map.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const envPath = path.join(ROOT, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i > 0) {
      process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    }
  }
}

async function main() {
  const jsonPath = path.join(ROOT, "data", "vehicles.json");
  let vehicles = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  let updated = 0;
  let missingFile = 0;
  let noMap = 0;

  vehicles = vehicles.map((v) => {
    const file = FRONT_COVER_BY_SLUG[v.slug];
    if (!file) {
      noMap++;
      return v;
    }
    const coverUrl = `/cars/uploads/${v.slug}/${file}`;
    const physical = path.join(ROOT, "public", coverUrl);
    if (!fs.existsSync(physical)) {
      console.warn(`[MISSING] ${v.slug} -> ${file}`);
      missingFile++;
      return v;
    }
    if (v.image === coverUrl && v.gallery?.[0] === coverUrl) return v;
    updated++;
    console.log(`[OK] ${v.plate || v.slug} -> ${file}`);
    return withFrontCover(v);
  });

  fs.writeFileSync(jsonPath, JSON.stringify(vehicles, null, 2), "utf8");
  console.log(`\nActualizados: ${updated} · Sin mapa: ${noMap} · Archivo faltante: ${missingFile}`);
  console.log("Actualizado data/vehicles.json. Si hace falta: node scripts/import-tiempo-real-inventory.mjs");

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const kv = createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
    await kv.set("vehicles.json", vehicles);
    console.log("KV sincronizado con portadas frontales 3/4.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
