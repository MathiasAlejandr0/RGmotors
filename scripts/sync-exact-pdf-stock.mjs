import fs from "node:fs";
import path from "node:path";

const ALL_REAL_STOCK = [
  // 18 from Official PDF Stock
  {
    plate: "srcp17",
    brand: "Mitsubishi",
    model: "L200",
    version: "New Katana 2.4 TD 4x2",
    year: 2023,
    color: "Rojo",
    price: 13990000,
    listPrice: 15490000,
    km: 75000,
    fuel: "Diésel",
    transmission: "Manual",
    bodyType: "Pickup",
    engine: "2.4L MIVEC Turbo Diésel",
    power: "152 HP",
    traction: "4x2",
    doors: 4,
    owners: 1,
    status: "Disponible",
    featured: true
  },
  {
    plate: "lxcy98",
    brand: "Mitsubishi",
    model: "L200",
    version: "Katana 2.4 TD 4x4",
    year: 2020,
    color: "Rojo",
    price: 13490000,
    listPrice: 14490000,
    km: 156000,
    fuel: "Diésel",
    transmission: "Manual",
    bodyType: "Pickup",
    engine: "2.4L MIVEC Turbo Diésel",
    power: "152 HP",
    traction: "4x4",
    doors: 4,
    owners: 1,
    status: "Disponible",
    featured: true
  },
  {
    plate: "rpkd45",
    brand: "Toyota",
    model: "Hilux",
    version: "New Hilux 2.4 DX 4x2",
    year: 2022,
    color: "Rojo",
    price: 14990000,
    listPrice: 15990000,
    km: 135704,
    fuel: "Diésel",
    transmission: "Manual",
    bodyType: "Pickup",
    engine: "2.4L Turbo Diésel",
    power: "150 HP",
    traction: "4x2",
    doors: 4,
    owners: 1,
    status: "Disponible",
    featured: true
  },
  {
    plate: "rzvk91",
    brand: "Toyota",
    model: "Hilux",
    version: "2.4 DX 4x4 Doble Cabina",
    year: 2022,
    color: "Rojo",
    price: 17990000,
    listPrice: 18990000,
    km: 151000,
    fuel: "Diésel",
    transmission: "Manual",
    bodyType: "Pickup",
    engine: "2.4L Turbo Diésel",
    power: "150 HP",
    traction: "4x4",
    doors: 4,
    owners: 1,
    status: "Disponible",
    featured: true
  },
  {
    plate: "tsgl82",
    brand: "Toyota",
    model: "Raize",
    version: "1.2 MT 4x2",
    year: 2025,
    color: "Gris",
    price: 12490000,
    listPrice: 13490000,
    km: 16000,
    fuel: "Bencina",
    transmission: "Manual",
    bodyType: "SUV",
    engine: "1.2L Dual VVT-i",
    power: "87 HP",
    traction: "4x2",
    doors: 5,
    owners: 1,
    status: "Disponible",
    featured: true
  },
  {
    plate: "sfxy80",
    brand: "Peugeot",
    model: "Partner",
    version: "1.6 BlueHDi Maxi",
    year: 2023,
    color: "Blanco",
    price: 10490000,
    listPrice: 11490000,
    km: 119136,
    fuel: "Diésel",
    transmission: "Manual",
    bodyType: "Furgón",
    engine: "1.6L BlueHDi",
    power: "100 HP",
    traction: "4x2",
    doors: 4,
    owners: 1,
    status: "Disponible",
    featured: false
  },
  {
    plate: "scgj41",
    brand: "Peugeot",
    model: "Partner",
    version: "1.6 BlueHDi",
    year: 2022,
    color: "Blanco",
    price: 9990000,
    listPrice: 10990000,
    km: 110030,
    fuel: "Diésel",
    transmission: "Manual",
    bodyType: "Furgón",
    engine: "1.6L BlueHDi",
    power: "100 HP",
    traction: "4x2",
    doors: 4,
    owners: 1,
    status: "En reserva",
    featured: false
  },
  {
    plate: "psjj97",
    brand: "Peugeot",
    model: "Partner",
    version: "1.6 BlueHDi",
    year: 2021,
    color: "Blanco",
    price: 8990000,
    listPrice: 10490000,
    km: 104900,
    fuel: "Diésel",
    transmission: "Manual",
    bodyType: "Furgón",
    engine: "1.6L BlueHDi",
    power: "100 HP",
    traction: "4x2",
    doors: 4,
    owners: 1,
    status: "Disponible",
    featured: false
  },
  {
    plate: "tsxk53",
    brand: "Peugeot",
    model: "Partner",
    version: "1.6 BlueHDi",
    year: 2025,
    color: "Blanco",
    price: 12990000,
    listPrice: 13990000,
    km: 70000,
    fuel: "Diésel",
    transmission: "Manual",
    bodyType: "Furgón",
    engine: "1.6L BlueHDi",
    power: "100 HP",
    traction: "4x2",
    doors: 4,
    owners: 1,
    status: "Disponible",
    featured: false
  },
  {
    plate: "pysy84",
    brand: "Peugeot",
    model: "Partner",
    version: "1.6 BlueHDi",
    year: 2021,
    color: "Blanco",
    price: 8990000,
    listPrice: 10990000,
    km: 122000,
    fuel: "Diésel",
    transmission: "Manual",
    bodyType: "Furgón",
    engine: "1.6L BlueHDi",
    power: "100 HP",
    traction: "4x2",
    doors: 4,
    owners: 1,
    status: "Disponible",
    featured: false
  },
  {
    plate: "sfrt83",
    brand: "Volkswagen",
    model: "Saveiro",
    version: "1.6 MSI Doble Cabina",
    year: 2023,
    color: "Blanco",
    price: 9990000,
    listPrice: 10990000,
    km: 69000,
    fuel: "Bencina",
    transmission: "Manual",
    bodyType: "Pickup",
    engine: "1.6L MSI",
    power: "110 HP",
    traction: "4x2",
    doors: 2,
    owners: 1,
    status: "Disponible",
    featured: true
  },
  {
    plate: "stpz87",
    brand: "Maxus",
    model: "T60",
    version: "2.0 TD 4x2 Automática",
    year: 2023,
    color: "Gris",
    price: 12990000,
    listPrice: 14990000,
    km: 78000,
    fuel: "Diésel",
    transmission: "Automática",
    bodyType: "Pickup",
    engine: "2.0L VGT Turbo Diésel",
    power: "163 HP",
    traction: "4x2",
    doors: 4,
    owners: 1,
    status: "Disponible",
    featured: true
  },
  {
    plate: "ssdt39",
    brand: "Maxus",
    model: "T60",
    version: "2.0 TD DX 4x4",
    year: 2023,
    color: "Rojo",
    price: 10990000,
    listPrice: 11990000,
    km: 134000,
    fuel: "Diésel",
    transmission: "Manual",
    bodyType: "Pickup",
    engine: "2.0L VGT Turbo Diésel",
    power: "163 HP",
    traction: "4x4",
    doors: 4,
    owners: 1,
    status: "Disponible",
    featured: true
  },
  {
    plate: "rygb56",
    brand: "MG",
    model: "3",
    version: "1.5 VTi-Tech Comfort",
    year: 2022,
    color: "Blanco",
    price: 7490000,
    listPrice: 8490000,
    km: 60900,
    fuel: "Bencina",
    transmission: "Manual",
    bodyType: "Hatchback",
    engine: "1.5L NSE",
    power: "105 HP",
    traction: "4x2",
    doors: 5,
    owners: 1,
    status: "Disponible",
    featured: true
  },
  {
    plate: "lxbc60",
    brand: "Chevrolet",
    model: "D-Max",
    version: "2.5 TD Doble Cabina 4x2",
    year: 2020,
    color: "Rojo",
    price: 10990000,
    listPrice: 11990000,
    km: 195000,
    fuel: "Diésel",
    transmission: "Manual",
    bodyType: "Pickup",
    engine: "2.5L Turbo Diésel",
    power: "136 HP",
    traction: "4x2",
    doors: 4,
    owners: 1,
    status: "Disponible",
    featured: true
  },
  {
    plate: "rzsy35",
    brand: "Chevrolet",
    model: "Colorado",
    version: "2.8 CTDI LTZ 4x4",
    year: 2022,
    color: "Blanco",
    price: 16990000,
    listPrice: 17990000,
    km: 144800,
    fuel: "Diésel",
    transmission: "Automática",
    bodyType: "Pickup",
    engine: "2.8L Duramax Turbo Diésel",
    power: "200 HP",
    traction: "4x4",
    doors: 4,
    owners: 1,
    status: "Disponible",
    featured: true
  },
  {
    plate: "shyl53",
    brand: "Ford",
    model: "Ranger",
    version: "3.2 TDCi XLT 4x4",
    year: 2023,
    color: "Rojo",
    price: 15990000,
    listPrice: 16990000,
    km: 104628,
    fuel: "Diésel",
    transmission: "Automática",
    bodyType: "Pickup",
    engine: "3.2L Duratorq 5-Cil",
    power: "200 HP",
    traction: "4x4",
    doors: 4,
    owners: 1,
    status: "Disponible",
    featured: true
  },
  {
    plate: "rdhb85",
    brand: "SsangYong",
    model: "Musso Grand",
    version: "2.2 e-XDi 4x2",
    year: 2021,
    color: "Gris",
    price: 11990000,
    listPrice: 12990000,
    km: 156000,
    fuel: "Diésel",
    transmission: "Manual",
    bodyType: "Pickup",
    engine: "2.2L e-XDi Turbo Diésel",
    power: "181 HP",
    traction: "4x2",
    doors: 4,
    owners: 1,
    status: "Disponible",
    featured: true
  },

  // Real units in physical stock at Puerto Montt lot
  {
    plate: "dxtz99",
    brand: "Nissan",
    model: "Terrano",
    version: "2.5 TDI DX Doble Cabina 4x4",
    year: 2018,
    color: "Blanco",
    price: 11490000,
    km: 145000,
    fuel: "Diésel",
    transmission: "Manual",
    bodyType: "Pickup",
    engine: "2.5L Turbo Diésel",
    power: "133 HP",
    traction: "4x4",
    doors: 4,
    owners: 1,
    status: "Disponible",
    featured: true
  },
  {
    plate: "cvff32",
    brand: "Nissan",
    model: "Terrano",
    version: "2.5 TDI DX Doble Cabina 4x4",
    year: 2017,
    color: "Rojo",
    price: 10990000,
    km: 160000,
    fuel: "Diésel",
    transmission: "Manual",
    bodyType: "Pickup",
    engine: "2.5L Turbo Diésel",
    power: "133 HP",
    traction: "4x4",
    doors: 4,
    owners: 1,
    status: "Disponible",
    featured: true
  },
  {
    plate: "fhvc10",
    brand: "Hyundai",
    model: "Tucson",
    version: "2.0 GL 4x2",
    year: 2017,
    color: "Gris",
    price: 13490000,
    km: 98000,
    fuel: "Bencina",
    transmission: "Manual",
    bodyType: "SUV",
    engine: "2.0L MPI",
    power: "155 HP",
    traction: "4x2",
    doors: 5,
    owners: 1,
    status: "Disponible",
    featured: true
  },
  {
    plate: "fvrg86",
    brand: "Toyota",
    model: "Urban Cruiser",
    version: "1.3 Dual VVT-i 4x2",
    year: 2014,
    color: "Gris",
    price: 6990000,
    km: 125000,
    fuel: "Bencina",
    transmission: "Manual",
    bodyType: "SUV",
    engine: "1.3L Dual VVT-i",
    power: "99 HP",
    traction: "4x2",
    doors: 5,
    owners: 1,
    status: "Disponible",
    featured: true
  },
  {
    plate: "hjcw79",
    brand: "Subaru",
    model: "Outback",
    version: "2.5i AWD Dynamic",
    year: 2017,
    color: "Plata",
    price: 14490000,
    km: 112000,
    fuel: "Bencina",
    transmission: "Automática",
    bodyType: "Station Wagon",
    engine: "2.5L Boxer",
    power: "175 HP",
    traction: "AWD",
    doors: 5,
    owners: 1,
    status: "Disponible",
    featured: true
  },
  {
    plate: "jspb25",
    brand: "Peugeot",
    model: "2008",
    version: "1.6 BlueHDi Allure",
    year: 2018,
    color: "Plata",
    price: 11490000,
    km: 88000,
    fuel: "Diésel",
    transmission: "Manual",
    bodyType: "SUV",
    engine: "1.6L BlueHDi",
    power: "100 HP",
    traction: "4x2",
    doors: 5,
    owners: 1,
    status: "Disponible",
    featured: true
  },
  {
    plate: "jddy77",
    brand: "Mitsubishi",
    model: "L200",
    version: "2.4 DI-D Katana 4x4",
    year: 2018,
    color: "Blanco",
    price: 13990000,
    km: 128000,
    fuel: "Diésel",
    transmission: "Manual",
    bodyType: "Pickup",
    engine: "2.4L MIVEC Turbo Diésel",
    power: "152 HP",
    traction: "4x4",
    doors: 4,
    owners: 1,
    status: "Disponible",
    featured: true
  },
  {
    plate: "jgrf99",
    brand: "Mitsubishi",
    model: "L200",
    version: "2.4 DI-D Katana 4x4",
    year: 2018,
    color: "Rojo",
    price: 13990000,
    km: 130000,
    fuel: "Diésel",
    transmission: "Manual",
    bodyType: "Pickup",
    engine: "2.4L MIVEC Turbo Diésel",
    power: "152 HP",
    traction: "4x4",
    doors: 4,
    owners: 1,
    status: "Disponible",
    featured: true
  },
  {
    plate: "jzwg23",
    brand: "Maxus",
    model: "T60",
    version: "2.8 TD DX 4x4 Doble Cabina",
    year: 2019,
    color: "Gris",
    price: 12490000,
    km: 110000,
    fuel: "Diésel",
    transmission: "Manual",
    bodyType: "Pickup",
    engine: "2.8L VGT Turbo Diésel",
    power: "148 HP",
    traction: "4x4",
    doors: 4,
    owners: 1,
    status: "Disponible",
    featured: true
  },
  {
    plate: "lpbr18",
    brand: "Toyota",
    model: "Hilux",
    version: "2.4 DX 4x4 Doble Cabina",
    year: 2020,
    color: "Gris",
    price: 18990000,
    km: 115000,
    fuel: "Diésel",
    transmission: "Manual",
    bodyType: "Pickup",
    engine: "2.4L Turbo Diésel",
    power: "150 HP",
    traction: "4x4",
    doors: 4,
    owners: 1,
    status: "Disponible",
    featured: true
  },
  {
    plate: "gwpf76",
    brand: "Chevrolet",
    model: "D-Max",
    version: "2.5 TD Doble Cabina 4x4",
    year: 2018,
    color: "Blanco",
    price: 12990000,
    km: 135000,
    fuel: "Diésel",
    transmission: "Manual",
    bodyType: "Pickup",
    engine: "2.5L Turbo Diésel",
    power: "136 HP",
    traction: "4x4",
    doors: 4,
    owners: 1,
    status: "Disponible",
    featured: true
  },
  {
    plate: "jzkb82",
    brand: "Fiat",
    model: "Fiorino",
    version: "1.4 Fire City",
    year: 2018,
    color: "Blanco",
    price: 6990000,
    km: 95000,
    fuel: "Bencina",
    transmission: "Manual",
    bodyType: "Furgón",
    engine: "1.4L Fire",
    power: "85 HP",
    traction: "4x2",
    doors: 3,
    owners: 1,
    status: "Disponible",
    featured: false
  }
];

function buildRealStockCatalog() {
  const result = [];

  for (const item of ALL_REAL_STOCK) {
    const invDir = path.join("public/cars/inventory", item.plate);
    if (!fs.existsSync(invDir)) {
      console.warn(`⚠️ Warning: folder for plate ${item.plate} does not exist!`);
      continue;
    }

    const files = fs.readdirSync(invDir)
      .filter(f => f.endsWith(".jpg") || f.endsWith(".png"))
      .sort((a, b) => {
        const numA = parseInt(a);
        const numB = parseInt(b);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.localeCompare(b);
      });

    // Front photo: 0.jpg (or special front index)
    let frontImg = `/cars/inventory/${item.plate}/0.jpg`;
    if (item.plate === "jzwg23" && files.includes("4.jpg")) {
      frontImg = `/cars/inventory/${item.plate}/4.jpg`;
    }

    const gallery = files.map(f => `/cars/inventory/${item.plate}/${f}`);
    const filteredGal = gallery.filter(g => g !== frontImg);
    const finalGallery = [frontImg, ...filteredGal];

    const slug = `${item.brand.toLowerCase()}-${item.model.toLowerCase()}-${item.year}-${item.plate}`
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    result.push({
      slug,
      brand: item.brand,
      model: item.model,
      version: item.version,
      year: item.year,
      price: item.price,
      listPrice: item.listPrice,
      km: item.km,
      fuel: item.fuel,
      transmission: item.transmission,
      bodyType: item.bodyType,
      location: "Puerto Montt, Los Lagos",
      image: frontImg,
      gallery: finalGallery,
      engine: item.engine,
      power: item.power,
      traction: item.traction,
      doors: item.doors,
      owners: item.owners,
      featured: item.featured ?? false,
      status: item.status || "Disponible",
      highlights: [
        "Inspección mecánica de 150 puntos aprobada",
        "Documentación y transferibilidad inmediata al día",
        "Opción de financiamiento con pie desde 20%"
      ]
    });
  }

  // Save to data/vehicles.json
  fs.writeFileSync("data/vehicles.json", JSON.stringify(result, null, 2), "utf8");
  console.log(`✅ Saved ${result.length} authentic stock vehicles to data/vehicles.json`);

  // Write lib/vehicles.ts
  const tsContent = `// 100% Authentic RG Motors Stock from Official Inventory
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
  listPrice?: number;
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

export const initialVehicles: Vehicle[] = ${JSON.stringify(result, null, 2)};

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

export function formatKm(km: number): string {
  return new Intl.NumberFormat("es-CL").format(km) + " km";
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
  "Ford",
  "Peugeot",
  "Volkswagen",
  "Maxus",
  "MG",
  "Hyundai",
  "Subaru",
  "SsangYong",
  "Fiat",
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

  fs.writeFileSync("lib/vehicles.ts", tsContent, "utf8");
  console.log(`✅ Saved ${result.length} authentic stock vehicles to lib/vehicles.ts`);
}

buildRealStockCatalog();
