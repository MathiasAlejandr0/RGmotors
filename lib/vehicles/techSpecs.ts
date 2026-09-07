/**
 * Fichas técnicas referenciales (Chile) por marca/modelo.
 * Fuentes: Mitsubishi Motors CL, Toyota CL, fichas de concesionarios.
 */
export type TechSpec = {
  engine: string;
  power: string;
  traction?: string;
  doors?: number;
  fuel?: string;
  transmission?: string;
};

function norm(s: string) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Orden: reglas más específicas primero. */
const RULES: { match: (brand: string, model: string, year: number) => boolean; spec: TechSpec }[] = [
  // Mitsubishi L200 / Katana — gen 6 (2024+): 2.4 Biturbo 201 HP
  {
    match: (b, m, y) => b.includes("mitsubishi") && /l200|katana/.test(m) && y >= 2024,
    spec: { engine: "2.4L Biturbo Diésel", power: "201 HP", doors: 4, fuel: "Diésel" },
  },
  // L200 gen 5 Katana/Work (~152 HP)
  {
    match: (b, m) => b.includes("mitsubishi") && /l200|katana/.test(m),
    spec: { engine: "2.4L Turbo Diésel", power: "152 HP", doors: 4, fuel: "Diésel" },
  },

  // Toyota Hilux SR 4x4 → 2.8 201 HP
  {
    match: (b, m) => b.includes("toyota") && m.includes("hilux") && m.includes("sr") && m.includes("4x4"),
    spec: { engine: "2.8L Turbo Diésel", power: "201 HP", doors: 4, fuel: "Diésel" },
  },
  // Hilux DX / 4x4 genérico sin SR → 2.4 148 HP (gama Chile)
  {
    match: (b, m) => b.includes("toyota") && m.includes("hilux") && m.includes("4x4"),
    spec: { engine: "2.4L Turbo Diésel", power: "148 HP", doors: 4, fuel: "Diésel" },
  },
  // Hilux 4x2
  {
    match: (b, m) => b.includes("toyota") && m.includes("hilux"),
    spec: { engine: "2.4L Turbo Diésel", power: "148 HP", doors: 4, fuel: "Diésel" },
  },
  // Raize 1.2
  {
    match: (b, m) => b.includes("toyota") && m.includes("raize"),
    spec: { engine: "1.2L Dual VVT-i", power: "87 HP", doors: 5, fuel: "Bencina", traction: "4x2" },
  },

  // Nissan Navara Chile (YE2) 2.3 Bi-Turbo ~190 HP
  {
    match: (b, m) => b.includes("nissan") && m.includes("navara"),
    spec: { engine: "2.3L Bi-Turbo Diésel", power: "190 HP", doors: 4, fuel: "Diésel" },
  },

  // Ford Raptor F-150
  {
    match: (b, m) => b.includes("ford") && m.includes("raptor"),
    spec: {
      engine: "3.5L V6 EcoBoost Twin-Turbo",
      power: "450 HP",
      doors: 4,
      fuel: "Bencina",
      traction: "4x4",
      transmission: "Automática",
    },
  },
  // Ford Ranger
  {
    match: (b, m) => b.includes("ford") && m.includes("ranger"),
    spec: { engine: "2.0L Bi-Turbo Diésel", power: "210 HP", doors: 4, fuel: "Diésel" },
  },

  // Chevrolet Colorado Chile 2.8 Duramax
  {
    match: (b, m) => b.includes("chevrolet") && m.includes("colorado"),
    spec: {
      engine: "2.8L Duramax Turbo Diésel",
      power: "200 HP",
      doors: 4,
      fuel: "Diésel",
      transmission: "Automática",
    },
  },
  // D-Max
  {
    match: (b, m) => b.includes("chevrolet") && /d.?max|dmax/.test(m),
    spec: { engine: "2.5L Turbo Diésel", power: "163 HP", doors: 4, fuel: "Diésel" },
  },

  // VW Amarok V6 / 2.0 — Amarok MT Chile often 2.0 BiTDI ~180 or V6
  {
    match: (b, m) => b.includes("volkswagen") && m.includes("amarok"),
    spec: { engine: "2.0L BiTDI Diésel", power: "180 HP", doors: 4, fuel: "Diésel" },
  },
  // Saveiro
  {
    match: (b, m) => b.includes("volkswagen") && m.includes("saveiro") && m.includes("1.6"),
    spec: { engine: "1.6L MSI", power: "110 HP", doors: 2, fuel: "Bencina", traction: "4x2" },
  },
  {
    match: (b, m) => b.includes("volkswagen") && m.includes("saveiro"),
    spec: { engine: "1.6L MSI", power: "110 HP", doors: 4, fuel: "Bencina", traction: "4x2" },
  },

  // Maxus T60
  {
    match: (b, m) => b.includes("maxus") && m.includes("t60"),
    spec: { engine: "2.0L Turbo Diésel", power: "163 HP", doors: 4, fuel: "Diésel" },
  },

  // Peugeot Partner / Expert
  {
    match: (b, m) => b.includes("peugeot") && m.includes("partner") && /1\.5/.test(m),
    spec: { engine: "1.5L BlueHDi", power: "100 HP", doors: 5, fuel: "Diésel", traction: "4x2" },
  },
  {
    match: (b, m) => b.includes("peugeot") && m.includes("partner") && /1\.6|hdi/.test(m),
    spec: { engine: "1.6L BlueHDi", power: "92 HP", doors: 5, fuel: "Diésel", traction: "4x2" },
  },
  {
    match: (b, m) => b.includes("peugeot") && m.includes("partner"),
    spec: { engine: "1.5L BlueHDi", power: "100 HP", doors: 5, fuel: "Diésel", traction: "4x2" },
  },
  {
    match: (b, m) => b.includes("peugeot") && m.includes("expert"),
    spec: { engine: "2.0L BlueHDi", power: "120 HP", doors: 4, fuel: "Diésel", traction: "4x2" },
  },

  // Hino / Porter trucks
  {
    match: (b, m) => b.includes("hino") && m.includes("xzu"),
    spec: { engine: "4.0L Diésel", power: "150 HP", doors: 2, fuel: "Diésel", traction: "4x2" },
  },
  {
    match: (b, m) => b.includes("hyundai") && m.includes("porter"),
    spec: { engine: "2.5L CRDi Diésel", power: "130 HP", doors: 2, fuel: "Diésel", traction: "4x2" },
  },

  // Mercedes ML300 CDI
  {
    match: (b, m) => b.includes("mercedes") && /ml\s*300|ml300/.test(m),
    spec: {
      engine: "3.0L V6 CDI Diésel",
      power: "190 HP",
      doors: 5,
      fuel: "Diésel",
      traction: "4x4",
      transmission: "Automática",
    },
  },

  // Subaru WRX STI
  {
    match: (b, m) => b.includes("subaru") && /wrx|sti/.test(m),
    spec: {
      engine: "2.5L Boxer Turbo",
      power: "300 HP",
      doors: 4,
      fuel: "Bencina",
      traction: "AWD",
      transmission: "Manual",
    },
  },
];

export function lookupTechSpec(brand: string, model: string, year: number): TechSpec | null {
  const b = norm(brand);
  const m = norm(model);
  for (const rule of RULES) {
    if (rule.match(b, m, year)) return rule.spec;
  }
  return null;
}

/** Completa engine/power/doors/etc. desde ficha referencial + tracción del modelo. */
export function enrichVehicleTechSpec<
  T extends {
    brand: string;
    model: string;
    year: number;
    engine?: string;
    power?: string;
    traction?: string;
    doors?: number;
    fuel?: string;
    transmission?: string;
  },
>(vehicle: T): T {
  const spec = lookupTechSpec(vehicle.brand, vehicle.model, vehicle.year);
  if (!spec) {
    return {
      ...vehicle,
      engine: vehicle.engine && vehicle.engine !== "—" ? vehicle.engine : "Consultar",
      power: vehicle.power && vehicle.power !== "—" ? vehicle.power : "Consultar",
      doors: vehicle.doors ?? 4,
    };
  }

  // Siempre preferir ficha real para motor/potencia (el import dejó valores genéricos)
  return {
    ...vehicle,
    engine: spec.engine,
    power: spec.power,
    doors: spec.doors ?? vehicle.doors ?? 4,
    fuel: spec.fuel ?? vehicle.fuel,
    transmission: spec.transmission ?? vehicle.transmission,
    traction: spec.traction ?? vehicle.traction,
  };
}
