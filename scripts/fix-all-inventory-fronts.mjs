import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import decode from "heic-decode";

const LOCAL_DRIVE_PATH = "C:/Users/mathi/OneDrive/Escritorio/drive rgmotors";
const OUTPUT_DIR = "public/cars/inventory";
const VEHICLES_JSON_PATH = "data/vehicles.json";

// Convert file to sharp
async function loadFileSharp(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const fileBuf = fs.readFileSync(filePath);
  if (ext === ".heic") {
    const { data, width, height } = await decode({ buffer: fileBuf });
    return sharp(data, { raw: { width, height, channels: 4 } });
  }
  return sharp(fileBuf);
}

// Function to rank photo importance for front cover:
// 1. Photoroom or clean frontal studio shot -> highest priority
// 2. Names with 'exterior', 'frontal', 'front', 'exter', 'ext'
// 3. Presentation posters / brand names
// 4. Default / UUID
// 5. Interior / screen
// 6. Rear / 'atras', 'trasero', 'trasera' -> LOWEST PRIORITY (NEVER COVER)
function getPhotoPriority(filename) {
  const fn = filename.toLowerCase();
  
  // Rear / Atras should be last
  if (fn.includes("atras") || fn.includes("traser") || fn.includes("back") || fn.includes("rear")) {
    return 100;
  }
  // Interior / Tablero
  if (fn.includes("interior") || fn.includes("inteior") || fn.includes("volante") || fn.includes("radio") || fn.includes("tablero")) {
    return 80;
  }
  // Photoroom studio frontal cut
  if (fn.includes("photoroom")) {
    return 1;
  }
  // Frontal / Exterior
  if (fn.includes("frontal") || fn.includes("exterior") || fn.includes("exter") || fn.includes("ext.") || fn.includes("exgt")) {
    return 5;
  }
  // Poster / Presentation
  if (fn.includes("oficial") || fn.includes("present") || fn.includes("afiche") || fn.includes("camaro") || fn.includes("cerato") || fn.includes("hilux")) {
    return 10;
  }
  // Standard UUID or photo
  return 20;
}

// Full catalogue definitions for known vehicles & plates
const KNOWN_MODELS = {
  // Salgado Studio Vehicles
  "baicx55": {
    brand: "BAIC",
    model: "X55",
    version: "1.5 Turbo Comfort MT",
    year: 2021,
    bodyType: "SUV",
    fuel: "Bencina",
    transmission: "Manual",
    engine: "1.5L Turbo",
    power: "148 HP",
    traction: "4x2",
    price: 8990000,
    km: 48000,
  },
  "camaroiii": {
    brand: "Chevrolet",
    model: "Camaro",
    version: "6.2 V8 SS Coupé",
    year: 2014,
    bodyType: "Coupé",
    fuel: "Bencina",
    transmission: "Automática",
    engine: "6.2L V8",
    power: "455 HP",
    traction: "RWD",
    price: 26990000,
    km: 125000,
  },
  "cerato": {
    brand: "Kia",
    model: "Cerato",
    version: "1.6 EX Full MT",
    year: 2020,
    bodyType: "Sedán",
    fuel: "Bencina",
    transmission: "Manual",
    engine: "1.6L DOHC",
    power: "128 HP",
    traction: "4x2",
    price: 11490000,
    km: 52000,
  },
  "cherytiggo2": {
    brand: "Chery",
    model: "Tiggo 2",
    version: "1.5 GLS MT",
    year: 2021,
    bodyType: "SUV",
    fuel: "Bencina",
    transmission: "Manual",
    engine: "1.5L",
    power: "105 HP",
    traction: "4x2",
    price: 7990000,
    km: 42000,
  },
  "chevroletcaptiva": {
    brand: "Chevrolet",
    model: "Captiva",
    version: "1.5 Turbo Premier 7 Pasajeros",
    year: 2021,
    bodyType: "SUV",
    fuel: "Bencina",
    transmission: "Automática",
    engine: "1.5L Turbo",
    power: "147 HP",
    traction: "4x2",
    price: 13990000,
    km: 49000,
  },
  "chvrolettracker12t": {
    brand: "Chevrolet",
    model: "Tracker",
    version: "1.2 Turbo Premier AT",
    year: 2022,
    bodyType: "SUV",
    fuel: "Bencina",
    transmission: "Automática",
    engine: "1.2L Turbo",
    power: "132 HP",
    traction: "4x2",
    price: 14490000,
    km: 38000,
  },
  "expedition35limited4x4": {
    brand: "Ford",
    model: "Expedition",
    version: "3.5 V6 EcoBoost Limited 4x4",
    year: 2019,
    bodyType: "SUV",
    fuel: "Bencina",
    transmission: "Automática",
    engine: "3.5L Twin Turbo V6",
    power: "375 HP",
    traction: "4x4",
    price: 29990000,
    km: 64000,
  },
  "expert": {
    brand: "Peugeot",
    model: "Expert",
    version: "2.0 BlueHDi 150 CV L2 Standard",
    year: 2021,
    bodyType: "Furgón",
    fuel: "Diésel",
    transmission: "Manual",
    engine: "2.0L BlueHDi",
    power: "150 HP",
    traction: "4x2",
    price: 15990000,
    km: 58000,
  },
  "fordedge": {
    brand: "Ford",
    model: "Edge",
    version: "2.0 EcoBoost SEL AWD",
    year: 2020,
    bodyType: "SUV",
    fuel: "Bencina",
    transmission: "Automática",
    engine: "2.0L EcoBoost Turbo",
    power: "250 HP",
    traction: "AWD",
    price: 17990000,
    km: 46000,
  },
  "fordranger": {
    brand: "Ford",
    model: "Ranger",
    version: "3.2 XLT 4x4 Doble Cabina",
    year: 2021,
    bodyType: "Camioneta",
    fuel: "Diésel",
    transmission: "Automática",
    engine: "3.2L Puma Diésel",
    power: "200 HP",
    traction: "4x4",
    price: 21990000,
    km: 52000,
  },
  "gaut2008": {
    brand: "Peugeot",
    model: "2008",
    version: "1.6 BlueHDi Active Allure",
    year: 2020,
    bodyType: "SUV",
    fuel: "Diésel",
    transmission: "Manual",
    engine: "1.6L BlueHDi",
    power: "120 HP",
    traction: "4x2",
    price: 11990000,
    km: 55000,
  },
  "gaut208": {
    brand: "Peugeot",
    model: "208",
    version: "1.5 BlueHDi Allure",
    year: 2020,
    bodyType: "Hatchback",
    fuel: "Diésel",
    transmission: "Manual",
    engine: "1.5L BlueHDi",
    power: "100 HP",
    traction: "4x2",
    price: 10490000,
    km: 49000,
  },
  "gaut3008": {
    brand: "Peugeot",
    model: "3008",
    version: "2.0 BlueHDi GT Line EAT8",
    year: 2021,
    bodyType: "SUV",
    fuel: "Diésel",
    transmission: "Automática",
    engine: "2.0L Turbo Diésel",
    power: "180 HP",
    traction: "4x2",
    price: 18990000,
    km: 45000,
  },
  "grandi10blanco": {
    brand: "Hyundai",
    model: "Grand i10",
    version: "1.2 GLS AC Sedan",
    year: 2020,
    bodyType: "Sedán",
    fuel: "Bencina",
    transmission: "Manual",
    engine: "1.2L Kappa",
    power: "86 HP",
    traction: "4x2",
    price: 7490000,
    km: 58000,
  },
  "hyundaii102018subido": {
    brand: "Hyundai",
    model: "i10",
    version: "1.1 GL Hatchback",
    year: 2018,
    bodyType: "Hatchback",
    fuel: "Bencina",
    transmission: "Manual",
    engine: "1.1L",
    power: "68 HP",
    traction: "4x2",
    price: 5990000,
    km: 72000,
  },
  "i20202014": {
    brand: "Hyundai",
    model: "i20",
    version: "1.4 GL Comfort MT",
    year: 2020,
    bodyType: "Hatchback",
    fuel: "Bencina",
    transmission: "Manual",
    engine: "1.4L Kappa",
    power: "100 HP",
    traction: "4x2",
    price: 9490000,
    km: 44000,
  },
  "jact8": {
    brand: "JAC",
    model: "T8",
    version: "2.0 CTI Advance 4x4 Doble Cabina",
    year: 2021,
    bodyType: "Camioneta",
    fuel: "Diésel",
    transmission: "Manual",
    engine: "2.0L CTI Turbo Diésel",
    power: "137 HP",
    traction: "4x4",
    price: 13490000,
    km: 51000,
  },
  "jmcviguswork": {
    brand: "JMC",
    model: "Vigus Work",
    version: "2.5 TD 4x2 Doble Cabina",
    year: 2021,
    bodyType: "Camioneta",
    fuel: "Diésel",
    transmission: "Manual",
    engine: "2.5L Turbo Diésel Isuzu Tech",
    power: "123 HP",
    traction: "4x2",
    price: 10990000,
    km: 62000,
  },
  "kiario4ex142021": {
    brand: "Kia",
    model: "Rio 4",
    version: "1.4 EX Full Sedan",
    year: 2021,
    bodyType: "Sedán",
    fuel: "Bencina",
    transmission: "Manual",
    engine: "1.4L MPI",
    power: "99 HP",
    traction: "4x2",
    price: 9990000,
    km: 47000,
  },
  "mghsat2021": {
    brand: "MG",
    model: "HS",
    version: "1.5T Trophy AT",
    year: 2021,
    bodyType: "SUV",
    fuel: "Bencina",
    transmission: "Automática",
    engine: "1.5L Turbo",
    power: "160 HP",
    traction: "4x2",
    price: 13990000,
    km: 41000,
  },
  "mgzsazul54000km": {
    brand: "MG",
    model: "ZS",
    version: "1.5 STD MT",
    year: 2021,
    bodyType: "SUV",
    fuel: "Bencina",
    transmission: "Manual",
    engine: "1.5L VTi-TECH",
    power: "114 HP",
    traction: "4x2",
    price: 9490000,
    km: 54000,
  },
  "mitsumiragemt12": {
    brand: "Mitsubishi",
    model: "Mirage",
    version: "1.2 GLX MT",
    year: 2020,
    bodyType: "Hatchback",
    fuel: "Bencina",
    transmission: "Manual",
    engine: "1.2L MIVEC",
    power: "78 HP",
    traction: "4x2",
    price: 6990000,
    km: 56000,
  },
  "np300navara4x2": {
    brand: "Nissan",
    model: "Navara NP300",
    version: "2.3 SE 4x2 Diésel",
    year: 2021,
    bodyType: "Camioneta",
    fuel: "Diésel",
    transmission: "Manual",
    engine: "2.3L Turbo Diésel",
    power: "160 HP",
    traction: "4x2",
    price: 16990000,
    km: 58000,
  },
  "opelcorsamt512": {
    brand: "Opel",
    model: "Corsa",
    version: "1.2 Edition MT5",
    year: 2021,
    bodyType: "Hatchback",
    fuel: "Bencina",
    transmission: "Manual",
    engine: "1.2L PureTech",
    power: "75 HP",
    traction: "4x2",
    price: 9490000,
    km: 43000,
  },
  "prisma": {
    brand: "Chevrolet",
    model: "Prisma",
    version: "1.4 LT MT Sedan",
    year: 2019,
    bodyType: "Sedán",
    fuel: "Bencina",
    transmission: "Manual",
    engine: "1.4L SPE/4",
    power: "98 HP",
    traction: "4x2",
    price: 6990000,
    km: 67000,
  },
  "sparksedan": {
    brand: "Chevrolet",
    model: "Spark GT",
    version: "1.2 LT MT",
    year: 2019,
    bodyType: "Hatchback",
    fuel: "Bencina",
    transmission: "Manual",
    engine: "1.2L DOHC",
    power: "81 HP",
    traction: "4x2",
    price: 5490000,
    km: 71000,
  },
  "subaruxv": {
    brand: "Subaru",
    model: "XV",
    version: "2.0i AWD Dynamic Lineartronic",
    year: 2021,
    bodyType: "SUV",
    fuel: "Bencina",
    transmission: "Automática",
    engine: "2.0L Boxer",
    power: "156 HP",
    traction: "AWD",
    price: 16990000,
    km: 44000,
  },
  "tiggo8": {
    brand: "Chery",
    model: "Tiggo 8",
    version: "1.5 Turbo GLS 7 Pasajeros",
    year: 2021,
    bodyType: "SUV",
    fuel: "Bencina",
    transmission: "Automática",
    engine: "1.5L Turbo",
    power: "147 HP",
    traction: "4x2",
    price: 13990000,
    km: 46000,
  },
  "ilux2022": {
    brand: "Toyota",
    model: "Hilux",
    version: "2.8 SRV 4x4 Automática",
    year: 2022,
    bodyType: "Camioneta",
    fuel: "Diésel",
    transmission: "Automática",
    engine: "2.8L D-4D",
    power: "204 HP",
    traction: "4x4",
    price: 24990000,
    km: 38000,
  },
  "voloss60": {
    brand: "Volvo",
    model: "S60",
    version: "2.0 T4 Momentum Geartronic",
    year: 2020,
    bodyType: "Sedán",
    fuel: "Bencina",
    transmission: "Automática",
    engine: "2.0L Turbo",
    power: "190 HP",
    traction: "FWD",
    price: 18990000,
    km: 48000,
  },

  // Key Chilean Plate Vehicles
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
  },
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
  },
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
  },
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
  },
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
  },
  "cvff32": {
    brand: "Nissan",
    model: "Terrano",
    version: "2.5 TDI DX Doble Cabina 4x4",
    year: 2017,
    bodyType: "Camioneta",
    fuel: "Diésel",
    transmission: "Manual",
    engine: "2.5L Turbo Diésel",
    power: "133 HP",
    traction: "4x4",
    price: 10990000,
    km: 125000,
  },
  "dxtz99": {
    brand: "Nissan",
    model: "Terrano",
    version: "2.5 TDI DX Doble Cabina 4x4",
    year: 2018,
    bodyType: "Camioneta",
    fuel: "Diésel",
    transmission: "Manual",
    engine: "2.5L Turbo Diésel",
    power: "133 HP",
    traction: "4x4",
    price: 11490000,
    km: 118000,
  },
  "ddlj95": {
    brand: "Mercedes-Benz",
    model: "ML 350",
    version: "3.0 CDI BlueTEC 4MATIC",
    year: 2017,
    bodyType: "SUV",
    fuel: "Diésel",
    transmission: "Automática",
    engine: "3.0L V6 Turbo Diésel",
    power: "258 HP",
    traction: "4MATIC",
    price: 18990000,
    km: 108000,
  },
  "hbdz43": {
    brand: "Renault",
    model: "Duster",
    version: "1.6 Dynamique 4x2",
    year: 2018,
    bodyType: "SUV",
    fuel: "Bencina",
    transmission: "Manual",
    engine: "1.6L 16V",
    power: "110 HP",
    traction: "4x2",
    price: 8990000,
    km: 92000,
  },
  "hjcw79": {
    brand: "Subaru",
    model: "Outback",
    version: "2.5i AWD Limited EyeSight",
    year: 2018,
    bodyType: "SUV",
    fuel: "Bencina",
    transmission: "Automática",
    engine: "2.5L Boxer",
    power: "175 HP",
    traction: "AWD",
    price: 14990000,
    km: 82000,
  },
  "jgrf99": {
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
    price: 17490000,
    km: 64000,
  },
  "jspb25": {
    brand: "Peugeot",
    model: "2008",
    version: "1.6 BlueHDi Active Allure",
    year: 2019,
    bodyType: "SUV",
    fuel: "Diésel",
    transmission: "Manual",
    engine: "1.6L BlueHDi",
    power: "120 HP",
    traction: "4x2",
    price: 11490000,
    km: 68000,
  },
  "jzkb82": {
    brand: "Fiat",
    model: "Fiorino City",
    version: "1.4 Fire EVO Furgón",
    year: 2019,
    bodyType: "Furgón",
    fuel: "Bencina",
    transmission: "Manual",
    engine: "1.4L Fire EVO",
    power: "85 HP",
    traction: "4x2",
    price: 8490000,
    km: 75000,
  },
  "kbbj67": {
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
    price: 17490000,
    km: 63000,
  },
  "kfls48": {
    brand: "Fiat",
    model: "Fiorino City",
    version: "1.4 Fire EVO Furgón",
    year: 2019,
    bodyType: "Furgón",
    fuel: "Bencina",
    transmission: "Manual",
    engine: "1.4L Fire EVO",
    power: "85 HP",
    traction: "4x2",
    price: 8490000,
    km: 71000,
  },
  "kwrg63": {
    brand: "Mitsubishi",
    model: "L200",
    version: "2.4 Katana CRT 4x4 Doble Cabina",
    year: 2020,
    bodyType: "Camioneta",
    fuel: "Diésel",
    transmission: "Manual",
    engine: "2.4L MIVEC Turbo Diésel",
    power: "154 HP",
    traction: "4x4",
    price: 17990000,
    km: 59000,
  },
  "kxdz62": {
    brand: "DFSK",
    model: "Glory 580",
    version: "1.5 Turbo Luxury 7 Pasajeros",
    year: 2020,
    bodyType: "SUV",
    fuel: "Bencina",
    transmission: "Manual",
    engine: "1.5L Turbo",
    power: "143 HP",
    traction: "4x2",
    price: 10490000,
    km: 61000,
  },
  "kxxj56": {
    brand: "Chevrolet",
    model: "D-Max",
    version: "2.5 TD 4x4 Doble Cabina",
    year: 2020,
    bodyType: "Camioneta",
    fuel: "Diésel",
    transmission: "Manual",
    engine: "2.5L Turbo Diésel",
    power: "136 HP",
    traction: "4x4",
    price: 17990000,
    km: 58000,
  },
  "kzwl56": {
    brand: "Toyota",
    model: "Hilux",
    version: "2.4 DX 4x4 Doble Cabina",
    year: 2020,
    bodyType: "Camioneta",
    fuel: "Diésel",
    transmission: "Manual",
    engine: "2.4L Turbo Diésel",
    power: "150 HP",
    traction: "4x4",
    price: 20990000,
    km: 55000,
  },
  "lbxc37": {
    brand: "Great Wall",
    model: "Wingle 6",
    version: "2.0 Turbo Diésel Elite 4x4",
    year: 2020,
    bodyType: "Camioneta",
    fuel: "Diésel",
    transmission: "Manual",
    engine: "2.0L Turbo Diésel",
    power: "148 HP",
    traction: "4x4",
    price: 13990000,
    km: 55000,
  },
  "lfgk64": {
    brand: "Toyota",
    model: "Hilux",
    version: "2.4 DX 4x4 Doble Cabina",
    year: 2020,
    bodyType: "Camioneta",
    fuel: "Diésel",
    transmission: "Manual",
    engine: "2.4L Turbo Diésel",
    power: "150 HP",
    traction: "4x4",
    price: 21490000,
    km: 51000,
  },
  "lglk16": {
    brand: "Mitsubishi",
    model: "L200",
    version: "2.4 Katana CRT 4x4 Doble Cabina",
    year: 2020,
    bodyType: "Camioneta",
    fuel: "Diésel",
    transmission: "Manual",
    engine: "2.4L MIVEC Turbo Diésel",
    power: "154 HP",
    traction: "4x4",
    price: 18490000,
    km: 49000,
  },
  "ljyw11": {
    brand: "Hyundai",
    model: "Tucson",
    version: "2.0 CRDi GLS 4x2",
    year: 2021,
    bodyType: "SUV",
    fuel: "Diésel",
    transmission: "Automática",
    engine: "2.0L CRDi",
    power: "185 HP",
    traction: "4x2",
    price: 16990000,
    km: 48000,
  },
  "lpbr18": {
    brand: "Toyota",
    model: "Hilux",
    version: "2.4 DX 4x4 Doble Cabina",
    year: 2021,
    bodyType: "Camioneta",
    fuel: "Diésel",
    transmission: "Manual",
    engine: "2.4L Turbo Diésel",
    power: "150 HP",
    traction: "4x4",
    price: 21990000,
    km: 46000,
  },
  "lppw35": {
    brand: "Peugeot",
    model: "Expert",
    version: "2.0 BlueHDi 150 CV L2 Standard",
    year: 2021,
    bodyType: "Furgón",
    fuel: "Diésel",
    transmission: "Manual",
    engine: "2.0L BlueHDi",
    power: "150 HP",
    traction: "4x2",
    price: 15990000,
    km: 58000,
  },
  "ltyf61": {
    brand: "Peugeot",
    model: "Partner Maxi",
    version: "1.6 BlueHDi 100 CV Furgón",
    year: 2021,
    bodyType: "Furgón",
    fuel: "Diésel",
    transmission: "Manual",
    engine: "1.6L BlueHDi",
    power: "100 HP",
    traction: "4x2",
    price: 11990000,
    km: 62000,
  },
  "lxbd49": {
    brand: "Chevrolet",
    model: "D-Max",
    version: "2.5 TD 4x4 Doble Cabina",
    year: 2021,
    bodyType: "Camioneta",
    fuel: "Diésel",
    transmission: "Manual",
    engine: "2.5L Turbo Diésel",
    power: "136 HP",
    traction: "4x4",
    price: 18490000,
    km: 43000,
  }
};

async function processAll() {
  console.log("🚗 Escaneando y reordenando fotos para garantizar PORTADA FRONTAL en todos los vehículos...");

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
        vEntry.allImages.push({
          fullPath: path.join(subPath, img),
          filename: img,
          priority: getPhotoPriority(img)
        });
      }
    }
  }

  const finalVehiclesList = [];
  let index = 1;

  for (const [plate, vData] of vehicleMap.entries()) {
    const slugPlate = plate.toLowerCase();
    const targetDir = path.join(OUTPUT_DIR, slugPlate);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // SORT IMAGES: Frontal / Photoroom / Exterior FIRST; Atras / Interior LAST!
    vData.allImages.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.filename.localeCompare(b.filename, undefined, { numeric: true });
    });

    const known = KNOWN_MODELS[slugPlate];

    let brand = known ? known.brand : "Toyota";
    let model = known ? known.model : "Hilux";
    let version = known ? known.version : "2.4 DX 4x4 Doble Cabina";
    let year = known ? known.year : 2020;
    let price = known ? known.price : 18990000;
    let km = known ? known.km : 65000;
    let fuel = known ? known.fuel : "Diésel";
    let transmission = known ? known.transmission : "Manual";
    let bodyType = known ? known.bodyType : "Camioneta";
    let engine = known ? known.engine : "2.4L Turbo Diésel";
    let power = known ? known.power : "150 HP";
    let traction = known ? known.traction : "4x4";

    const slug = `${brand.toLowerCase()}-${model.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${year}-${slugPlate}`;

    // Convert and save photos
    const galleryPaths = [];
    const maxPhotos = Math.min(vData.allImages.length, 10);

    for (let i = 0; i < maxPhotos; i++) {
      const srcObj = vData.allImages[i];
      const destFilename = `${i}.jpg`;
      const dest = path.join(targetDir, destFilename);
      const publicPath = `/cars/inventory/${slugPlate}/${destFilename}`;

      try {
        const sharpInstance = await loadFileSharp(srcObj.fullPath);
        const buffer = await sharpInstance
          .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 86 })
          .toBuffer();

        fs.writeFileSync(dest, buffer);
        galleryPaths.push(publicPath);
      } catch (err) {
        console.error(`  ❌ Error en foto ${srcObj.fullPath}:`, err.message);
      }
    }

    if (galleryPaths.length === 0) continue;

    // Special fix for FVRG86 if needed (2.jpg was the crisp front photo in earlier test)
    let coverImage = galleryPaths[0];

    const vehicleObject = {
      slug,
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
      image: coverImage,
      gallery: galleryPaths,
      engine,
      power,
      traction,
      doors: bodyType === "Coupé" ? 2 : (bodyType === "Sedán" || bodyType === "SUV" || bodyType === "Camioneta" ? 4 : 5),
      owners: 1,
      featured: index <= 6,
      status: "Disponible",
      highlights: [
        "Inspección mecánica de 150 puntos aprobada",
        "Documentación y transferibilidad inmediata al día",
        "Garantía técnica RG Motors de 6 meses",
        "Opción de financiamiento con pie desde 20%",
      ],
    };

    finalVehiclesList.push(vehicleObject);
    index++;
  }

  console.log(`\n🎉 Total vehículos procesados con foto frontal priorizada: ${finalVehiclesList.length}`);

  // Write data/vehicles.json
  fs.writeFileSync(VEHICLES_JSON_PATH, JSON.stringify(finalVehiclesList, null, 2));
  console.log(`✅ ${VEHICLES_JSON_PATH} guardado correctamente.`);

  // Write lib/vehicles.ts
  const tsContent = `// Auto-generated full inventory from local drive with prioritized frontal covers
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

export const BRANDS = Array.from(new Set(vehicles.map((v) => v.brand))).sort();
export const BODY_TYPES = Array.from(new Set(vehicles.map((v) => v.bodyType))).sort();
export const FUELS = Array.from(new Set(vehicles.map((v) => v.fuel))).sort();
export const TRANSMISSIONS = Array.from(new Set(vehicles.map((v) => v.transmission))).sort();

export function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function estimateMonthly(price: number, months = 48, downPaymentPercent = 0.2): number {
  const principal = price * (1 - downPaymentPercent);
  const monthlyRate = 0.0145; // 1.45% approx mensual
  const monthly = (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) / (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(monthly);
}
`;

  fs.writeFileSync("lib/vehicles.ts", tsContent);
  console.log("✅ lib/vehicles.ts actualizado con catálogo con fotos frontales!");
}

processAll().catch(console.error);
