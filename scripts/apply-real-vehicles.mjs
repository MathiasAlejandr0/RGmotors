import { readFile, writeFile, mkdir } from "node:fs/promises";

async function main() {
  const realVehicles = JSON.parse(await readFile("scratch/real_vehicles.json", "utf8"));

  // Escribir en data/vehicles.json
  await mkdir("data", { recursive: true });
  await writeFile("data/vehicles.json", JSON.stringify(realVehicles, null, 2), "utf8");

  // Generar código TypeScript para lib/vehicles.ts
  const tsContent = `import { asset } from "@/lib/asset";

export type Vehicle = {
  slug: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  price: number;
  km: number;
  fuel: "Bencina" | "Diésel" | "Híbrido" | "Eléctrico";
  transmission: "Automática" | "Manual";
  bodyType: "SUV" | "Sedán" | "Camioneta" | "Hatchback";
  location: string;
  image: string;
  engine: string;
  power: string;
  traction: string;
  doors: number;
  owners: number;
  featured: boolean;
  status?: "Disponible" | "En reserva" | "Vendido" | "Borrador";
  highlights: string[];
  gallery?: string[];
  spin?: { count: number; ext?: string };
};

export const vehicles: Vehicle[] = ${JSON.stringify(realVehicles, null, 2)};

export const BRANDS = [...new Set(vehicles.map((v) => v.brand))].sort();
export const BODY_TYPES = [...new Set(vehicles.map((v) => v.bodyType))];
export const FUELS = [...new Set(vehicles.map((v) => v.fuel))];
export const TRANSMISSIONS = [...new Set(vehicles.map((v) => v.transmission))];

export function getVehicle(slug: string): Vehicle | undefined {
  return vehicles.find((v) => v.slug === slug);
}

export function spinFramesOf(v: Vehicle): string[] {
  if (!v.spin || v.spin.count <= 0) return [];
  const ext = v.spin.ext ?? "jpg";
  return Array.from(
    { length: v.spin.count },
    (_, i) =>
      asset(\`/cars/spin/\${v.slug}/\${String(i + 1).padStart(3, "0")}.\${ext}\`)
  );
}

export function specsOf(v: Vehicle): { label: string; value: string }[] {
  return [
    { label: "Año", value: String(v.year) },
    { label: "Kilometraje", value: \`\${v.km.toLocaleString("es-CL")} km\` },
    { label: "Combustible", value: v.fuel },
    { label: "Transmisión", value: v.transmission },
    { label: "Motor", value: v.engine },
    { label: "Potencia", value: v.power },
    { label: "Tracción", value: v.traction },
    { label: "Puertas", value: String(v.doors) },
    { label: "Carrocería", value: v.bodyType },
    { label: "Dueños", value: String(v.owners) },
  ];
}

export function formatCLP(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Cuota mensual referencial (crédito francés), pie 20% por defecto. */
export function estimateMonthly(
  price: number,
  downPct = 20,
  term = 48,
  monthlyRate = 0.019
): number {
  const financed = price - Math.round((price * downPct) / 100);
  if (financed <= 0) return 0;
  const i = monthlyRate;
  return Math.round((financed * i) / (1 - Math.pow(1 + i, -term)));
}
`;

  await writeFile("lib/vehicles.ts", tsContent, "utf8");
  console.log("✅ lib/vehicles.ts y data/vehicles.json actualizados con el inventario real de RG Motors!");
}

main().catch(console.error);
