/**
 * Mirror ESM de lib/vehicles/techSpecs.ts para scripts Node.
 */
function norm(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const RULES = [
  {
    match: (b, m, y) => b.includes("mitsubishi") && /l200|katana/.test(m) && y >= 2024,
    spec: { engine: "2.4L Biturbo Diésel", power: "201 HP", doors: 4, fuel: "Diésel" },
  },
  {
    match: (b, m) => b.includes("mitsubishi") && /l200|katana/.test(m),
    spec: { engine: "2.4L Turbo Diésel", power: "152 HP", doors: 4, fuel: "Diésel" },
  },
  {
    match: (b, m) =>
      b.includes("toyota") && m.includes("hilux") && m.includes("sr") && m.includes("4x4"),
    spec: { engine: "2.8L Turbo Diésel", power: "201 HP", doors: 4, fuel: "Diésel" },
  },
  {
    match: (b, m) => b.includes("toyota") && m.includes("hilux") && m.includes("4x4"),
    spec: { engine: "2.4L Turbo Diésel", power: "148 HP", doors: 4, fuel: "Diésel" },
  },
  {
    match: (b, m) => b.includes("toyota") && m.includes("hilux"),
    spec: { engine: "2.4L Turbo Diésel", power: "148 HP", doors: 4, fuel: "Diésel" },
  },
  {
    match: (b, m) => b.includes("toyota") && m.includes("raize"),
    spec: { engine: "1.2L Dual VVT-i", power: "87 HP", doors: 5, fuel: "Bencina", traction: "4x2" },
  },
  {
    match: (b, m) => b.includes("nissan") && m.includes("navara"),
    spec: { engine: "2.3L Bi-Turbo Diésel", power: "190 HP", doors: 4, fuel: "Diésel" },
  },
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
  {
    match: (b, m) => b.includes("ford") && m.includes("ranger"),
    spec: { engine: "2.0L Bi-Turbo Diésel", power: "210 HP", doors: 4, fuel: "Diésel" },
  },
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
  {
    match: (b, m) => b.includes("chevrolet") && /d.?max|dmax/.test(m),
    spec: { engine: "2.5L Turbo Diésel", power: "163 HP", doors: 4, fuel: "Diésel" },
  },
  {
    match: (b, m) => b.includes("volkswagen") && m.includes("amarok"),
    spec: { engine: "2.0L BiTDI Diésel", power: "180 HP", doors: 4, fuel: "Diésel" },
  },
  {
    match: (b, m) => b.includes("volkswagen") && m.includes("saveiro") && m.includes("1.6"),
    spec: { engine: "1.6L MSI", power: "110 HP", doors: 2, fuel: "Bencina", traction: "4x2" },
  },
  {
    match: (b, m) => b.includes("volkswagen") && m.includes("saveiro"),
    spec: { engine: "1.6L MSI", power: "110 HP", doors: 4, fuel: "Bencina", traction: "4x2" },
  },
  {
    match: (b, m) => b.includes("maxus") && m.includes("t60"),
    spec: { engine: "2.0L Turbo Diésel", power: "163 HP", doors: 4, fuel: "Diésel" },
  },
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
  {
    match: (b, m) => b.includes("hino") && m.includes("xzu"),
    spec: { engine: "4.0L Diésel", power: "150 HP", doors: 2, fuel: "Diésel", traction: "4x2" },
  },
  {
    match: (b, m) => b.includes("hyundai") && m.includes("porter"),
    spec: { engine: "2.5L CRDi Diésel", power: "130 HP", doors: 2, fuel: "Diésel", traction: "4x2" },
  },
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

export function enrichVehicleTechSpec(vehicle) {
  const b = norm(vehicle.brand);
  const m = norm(vehicle.model);
  const y = vehicle.year;
  const spec = RULES.find((r) => r.match(b, m, y))?.spec;
  if (!spec) {
    return {
      ...vehicle,
      engine: vehicle.engine && vehicle.engine !== "—" ? vehicle.engine : "Consultar",
      power: vehicle.power && vehicle.power !== "—" ? vehicle.power : "Consultar",
      doors: vehicle.doors ?? 4,
    };
  }
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
