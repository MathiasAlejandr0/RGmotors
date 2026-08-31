const fs = require("fs");
const path = require("path");

const list1 = JSON.parse(fs.readFileSync("scratch/parsed_pdf1.json", "utf8"));
const list2 = JSON.parse(fs.readFileSync("scratch/parsed_pdf2.json", "utf8"));

// Merge by plate
const vehiclesMap = new Map();

for (const item of [...list1, ...list2]) {
  if (!item.plate) continue;
  if (!vehiclesMap.has(item.plate)) {
    vehiclesMap.set(item.plate, item);
  } else {
    // If we have more info, merge
    const prev = vehiclesMap.get(item.plate);
    vehiclesMap.set(item.plate, { ...prev, ...item });
  }
}

const allVehicles = Array.from(vehiclesMap.values());
console.log(`Total unique vehicles from both PDFs: ${allVehicles.length}`);

// Check inventory folders
const drivePath = "C:/Users/mathi/OneDrive/Escritorio/drive rgmotors";
function findDriveFolder(plate) {
  if (!fs.existsSync(drivePath)) return null;
  // recursive search for directory named plate (case-insensitive)
  function search(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name.toLowerCase().replace(/[^a-z0-9]/g, "") === plate.toLowerCase()) {
          return full;
        }
        const found = search(full);
        if (found) return found;
      }
    }
    return null;
  }
  return search(drivePath);
}

let withPhotosCount = 0;
let pendingPhotosCount = 0;

const report = allVehicles.map(v => {
  const invPath = path.join("public/cars/inventory", v.plate);
  let invPhotos = [];
  if (fs.existsSync(invPath)) {
    invPhotos = fs.readdirSync(invPath).filter(f => f.endsWith(".jpg") || f.endsWith(".png"));
  }

  const driveFolder = findDriveFolder(v.plate);
  let drivePhotosCount = 0;
  if (driveFolder) {
    drivePhotosCount = fs.readdirSync(driveFolder).filter(f => f.endsWith(".jpg") || f.endsWith(".png") || f.endsWith(".jpeg")).length;
  }

  const hasPhotos = invPhotos.length > 0 || drivePhotosCount > 0;
  if (hasPhotos) withPhotosCount++;
  else pendingPhotosCount++;

  return {
    plate: v.plate,
    rawPatente: v.rawPatente,
    brand: v.brand,
    model: v.model,
    year: v.year,
    color: v.color,
    rawOfferPrice: v.rawOfferPrice,
    rawListPrice: v.rawListPrice,
    rawKm: v.rawKm,
    location: v.location,
    hasPhotos,
    invPhotosCount: invPhotos.length,
    driveFolder: driveFolder ? path.relative(drivePath, driveFolder) : null,
    drivePhotosCount
  };
});

console.log(`Vehicles with photos available: ${withPhotosCount}`);
console.log(`Vehicles pending photos: ${pendingPhotosCount}`);

fs.writeFileSync("scratch/stock_cross_reference_report.json", JSON.stringify(report, null, 2), "utf8");
console.log("Saved report to scratch/stock_cross_reference_report.json");
