const fs = require("fs");

const vehiclesData = JSON.parse(fs.readFileSync("data/vehicles.json", "utf8"));

const fileContent = `// 100% Authentic RG Motors Stock from Official PDF Inventory
export interface VehicleSpin {
  count: number;
  pattern?: string;
  ext?: string;
}

export interface Vehicle {
  slug: string;
  plate?: string;
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
  status?: "Disponible" | "En reserva" | "Vendido" | "Borrador" | "En preparación";
  hasRealPhotos?: boolean;
  supplier?: string;
  techReview?: string;
  circPermit?: string;
  highlights?: string[];
}

export const initialVehicles: Vehicle[] = ${JSON.stringify(vehiclesData, null, 2)};

export const HERO_SHOWCASE_VEHICLES: Vehicle[] = initialVehicles.filter(v => v.featured).slice(0, 6);

export const vehicles: Vehicle[] = initialVehicles;

export function getVehicle(slug: string): Vehicle | undefined {
  return vehicles.find((v) => v.slug === slug);
}

export function formatCLP(amount: number): string {
  if (!amount || amount <= 0) return "Consultar precio";
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
  if (!price || price <= 0) return 0;
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
  "Maxus",
  "MG",
  "SsangYong",
  "Omoda",
  "Changan",
  "Hino",
  "RAM",
  "JAC",
  "Otro",
];

export const BODY_TYPES = [
  "Pickup",
  "SUV",
  "Furgón",
  "Sedán",
  "Hatchback",
  "Camión",
  "Station Wagon",
  "Otro",
];

export const FUELS = ["Diésel", "Bencina", "Híbrido", "Eléctrico"];

export const TRANSMISSIONS = ["Automática", "Manual"];

export const STATUS_TYPES = ["Disponible", "En reserva", "Vendido", "Borrador", "En preparación"] as const;
`;

fs.writeFileSync("lib/vehicles.ts", fileContent, "utf8");
console.log("Successfully generated lib/vehicles.ts with clean PDF inventory!");
