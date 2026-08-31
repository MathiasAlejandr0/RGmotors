import fs from "node:fs";
import path from "node:path";

const VEHICLES_JSON_PATH = "data/vehicles.json";
const vehicles = JSON.parse(fs.readFileSync(VEHICLES_JSON_PATH, "utf8"));

console.log("Total vehicles in vehicles.json:", vehicles.length);

vehicles.slice(0, 30).forEach((v, i) => {
  console.log(`[${i}] ${v.slug} | ${v.brand} ${v.model} (${v.year}) | Cover: ${v.image} | Gallery: ${v.gallery?.length || 0}`);
});
