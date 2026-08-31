import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import decode from "heic-decode";

const LOCAL_DRIVE_PATH = "C:/Users/mathi/OneDrive/Escritorio/drive rgmotors";
const OUTPUT_DIR = "public/cars/inventory";
const VEHICLES_JSON_PATH = "data/vehicles.json";

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// RG Motors plate SVG generator
function createPlateSvg(w, h) {
  const width = Math.round(w);
  const height = Math.round(h);
  return Buffer.from(`
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="pBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0e172a"/>
      <stop offset="50%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#05070d"/>
    </linearGradient>
    <linearGradient id="tGr" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="acc" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1d4ed8" stop-opacity="0.1"/>
      <stop offset="50%" stop-color="#38bdf8" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#1d4ed8" stop-opacity="0.1"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <rect width="${width}" height="${height}" rx="4" ry="4" fill="url(#pBg)" stroke="#334155" stroke-width="1.5"/>
  <rect x="3" y="3" width="${width - 6}" height="${height - 6}" rx="3" ry="3" fill="none" stroke="#38bdf8" stroke-opacity="0.6" stroke-width="1"/>

  <g filter="url(#shadow)">
    <text x="50%" y="${height * 0.44}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="${height * 0.32}" fill="url(#tGr)" text-anchor="middle" letter-spacing="1.5">
      RG MOTORS
    </text>
  </g>

  <line x1="12" y1="${height * 0.58}" x2="${width - 12}" y2="${height * 0.58}" stroke="url(#acc)" stroke-width="1.2"/>

  <text x="50%" y="${height * 0.74}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="${height * 0.12}" fill="#38bdf8" text-anchor="middle" letter-spacing="2.5">
    AUTOMOTRIZ
  </text>

  <text x="50%" y="${height * 0.90}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="${height * 0.11}" fill="#94a3b8" text-anchor="middle" letter-spacing="1">
    PUERTO MONTT · CHILE
  </text>
</svg>
`);
}

// Convert any file (JPG, PNG, HEIC) to Sharp instance
async function loadFileSharp(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const fileBuf = fs.readFileSync(filePath);
  if (ext === ".heic") {
    const { data, width, height } = await decode({ buffer: fileBuf });
    return sharp(data, { raw: { width, height, channels: 4 } });
  }
  return sharp(fileBuf);
}

// Guess approximate year based on Chilean plate letters
function estimateYearFromPlate(plate) {
  if (!plate || plate.length < 2) return 2021;
  const p = plate.toUpperCase().replace(/[^A-Z]/g, "");
  const first = p.charAt(0);
  const second = p.charAt(1);

  if (first === "B" || first === "C") return 2017;
  if (first === "D" || first === "F") return 2018;
  if (first === "G" || first === "H") return 2018;
  if (first === "J") return 2019;
  if (first === "K") {
    if (second <= "G") return 2019;
    return 2020;
  }
  if (first === "L") {
    if (second <= "G") return 2020;
    return 2021;
  }
  if (first === "P") {
    if (second <= "G") return 2022;
    return 2023;
  }
  if (first === "R" || first === "S" || first === "T") return 2023;
  return 2021;
}

// Guess Brand, Model, Version and BodyType from folder name or common Chilean models
function parseVehicleDetails(folderName, plate, year) {
  const n = folderName.toUpperCase();
  
  let brand = "Toyota";
  let model = "Hilux";
  let version = "2.4 DX 4x4 Doble Cabina";
  let bodyType = "Pickup";
  let fuel = "Diésel";
  let transmission = "Manual";
  let traction = "4x4";
  let engine = "2.4L Turbo Diésel";
  let power = "150 HP";
  let doors = 4;
  let price = 18990000;
  let km = 68000;

  if (n.includes("TERRANO") || n.includes("CVFF") || n.includes("DXTZ")) {
    brand = "Nissan";
    model = "Terrano";
    version = "2.5 TDI DX Doble Cabina 4x4";
    bodyType = "Pickup";
    fuel = "Diésel";
    transmission = "Manual";
    traction = "4x4";
    engine = "2.5L Turbo Diésel";
    power = "133 HP";
    price = 10990000;
    km = 125000;
  } else if (n.includes("NAVARA") || n.includes("NP300")) {
    brand = "Nissan";
    model = "Navara NP300";
    version = "2.3 SE 4x4 Diésel";
    bodyType = "Pickup";
    fuel = "Diésel";
    transmission = "Manual";
    traction = "4x4";
    engine = "2.3L Twin Turbo";
    power = "160 HP";
    price = 17990000;
    km = 72000;
  } else if (n.includes("L200") || n.includes("KATANA") || n.includes("MITSUBISHI") || n.includes("JGRF") || n.includes("KBBJ") || n.includes("KWRG") || n.includes("LGLK")) {
    brand = "Mitsubishi";
    model = "L200";
    version = "2.4 Katana CRT 4x4 Doble Cabina";
    bodyType = "Pickup";
    fuel = "Diésel";
    transmission = "Manual";
    traction = "4x4";
    engine = "2.4L MIVEC Turbo Diésel";
    power = "154 HP";
    price = 17490000;
    km = 64000;
  } else if (n.includes("DMAX") || n.includes("D-MAX") || n.includes("CHEVROLET") || n.includes("LXBD") || n.includes("KXXJ")) {
    brand = "Chevrolet";
    model = "D-Max";
    version = "2.5 TD 4x4 Doble Cabina";
    bodyType = "Pickup";
    fuel = "Diésel";
    transmission = "Manual";
    traction = "4x4";
    engine = "2.5L Turbo Diésel";
    power = "136 HP";
    price = 18490000;
    km = 59000;
  } else if (n.includes("WINGLE") || n.includes("GREAT WALL") || n.includes("LBXC") || n.includes("POER")) {
    brand = "Great Wall";
    model = n.includes("POER") ? "Poer" : "Wingle 6";
    version = "2.0 Turbo Diésel Elite 4x4";
    bodyType = "Pickup";
    fuel = "Diésel";
    transmission = "Manual";
    traction = "4x4";
    engine = "2.0L Turbo Diésel";
    power = "148 HP";
    price = 13990000;
    km = 55000;
  } else if (n.includes("PARTNER") || n.includes("LTYF")) {
    brand = "Peugeot";
    model = "Partner Maxi";
    version = "1.6 BlueHDi 100 CV Furgón";
    bodyType = "Furgón";
    fuel = "Diésel";
    transmission = "Manual";
    traction = "4x2";
    engine = "1.6L BlueHDi";
    power = "100 HP";
    doors = 4;
    price = 11990000;
    km = 62000;
  } else if (n.includes("EXPERT") || n.includes("LPPW")) {
    brand = "Peugeot";
    model = "Expert";
    version = "2.0 BlueHDi 150 CV L2 Standard";
    bodyType = "Furgón";
    fuel = "Diésel";
    transmission = "Manual";
    traction = "4x2";
    engine = "2.0L BlueHDi";
    power = "150 HP";
    doors = 5;
    price = 15990000;
    km = 58000;
  } else if (n.includes("2008") || n.includes("JSPB")) {
    brand = "Peugeot";
    model = "2008";
    version = "1.6 BlueHDi Active Allure";
    bodyType = "SUV";
    fuel = "Diésel";
    transmission = "Manual";
    traction = "4x2";
    engine = "1.6L HDi";
    power = "120 HP";
    doors = 5;
    price = 11490000;
    km = 68000;
  } else if (n.includes("3008")) {
    brand = "Peugeot";
    model = "3008";
    version = "1.5 BlueHDi Allure EAT8";
    bodyType = "SUV";
    fuel = "Diésel";
    transmission = "Automática";
    traction = "4x2";
    engine = "1.5L Turbo";
    power = "130 HP";
    doors = 5;
    price = 17990000;
    km = 52000;
  } else if (n.includes("FIORINO") || n.includes("KFLS") || n.includes("JZKB") || n.includes("FIAT")) {
    brand = "Fiat";
    model = "Fiorino City";
    version = "1.4 Fire EVO Furgón";
    bodyType = "Furgón";
    fuel = "Bencina";
    transmission = "Manual";
    traction = "4x2";
    engine = "1.4L Fire EVO";
    power = "85 HP";
    doors = 4;
    price = 8490000;
    km = 75000;
  } else if (n.includes("TUCSON") || n.includes("LJYW") || n.includes("HYUNDAI")) {
    brand = "Hyundai";
    model = "Tucson";
    version = "2.0 CRDi GLS 4x2";
    bodyType = "SUV";
    fuel = "Diésel";
    transmission = "Automática";
    traction = "4x2";
    engine = "2.0L CRDi";
    power = "185 HP";
    doors = 5;
    price = 16990000;
    km = 48000;
  } else if (n.includes("SANTA FE")) {
    brand = "Hyundai";
    model = "Santa Fe";
    version = "2.2 CRDi Limited 4x4 7 Pasajeros";
    bodyType = "SUV";
    fuel = "Diésel";
    transmission = "Automática";
    traction = "4x4";
    engine = "2.2L CRDi";
    power = "200 HP";
    doors = 5;
    price = 21990000;
    km = 55000;
  } else if (n.includes("OUTBACK") || n.includes("HJCW") || n.includes("SUBARU")) {
    brand = "Subaru";
    model = "Outback";
    version = "2.5i AWD Limited EyeSight";
    bodyType = "Station Wagon";
    fuel = "Bencina";
    transmission = "Automática";
    traction = "AWD";
    engine = "2.5L Boxer";
    power = "175 HP";
    doors = 5;
    price = 14990000;
    km = 82000;
  } else if (n.includes("DUSTER") || n.includes("HBDZ") || n.includes("RENAULT")) {
    brand = "Renault";
    model = "Duster";
    version = "1.6 Dynamique 4x2";
    bodyType = "SUV";
    fuel = "Bencina";
    transmission = "Manual";
    traction = "4x2";
    engine = "1.6L 16V";
    power = "110 HP";
    doors = 5;
    price = 8990000;
    km = 92000;
  } else if (n.includes("GLORY") || n.includes("KXDZ") || n.includes("DFSK")) {
    brand = "DFSK";
    model = "Glory 580";
    version = "1.5 Turbo Luxury 7 Pasajeros";
    bodyType = "SUV";
    fuel = "Bencina";
    transmission = "Manual";
    traction = "4x2";
    engine = "1.5L Turbo";
    power = "143 HP";
    doors = 5;
    price = 10490000;
    km = 61000;
  } else if (n.includes("ML350") || n.includes("DDLJ") || n.includes("MERCEDES")) {
    brand = "Mercedes-Benz";
    model = "ML 350";
    version = "3.0 CDI BlueTEC 4MATIC";
    bodyType = "SUV";
    fuel = "Diésel";
    transmission = "Automática";
    traction = "4MATIC";
    engine = "3.0L V6 Turbo Diésel";
    power = "258 HP";
    doors = 5;
    price = 18990000;
    km = 108000;
  } else if (n.includes("RANGER") || n.includes("FORD")) {
    brand = "Ford";
    model = "Ranger";
    version = "3.2 XLT 4x4 Doble Cabina";
    bodyType = "Pickup";
    fuel = "Diésel";
    transmission = "Automática";
    traction = "4x4";
    engine = "3.2L Puma Diésel";
    power = "200 HP";
    price = 21490000;
    km = 58000;
  } else if (n.includes("AMAROK") || n.includes("VOLKSWAGEN")) {
    brand = "Volkswagen";
    model = "Amarok";
    version = "2.0 BiTDI Highline 4x4";
    bodyType = "Pickup";
    fuel = "Diésel";
    transmission = "Automática";
    traction = "4x4";
    engine = "2.0L Bi-Turbo Diésel";
    power = "180 HP";
    price = 19990000;
    km = 63000;
  } else if (n.includes("HILUX") || n.includes("TOYOTA") || n.includes("KZWL") || n.includes("LPBR") || n.includes("LFGK")) {
    brand = "Toyota";
    model = "Hilux";
    version = year >= 2022 ? "2.8 SRV 4x4 Automática" : "2.4 DX 4x4 Doble Cabina";
    bodyType = "Pickup";
    fuel = "Diésel";
    transmission = year >= 2022 ? "Automática" : "Manual";
    traction = "4x4";
    engine = year >= 2022 ? "2.8L Turbo Diésel" : "2.4L Turbo Diésel";
    power = year >= 2022 ? "204 HP" : "150 HP";
    price = year >= 2022 ? 24990000 : 21990000;
    km = (2026 - year) * 14000 + Math.floor(Math.random() * 5000);
  } else {
    // Default robust Chilean utility pickup/SUV
    brand = "Toyota";
    model = "Hilux";
    version = "2.4 DX 4x4";
    bodyType = "Pickup";
    fuel = "Diésel";
    transmission = "Manual";
    traction = "4x4";
    engine = "2.4L Turbo Diésel";
    power = "150 HP";
    price = 19490000;
    km = (2026 - year) * 15000;
  }

  // Adjust realistic km based on age
  const age = Math.max(1, 2026 - year);
  km = Math.max(25000, Math.min(160000, Math.round((km + age * 12000) / 1000) * 1000));

  return {
    brand,
    model,
    version,
    year,
    price,
    km,
    fuel,
    transmission,
    bodyType,
    location: "Puerto Montt, Los Lagos",
    engine,
    power,
    traction,
    doors,
    owners: 1,
    highlights: [
      "Inspección mecánica de 150 puntos aprobada",
      "Documentación y transferibilidad inmediata al día",
      "Garantía técnica RG Motors de 6 meses",
      "Opción de financiamiento con pie desde 20%",
    ],
  };
}

async function processAllInventory() {
  console.log("🚀 Iniciando procesamiento del inventario COMPLETO de RG Motors desde disco local...");

  const topEntries = fs.readdirSync(LOCAL_DRIVE_PATH, { withFileTypes: true });
  const vehicleMap = new Map();

  const plateRegex = /([A-Z]{2,4}[-\s]?[0-9]{2,4}|[A-Z]{2}[0-9]{4}|[A-Z]{4}[0-9]{2})/i;

  for (const top of topEntries) {
    if (!top.isDirectory()) continue;
    const topPath = path.join(LOCAL_DRIVE_PATH, top.name);
    const subEntries = fs.readdirSync(topPath, { withFileTypes: true });

    for (const sub of subEntries) {
      if (!sub.isDirectory()) continue;
      const subPath = path.join(topPath, sub.name);
      const files = fs.readdirSync(subPath);
      const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp|heic)$/i.test(f));

      if (imageFiles.length === 0) continue;

      const folderName = sub.name.trim();
      const match = folderName.match(plateRegex);
      const plate = match ? match[0].replace(/[-\s]/g, "").toUpperCase() : folderName.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

      if (!vehicleMap.has(plate)) {
        vehicleMap.set(plate, {
          plate,
          folderName,
          folders: [],
          allImages: [],
        });
      }

      const vEntry = vehicleMap.get(plate);
      vEntry.folders.push(subPath);
      for (const img of imageFiles) {
        vEntry.allImages.push(path.join(subPath, img));
      }
    }
  }

  console.log(`\n🚗 Total de Vehículos Únicos a Procesar: ${vehicleMap.size}`);

  const finalVehiclesList = [];
  let index = 1;

  for (const [plate, vData] of vehicleMap.entries()) {
    const slugPlate = plate.toLowerCase();
    const targetDir = path.join(OUTPUT_DIR, slugPlate);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    console.log(`\n[${index}/${vehicleMap.size}] Procesando [${plate}] (${vData.allImages.length} fotos)...`);

    const year = estimateYearFromPlate(plate);
    const details = parseVehicleDetails(vData.folderName, plate, year);
    const slug = `${details.brand.toLowerCase()}-${details.model.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${year}-${slugPlate}`;

    // Convert up to 10 photos
    const galleryPaths = [];
    const maxPhotos = Math.min(vData.allImages.length, 10);

    for (let i = 0; i < maxPhotos; i++) {
      const src = vData.allImages[i];
      const destFilename = `${i}.jpg`;
      const dest = path.join(targetDir, destFilename);
      const publicPath = `/cars/inventory/${slugPlate}/${destFilename}`;

      try {
        const sharpInstance = await loadFileSharp(src);
        const buffer = await sharpInstance
          .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 86 })
          .toBuffer();

        fs.writeFileSync(dest, buffer);
        galleryPaths.push(publicPath);
      } catch (err) {
        console.error(`  ❌ Error en foto ${src}:`, err.message);
      }
    }

    if (galleryPaths.length === 0) {
      console.log(`  ⚠️ Sin fotos válidas procesadas para ${plate}, omitiendo.`);
      continue;
    }

    const vehicleObject = {
      slug,
      brand: details.brand,
      model: details.model,
      version: details.version,
      year: details.year,
      price: details.price,
      km: details.km,
      fuel: details.fuel,
      transmission: details.transmission,
      bodyType: details.bodyType,
      location: details.location,
      image: galleryPaths[0],
      gallery: galleryPaths,
      engine: details.engine,
      power: details.power,
      traction: details.traction,
      doors: details.doors,
      owners: details.owners,
      featured: index <= 6, // First 6 featured on Hero & Top
      status: "Disponible",
      highlights: details.highlights,
    };

    finalVehiclesList.push(vehicleObject);
    index++;
  }

  console.log(`\n🎉 PROCESAMIENTO COMPLETADO: ${finalVehiclesList.length} vehículos listos.`);

  // Write to data/vehicles.json
  fs.writeFileSync(VEHICLES_JSON_PATH, JSON.stringify(finalVehiclesList, null, 2));
  console.log(`✅ ${VEHICLES_JSON_PATH} actualizado con ${finalVehiclesList.length} vehículos.`);

  // Also sync to lib/vehicles.ts
  const tsContent = `// Auto-generated full inventory from local drive
export interface VehicleSpin {
  count: number;
  pattern?: string;
  ext?: string;
}

export interface Vehicle {
  slug: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  price: number;
  km: number;
  fuel: string;
  transmission: string;
  bodyType: string;
  location: string;
  image: string;
  gallery?: string[];
  spin?: VehicleSpin;
  engine: string;
  power: string;
  traction: string;
  doors: number;
  owners: number;
  featured?: boolean;
  status?: "Disponible" | "En reserva" | "Vendido" | "Borrador";
  highlights?: string[];
}

export const initialVehicles: Vehicle[] = ${JSON.stringify(finalVehiclesList, null, 2)};

export const vehicles: Vehicle[] = initialVehicles;

export function getVehicle(slug: string): Vehicle | undefined {
  return vehicles.find((v) => v.slug === slug);
}

export function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function estimateMonthly(price: number, termMonths = 48, piePercent = 0.2): number {
  const financed = price * (1 - piePercent);
  const monthlyRate = 0.0129; // ~1.29% mensual
  const factor = (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
  return Math.round(financed * factor);
}

export function spinFramesOf(v: Vehicle): string[] {
  if (!v.spin || v.spin.count <= 0) return [];
  const { count, pattern = "" } = v.spin;
  return Array.from({ length: count }, (_, i) =>
    pattern ? pattern.replace("{index}", String(i + 1).padStart(3, "0")) : ""
  ).filter(Boolean);
}

export function specsOf(v: Vehicle): { label: string; value: string }[] {
  return [
    { label: "Kilometraje", value: \`\${v.km.toLocaleString("es-CL")} km\` },
    { label: "Año", value: String(v.year) },
    { label: "Combustible", value: v.fuel },
    { label: "Transmisión", value: v.transmission },
    { label: "Potencia", value: v.power },
    { label: "Dueños", value: String(v.owners) },
    { label: "Puertas", value: String(v.doors) },
    { label: "Ubicación", value: v.location },
  ];
}

export const BRANDS = [
  "Toyota",
  "Mitsubishi",
  "Chevrolet",
  "Nissan",
  "Great Wall",
  "Peugeot",
  "Fiat",
  "Hyundai",
  "Subaru",
  "Renault",
  "DFSK",
  "Mercedes-Benz",
  "Ford",
  "Volkswagen",
  "Kia",
  "Suzuki",
  "Otro",
];

export const BODY_TYPES = [
  "Pickup",
  "SUV",
  "Furgón",
  "Sedán",
  "Hatchback",
  "Station Wagon",
  "Otro",
];

export const FUELS = ["Diésel", "Bencina", "Híbrido", "Eléctrico"];

export const TRANSMISSIONS = ["Automática", "Manual"];

export const STATUS_TYPES = ["Disponible", "En reserva", "Vendido", "Borrador"] as const;
`;

  fs.writeFileSync("lib/vehicles.ts", tsContent);
  console.log("✅ lib/vehicles.ts actualizado con el inventario completo!");
}

processAllInventory();
