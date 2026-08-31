import fs from "node:fs";
import path from "node:path";

// Read data/vehicles.json
const vehicles = JSON.parse(fs.readFileSync("data/vehicles.json", "utf8"));

// Specific manual fixes for key vehicles
const fixes = {
  // 1. FVRG86 -> Toyota Urban Cruiser 1.3 (the one in user's screenshot!)
  "fvrg86": {
    brand: "Toyota",
    model: "Urban Cruiser",
    version: "1.3 VVT-i Mecánica",
    year: 2014,
    bodyType: "Hatchback",
    fuel: "Bencina",
    transmission: "Manual",
    engine: "1.3L VVT-i",
    power: "99 HP",
    traction: "4x2",
    price: 7990000,
    km: 112000,
    // The frontal photo is 2.jpg
    frontImage: "/cars/inventory/fvrg86/2.jpg",
    slug: "toyota-urban-cruiser-2014-fvrg86"
  },
  // 2. FHVC10 -> Hyundai Tucson
  "fhvc10": {
    brand: "Hyundai",
    model: "Tucson",
    version: "2.0 CRDi GLS 4x2",
    year: 2018,
    bodyType: "SUV",
    fuel: "Diésel",
    transmission: "Automática",
    engine: "2.0L CRDi",
    power: "185 HP",
    traction: "4x2",
    price: 13990000,
    km: 84000,
    frontImage: "/cars/inventory/fhvc10/0.jpg",
    slug: "hyundai-tucson-2018-fhvc10"
  },
  // 3. GWPF76 -> Chevrolet D-Max
  "gwpf76": {
    brand: "Chevrolet",
    model: "D-Max",
    version: "2.5 TD 4x4 Doble Cabina",
    year: 2018,
    bodyType: "Camioneta",
    fuel: "Diésel",
    transmission: "Manual",
    engine: "2.5L Turbo Diésel",
    power: "136 HP",
    traction: "4x4",
    price: 14990000,
    km: 98000,
    frontImage: "/cars/inventory/gwpf76/0.jpg",
    slug: "chevrolet-d-max-2018-gwpf76"
  },
  // 4. JDDY77 -> Mitsubishi L200 Roja
  "jddy77": {
    brand: "Mitsubishi",
    model: "L200",
    version: "2.4 Katana CRT 4x4 Doble Cabina",
    year: 2019,
    bodyType: "Camioneta",
    fuel: "Diésel",
    transmission: "Manual",
    engine: "2.4L MIVEC Turbo Diésel",
    power: "154 HP",
    traction: "4x4",
    price: 16490000,
    km: 74000,
    frontImage: "/cars/inventory/jddy77/0.jpg",
    slug: "mitsubishi-l200-2019-jddy77"
  },
  // 5. JZWG23 -> Maxus T60 Azul
  "jzwg23": {
    brand: "Maxus",
    model: "T60",
    version: "2.8 TDI DX 4x4 Doble Cabina",
    year: 2019,
    bodyType: "Camioneta",
    fuel: "Diésel",
    transmission: "Manual",
    engine: "2.8L VGT Turbo Diésel",
    power: "150 HP",
    traction: "4x4",
    price: 13990000,
    km: 82000,
    frontImage: "/cars/inventory/jzwg23/4.jpg",
    slug: "maxus-t60-2019-jzwg23"
  }
};

let modifiedCount = 0;

for (let i = 0; i < vehicles.length; i++) {
  const v = vehicles[i];
  const plateMatch = v.slug.match(/-([a-z0-9]+)$/i);
  const plateKey = plateMatch ? plateMatch[1].toLowerCase() : "";

  if (fixes[plateKey]) {
    const fix = fixes[plateKey];
    console.log(`Aplicando corrección a ${v.slug} -> ${fix.brand} ${fix.model} (${fix.frontImage})`);
    
    // Update fields
    Object.assign(v, {
      brand: fix.brand,
      model: fix.model,
      version: fix.version,
      year: fix.year,
      bodyType: fix.bodyType,
      fuel: fix.fuel,
      transmission: fix.transmission,
      engine: fix.engine,
      power: fix.power,
      traction: fix.traction,
      price: fix.price,
      km: fix.km,
      image: fix.frontImage,
      slug: fix.slug
    });

    // Reorder gallery so frontImage is index 0
    if (v.gallery && v.gallery.length > 0) {
      const gWithoutFront = v.gallery.filter(img => img !== fix.frontImage);
      v.gallery = [fix.frontImage, ...gWithoutFront];
    }

    modifiedCount++;
  }
}

console.log(`\nCorregidos ${modifiedCount} vehículos.`);
fs.writeFileSync("data/vehicles.json", JSON.stringify(vehicles, null, 2));
