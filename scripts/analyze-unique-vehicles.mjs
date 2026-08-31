import fs from "node:fs";

const list = JSON.parse(fs.readFileSync("scratch/local_all_car_folders.json"));

console.log(`Total carpetas escaneadas: ${list.length}`);

// Let's analyze folder names and patterns
const plateRegex = /([A-Z]{2,4}[-\s]?[0-9]{2,4}|[A-Z]{2}[0-9]{4}|[A-Z]{4}[0-9]{2})/i;
const vehiclesMap = new Map();

for (const item of list) {
  const name = item.folderName.trim();
  const match = name.match(plateRegex);
  let plate = match ? match[0].replace(/[-\s]/g, "").toUpperCase() : "";

  // If no standard plate, use normalized name
  const key = plate || name.toLowerCase().replace(/[^a-z0-9]/g, "-");

  if (!vehiclesMap.has(key)) {
    vehiclesMap.set(key, {
      plate: plate || "SIN-PATENTE",
      rawName: name,
      folders: [],
      totalPhotos: 0,
    });
  }

  const v = vehiclesMap.get(key);
  v.folders.push({
    batch: item.batch,
    path: item.path,
    files: item.files,
  });
  v.totalPhotos += item.imagesCount;
}

console.log(`\n🚗 Total de Vehículos Únicos Identificados: ${vehiclesMap.size}`);

let withPhotos = 0;
let withoutPhotos = 0;
const sample = [];

for (const [key, v] of vehiclesMap.entries()) {
  if (v.totalPhotos > 0) withPhotos++;
  else withoutPhotos++;
  sample.push({
    key,
    plate: v.plate,
    name: v.rawName,
    foldersCount: v.folders.length,
    photos: v.totalPhotos,
  });
}

console.log(`- Con fotos reales: ${withPhotos}`);
console.log(`- Sin fotos: ${withoutPhotos}`);

console.log("\nPrimeros 40 vehículos:");
for (const s of sample.slice(0, 40)) {
  console.log(`  • [${s.plate}] "${s.name}" -> ${s.photos} fotos (${s.foldersCount} carpetas)`);
}

fs.writeFileSync("scratch/unique_vehicles_summary.json", JSON.stringify(sample, null, 2));
