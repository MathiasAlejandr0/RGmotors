import { readdirSync, writeFileSync } from "node:fs";

const files = readdirSync("public/cars/real_stock");
const plates = {};

for (const f of files) {
  const parts = f.split("-");
  if (parts.length < 3) continue;
  const prefix = parts[0];
  const plate = parts[1].toUpperCase();
  if (!plates[plate]) plates[plate] = [];
  plates[plate].push(f);
}

writeFileSync("scratch/plate_photos_map.json", JSON.stringify(plates, null, 2), "utf8");
console.log("Mapeo guardado. Total patentes:", Object.keys(plates).length);
