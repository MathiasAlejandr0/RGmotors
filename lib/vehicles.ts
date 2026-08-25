import { asset } from "@/lib/asset";

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
  /**
   * Configuración del giro 360° con fotos reales.
   * Las fotos van en: public/cars/spin/<slug>/001.jpg, 002.jpg, ...
   * Si no se define, la ficha usa el modelo 3D interactivo como respaldo.
   */
  spin?: { count: number; ext?: string };
};

export const vehicles: Vehicle[] = [
  {
    slug: "toyota-rav4-hibrido",
    brand: "Toyota",
    model: "RAV4",
    version: "2.5 Hybrid AWD",
    year: 2023,
    price: 21990000,
    km: 28500,
    fuel: "Híbrido",
    transmission: "Automática",
    bodyType: "SUV",
    location: "Santiago, RM",
    image: "/cars/toyota-rav4-hibrido.jpg",
    engine: "2.5L Hybrid",
    power: "218 HP",
    traction: "AWD",
    doors: 5,
    owners: 1,
    featured: true,
    spin: { count: 36 },
    highlights: [
      "Tour 360° con video real del vehículo",
      "Híbrido AWD — bajo consumo",
      "Inspección de 150 puntos aprobada",
      "Garantía RG Motors de 6 meses",
    ],
  },
  {
    slug: "toyota-rav4-2022",
    brand: "Toyota",
    model: "RAV4",
    version: "2.0 XLI 4x2",
    year: 2022,
    price: 18990000,
    km: 34500,
    fuel: "Bencina",
    transmission: "Automática",
    bodyType: "SUV",
    location: "Santiago, RM",
    image: "/cars/toyota-rav4-2022.jpg",
    engine: "2.0L",
    power: "175 HP",
    traction: "4x2",
    doors: 5,
    owners: 1,
    featured: false,
    highlights: [
      "Mantenciones al día en concesionario oficial",
      "Inspección de 150 puntos aprobada",
      "Sin choques ni deuda — informe verificado",
      "Garantía RG Motors de 6 meses",
    ],
  },
  {
    slug: "mazda-cx5-2021",
    brand: "Mazda",
    model: "CX-5",
    version: "2.0 R",
    year: 2021,
    price: 17490000,
    km: 42000,
    fuel: "Bencina",
    transmission: "Automática",
    bodyType: "SUV",
    location: "Santiago, RM",
    image: "/cars/spin/mazda-cx5-2021/004.jpg",
    engine: "2.0L",
    power: "165 HP",
    traction: "4x2",
    doors: 5,
    owners: 1,
    featured: true,
    spin: { count: 24 },
    highlights: [
      "Cuero y techo panorámico",
      "Inspección de 150 puntos aprobada",
      "Informe de historial sin observaciones",
      "Garantía RG Motors de 6 meses",
    ],
  },
  {
    slug: "hyundai-tucson-2020",
    brand: "Hyundai",
    model: "Tucson",
    version: "2.0 GLS",
    year: 2020,
    price: 14990000,
    km: 58000,
    fuel: "Diésel",
    transmission: "Automática",
    bodyType: "SUV",
    location: "Santiago, RM",
    image: "/cars/hyundai-tucson-2020.jpg",
    engine: "2.0L CRDi",
    power: "185 HP",
    traction: "4x2",
    doors: 5,
    owners: 2,
    featured: false,
    highlights: [
      "Bajo consumo diésel",
      "Inspección de 150 puntos aprobada",
      "Historial verificado",
      "Garantía RG Motors de 6 meses",
    ],
  },
  {
    slug: "ford-ranger-2021",
    brand: "Ford",
    model: "Ranger",
    version: "3.2 XLT 4x4",
    year: 2021,
    price: 22990000,
    km: 61000,
    fuel: "Diésel",
    transmission: "Automática",
    bodyType: "Camioneta",
    location: "Santiago, RM",
    image: "/cars/ford-ranger-2021.jpg",
    engine: "3.2L TDCi",
    power: "200 HP",
    traction: "4x4",
    doors: 4,
    owners: 1,
    featured: true,
    highlights: [
      "4x4 con reductora",
      "Inspección de 150 puntos aprobada",
      "Mantenciones al día",
      "Garantía RG Motors de 6 meses",
    ],
  },
  {
    slug: "chevrolet-sail-2020",
    brand: "Chevrolet",
    model: "Sail",
    version: "1.5 LT",
    year: 2020,
    price: 8490000,
    km: 47000,
    fuel: "Bencina",
    transmission: "Manual",
    bodyType: "Sedán",
    location: "Santiago, RM",
    image: "/cars/chevrolet-sail-2020.jpg",
    engine: "1.5L",
    power: "108 HP",
    traction: "4x2",
    doors: 4,
    owners: 1,
    featured: false,
    highlights: [
      "Ideal primer auto",
      "Bajo kilometraje",
      "Inspección de 150 puntos aprobada",
      "Garantía RG Motors de 6 meses",
    ],
  },
  {
    slug: "kia-sportage-2019",
    brand: "Kia",
    model: "Sportage",
    version: "2.0 EX",
    year: 2019,
    price: 13990000,
    km: 72000,
    fuel: "Bencina",
    transmission: "Automática",
    bodyType: "SUV",
    location: "Santiago, RM",
    image: "/cars/kia-sportage-2019.jpg",
    engine: "2.0L",
    power: "155 HP",
    traction: "4x2",
    doors: 5,
    owners: 2,
    featured: false,
    highlights: [
      "Equipamiento full",
      "Inspección de 150 puntos aprobada",
      "Historial verificado",
      "Garantía RG Motors de 6 meses",
    ],
  },
  {
    slug: "nissan-versa-2021",
    brand: "Nissan",
    model: "Versa",
    version: "1.6 Sense",
    year: 2021,
    price: 9990000,
    km: 39000,
    fuel: "Bencina",
    transmission: "Automática",
    bodyType: "Sedán",
    location: "Santiago, RM",
    image: "/cars/nissan-versa-2021.jpg",
    engine: "1.6L",
    power: "118 HP",
    traction: "4x2",
    doors: 4,
    owners: 1,
    featured: false,
    highlights: [
      "Excelente rendimiento urbano",
      "Inspección de 150 puntos aprobada",
      "Único dueño",
      "Garantía RG Motors de 6 meses",
    ],
  },
  {
    slug: "suzuki-swift-2022",
    brand: "Suzuki",
    model: "Swift",
    version: "1.2 GL",
    year: 2022,
    price: 10490000,
    km: 28000,
    fuel: "Bencina",
    transmission: "Manual",
    bodyType: "Hatchback",
    location: "Santiago, RM",
    image: "/cars/suzuki-swift-2022.jpg",
    engine: "1.2L",
    power: "90 HP",
    traction: "4x2",
    doors: 5,
    owners: 1,
    featured: false,
    highlights: [
      "Muy económico",
      "Bajo kilometraje",
      "Inspección de 150 puntos aprobada",
      "Garantía RG Motors de 6 meses",
    ],
  },
  {
    slug: "toyota-hilux-2020",
    brand: "Toyota",
    model: "Hilux",
    version: "2.8 SRV 4x4",
    year: 2020,
    price: 23990000,
    km: 84000,
    fuel: "Diésel",
    transmission: "Automática",
    bodyType: "Camioneta",
    location: "Santiago, RM",
    image: "/cars/toyota-hilux-2020.jpg",
    engine: "2.8L",
    power: "204 HP",
    traction: "4x4",
    doors: 4,
    owners: 2,
    featured: true,
    highlights: [
      "La pickup más confiable",
      "4x4 con reductora",
      "Inspección de 150 puntos aprobada",
      "Garantía RG Motors de 6 meses",
    ],
  },
];

export const BRANDS = [...new Set(vehicles.map((v) => v.brand))].sort();
export const BODY_TYPES = [...new Set(vehicles.map((v) => v.bodyType))];
export const FUELS = [...new Set(vehicles.map((v) => v.fuel))];
export const TRANSMISSIONS = [...new Set(vehicles.map((v) => v.transmission))];

export function getVehicle(slug: string): Vehicle | undefined {
  return vehicles.find((v) => v.slug === slug);
}

/**
 * Devuelve las URLs de los frames del giro 360° de fotos reales, en orden.
 * Vacío si el vehículo aún no tiene fotos 360° cargadas.
 */
export function spinFramesOf(v: Vehicle): string[] {
  if (!v.spin || v.spin.count <= 0) return [];
  const ext = v.spin.ext ?? "jpg";
  return Array.from(
    { length: v.spin.count },
    (_, i) =>
      asset(`/cars/spin/${v.slug}/${String(i + 1).padStart(3, "0")}.${ext}`)
  );
}

export function specsOf(v: Vehicle): { label: string; value: string }[] {
  return [
    { label: "Año", value: String(v.year) },
    { label: "Kilometraje", value: `${v.km.toLocaleString("es-CL")} km` },
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
