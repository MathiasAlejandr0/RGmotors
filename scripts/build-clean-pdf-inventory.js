const fs = require("fs");
const path = require("path");

function cleanPlate(p) {
  if (!p) return "";
  return p.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function cleanBrand(b) {
  if (!b) return "Otro";
  const s = b.trim().toUpperCase();
  const map = {
    MITSUBISHI: "Mitsubishi",
    TOYOTA: "Toyota",
    PEUGEOT: "Peugeot",
    NISSAN: "Nissan",
    CHEVROLET: "Chevrolet",
    FORD: "Ford",
    VOLKSWAGEN: "Volkswagen",
    VOLSWAGEN: "Volkswagen",
    MAXUS: "Maxus",
    MG: "MG",
    SSANGYONG: "SsangYong",
    SSANYONG: "SsangYong",
    HYUNDAI: "Hyundai",
    RENAULT: "Renault",
    MERCEDEZ: "Mercedes-Benz",
    "MERCEDES-BENZ": "Mercedes-Benz",
    SUBARU: "Subaru",
    OMODA: "Omoda",
    CHANGAN: "Changan",
    HINO: "Hino",
    RAM: "RAM",
    JAC: "JAC",
    FIAT: "Fiat"
  };
  return map[s] || (s.charAt(0) + s.slice(1).toLowerCase());
}

function cleanColor(c) {
  if (!c) return "Blanco";
  const cl = c.trim().toLowerCase();
  if (cl.includes("rojo") || cl.includes("roja")) return "Rojo";
  if (cl.includes("blanco") || cl.includes("blanca")) return "Blanco";
  if (cl.includes("gris") || cl.includes("platead") || cl.includes("plata")) return "Gris";
  if (cl.includes("azul")) return "Azul";
  if (cl.includes("negro") || cl.includes("negra")) return "Negro";
  if (cl.includes("celeste")) return "Celeste";
  return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
}

function determineBodyType(model, brand) {
  const m = (model || "").toLowerCase();
  if (m.includes("katana") || m.includes("hilux") || m.includes("dmax") || m.includes("d-max") || m.includes("colorado") || m.includes("ranger") || m.includes("raptor") || m.includes("saveiro") || m.includes("amarok") || m.includes("t60") || m.includes("musso") || m.includes("terrano") || m.includes("navara")) {
    return "Pickup";
  }
  if (m.includes("partner") || m.includes("expert") || m.includes("v700") || m.includes("fiorino")) {
    return "Furgón";
  }
  if (m.includes("porter") || m.includes("xzu") || m.includes("x200")) {
    return "Camión";
  }
  if (m.includes("raize") || m.includes("tucson") || m.includes("urban cruiser") || m.includes("2008") || m.includes("3008") || m.includes("duster") || m.includes("ml300") || m.includes("zs") || m.includes("tracker") || m.includes("c5") || m.includes("tahoe") || m.includes("montero")) {
    return "SUV";
  }
  if (m.includes("outback")) {
    return "Station Wagon";
  }
  if (m.includes("wrx") || m.includes("alsvin")) {
    return "Sedán";
  }
  if (m.includes("3") || m.includes("spark") || m.includes("i10") || m.includes("morning") || m.includes("rio") || m.includes("corsa") || m.includes("mirage")) {
    return "Hatchback";
  }
  return "Pickup";
}

function determineFuel(model, brand) {
  const m = (model || "").toLowerCase();
  if (m.includes("raize") || m.includes("saveiro") || m.includes("duster") || m.includes("wrx") || m.includes("3") || m.includes("spark") || m.includes("alsvin") || m.includes("tahoe") || m.includes("c5") || m.includes("zs") || m.includes("tracker")) {
    return "Bencina";
  }
  return "Diésel";
}

function determineTransmission(model) {
  const m = (model || "").toLowerCase();
  if (m.includes(" aut") || m.includes(" at") || m.includes("autom") || m.includes("raptor") || m.includes("tahoe") || m.includes("ml300") || m.includes("colorado") || m.includes("c5")) {
    return "Automática";
  }
  return "Manual";
}

function parsePriceNumber(rawOffer, rawList) {
  function getNum(s) {
    if (!s) return 0;
    if (/falta|reservado|preparacion|terminar|taller|casa|consignado|rq|fotos/i.test(s)) return 0;
    const clean = s.replace(/[^0-9]/g, "");
    if (!clean) return 0;
    let n = parseInt(clean, 10);
    if (n > 100000000) n = Math.round(n / 100);
    return n;
  }
  let offer = getNum(rawOffer);
  let list = getNum(rawList);
  if (offer > 0) return { price: offer, listPrice: list > offer ? list : undefined };
  if (list > 0) return { price: list, listPrice: undefined };
  return { price: 0, listPrice: undefined };
}

function parseKmNumber(raw) {
  if (!raw) return 0;
  if (/falta|consignado|ald|c\.poder|rq|fotos/i.test(raw)) return 0;
  const clean = raw.replace(/[^0-9]/g, "");
  if (!clean) return 0;
  return parseInt(clean, 10);
}

function cleanLocationName(loc) {
  if (!loc) return "Puerto Montt · Sucursal Principal";
  const l = loc.toUpperCase();
  if (l.includes("CARDONAL")) return "Puerto Montt · Sucursal Cardonal";
  if (l.includes("SALGADO") || l.includes("CASA")) return "Puerto Montt · Sucursal Salgado";
  if (l.includes("UNI") || l.includes("CHILE")) return "Puerto Montt · Sucursal Unidades Chile";
  if (l.includes("RUDY")) return "Puerto Montt · Don Rudy";
  return `Puerto Montt · ${loc}`;
}

function determineStatus(rawOfferPrice, rawListPrice, location) {
  const allText = `${rawOfferPrice} ${rawListPrice} ${location}`.toUpperCase();
  if (allText.includes("RESERVADO")) return "En reserva";
  if (allText.includes("PREPARACION") || allText.includes("PREPARADOR") || allText.includes("TERMINAR") || allText.includes("TALLER")) {
    return "En preparación";
  }
  return "Disponible";
}

// 1. Parse File 1: UNIDADES CHILE (5)
const text1 = fs.readFileSync("scratch/stock_unidades_chile_5.txt", "utf8");
const lines1 = text1.split("\n").map(l => l.trim()).filter(Boolean);
const rawList = [];

for (const line of lines1) {
  if (/^PATENTE/i.test(line) || /^--/i.test(line)) continue;
  const parts = line.split("\t").map(p => p.trim());
  if (parts.length < 5) continue;
  let [idx, patente, marca, modelo, color, ano, precioLista, precioOferta, km, proveedor, rev, permiso, ubicacion] = parts;
  if (!/^[0-9]+$/.test(idx) && parts[0].length >= 4) {
    [patente, marca, modelo, color, ano, precioLista, precioOferta, km, proveedor, rev, permiso, ubicacion] = parts;
  }
  const cleanP = cleanPlate(patente);
  if (!cleanP || !marca) continue;

  rawList.push({
    source: "UNIDADES_CHILE_5",
    rawPlate: patente,
    plate: cleanP,
    brand: marca,
    model: modelo,
    color,
    year: parseInt(ano, 10) || 2022,
    rawListPrice: precioLista,
    rawOfferPrice: precioOferta,
    rawKm: km,
    supplier: proveedor,
    techReview: rev,
    circPermit: permiso,
    location: ubicacion || "UNI CHILE"
  });
}

// 2. Parse File 2: RG MOTORS
const text2 = fs.readFileSync("scratch/stock_rg_motors.txt", "utf8");
const lines2 = text2.split("\n").map(l => l.trim()).filter(Boolean);

for (const line of lines2) {
  if (/^PATENTE/i.test(line) || /^--/i.test(line)) continue;
  const parts = line.split("\t").map(p => p.trim());
  if (parts.length < 3) continue;

  let idx = parts[0];
  let patente = parts[1];
  let marca = parts[2];
  let modelo = parts[3];
  let color = parts[4];
  let ano = parts[5];
  let precioLista = parts[6];
  let precioOferta = parts[7];
  let km = parts[8];
  let proveedor = parts[9];
  let rev = parts[10];
  let permiso = parts[11];
  let ubicacion = parts[12];

  if (/^\d+\s+[A-Z0-9]+$/i.test(idx)) {
    const split = idx.split(/\s+/);
    patente = split[1];
    marca = parts[1];
    modelo = parts[2];
    color = parts[3];
    ano = parts[4];
    precioLista = parts[5];
    precioOferta = parts[6];
    km = parts[7];
    proveedor = parts[8];
    rev = parts[9];
    permiso = parts[10];
    ubicacion = parts[11];
  }

  if (!/^\d+$/.test(idx) && !/^\d+\s+[A-Z0-9]+$/i.test(idx)) {
    patente = parts[0];
    marca = parts[1];
    modelo = parts[2];
    color = parts[3];
    ano = parts[4];
    precioLista = parts[5];
    precioOferta = parts[6];
    km = parts[7];
    proveedor = parts[8];
    rev = parts[9];
    permiso = parts[10];
    ubicacion = parts[11];
  }

  if (precioLista && (precioLista.toLowerCase().includes("km") || precioLista.toLowerCase().includes("econo"))) {
    ubicacion = rev;
    permiso = proveedor;
    rev = km;
    proveedor = precioOferta;
    km = precioLista;
    precioLista = "";
    precioOferta = "";
  }

  const cleanP = cleanPlate(patente);
  if (!cleanP || !marca) continue;

  rawList.push({
    source: "RG_MOTORS",
    rawPlate: patente,
    plate: cleanP,
    brand: marca,
    model: modelo,
    color,
    year: parseInt(ano, 10) || 2022,
    rawListPrice: precioLista,
    rawOfferPrice: precioOferta,
    rawKm: km,
    supplier: proveedor,
    techReview: rev,
    circPermit: permiso,
    location: ubicacion || "CARDONAL"
  });
}

// Map unique vehicles
const uniqueMap = new Map();
for (const v of rawList) {
  if (!uniqueMap.has(v.plate)) {
    uniqueMap.set(v.plate, v);
  } else {
    const prev = uniqueMap.get(v.plate);
    uniqueMap.set(v.plate, { ...prev, ...v });
  }
}

const finalVehicles = [];
for (const [plate, raw] of uniqueMap.entries()) {
  const brand = cleanBrand(raw.brand);
  const model = (raw.model || "").trim().toUpperCase();
  const year = raw.year || 2022;
  const color = cleanColor(raw.color);
  const { price, listPrice } = parsePriceNumber(raw.rawOfferPrice, raw.rawListPrice);
  const km = parseKmNumber(raw.rawKm);
  const bodyType = determineBodyType(model, brand);
  const fuel = determineFuel(model, brand);
  const transmission = determineTransmission(model);
  const location = cleanLocationName(raw.location);
  const status = determineStatus(raw.rawOfferPrice, raw.rawListPrice, raw.location);

  const formattedPlate = plate.length === 6 ? `${plate.slice(0, 4)} ${plate.slice(4)}` : plate;
  const slug = `${brand.toLowerCase()}-${model.toLowerCase()}-${year}-${plate.toLowerCase()}`
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const version = `${model} · ${color}`;

  let traction = "4x2";
  if (model.includes("4X4") || model.includes("4WD") || model.includes("AWD")) traction = "4x4";
  let doors = bodyType === "Hatchback" || bodyType === "SUV" || bodyType === "Pickup" ? 4 : 2;
  if (model.includes("DC") || model.includes("DOBLE") || model.includes("CREW")) doors = 4;
  if (model.includes("CABINA SIMPLE") || model.includes("CS")) doors = 2;

  let engine = "2.0L";
  if (bodyType === "Pickup") engine = "2.4L Turbo Diésel";
  if (model.includes("1.6")) engine = "1.6L";
  if (model.includes("1.5")) engine = "1.5L";
  if (model.includes("1.4")) engine = "1.4L";
  if (model.includes("1.2")) engine = "1.2L";
  if (model.includes("2.5")) engine = "2.5L Turbo";
  if (model.includes("5.3") || model.includes("TAHOE")) engine = "5.3L V8";
  if (model.includes("RAPTOR") || model.includes("F150")) engine = "3.5L V6 EcoBoost Twin-Turbo";

  let power = "140 HP";
  if (model.includes("RAPTOR")) power = "450 HP";
  if (model.includes("WRX")) power = "300 HP";
  if (model.includes("TAHOE")) power = "355 HP";
  if (bodyType === "Pickup") power = "150 HP";

  finalVehicles.push({
    slug,
    plate: formattedPlate,
    brand,
    model,
    version,
    year,
    price,
    listPrice,
    km,
    fuel,
    transmission,
    bodyType,
    location,
    image: "/images/placeholder-pending-car.svg",
    gallery: [],
    hasRealPhotos: false,
    supplier: raw.supplier || "RG Motors",
    techReview: raw.techReview || "Al día",
    circPermit: raw.circPermit || "Al día",
    status,
    engine,
    power,
    traction,
    doors,
    owners: 1,
    featured: price > 20000000 || model.includes("RAPTOR") || model.includes("HILUX"),
    highlights: [
      "Inspección mecánica rigurosa de 150 puntos",
      "Documentación y transferencia al día",
      "Financiamiento y retoma de vehículos en parte de pago"
    ]
  });
}

// Sort by featured and price
finalVehicles.sort((a, b) => {
  if (a.featured && !b.featured) return -1;
  if (!a.featured && b.featured) return 1;
  return b.price - a.price;
});

console.log(`Writing ${finalVehicles.length} vehicles to data/vehicles.json...`);
fs.writeFileSync("data/vehicles.json", JSON.stringify(finalVehicles, null, 2), "utf8");

console.log("Completed successfully!");
