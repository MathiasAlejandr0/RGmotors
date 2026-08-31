import { readdirSync, statSync } from "node:fs";

const files = readdirSync("public/cars/real_stock");
const groups = {};

for (const f of files) {
  if (!f.startsWith("rg-")) continue;
  const plate = f.split("-")[1];
  if (!groups[plate]) groups[plate] = [];
  groups[plate].push(f);
}

console.log("Patentes y sus fotos:");
for (const [p, fls] of Object.entries(groups)) {
  console.log(`Patente ${p.toUpperCase()}: ${fls.length} fotos ->`, fls);
}
