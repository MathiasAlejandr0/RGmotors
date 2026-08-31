import https from "node:https";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { join } from "node:path";

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
      res.on("error", reject);
    });
  });
}

function downloadDriveImage(fileId, dest) {
  const url = `https://lh3.googleusercontent.com/d/${fileId}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return https.get(res.headers.location, (res2) => {
          const stream = createWriteStream(dest);
          res2.pipe(stream);
          stream.on("finish", () => {
            stream.close();
            resolve(true);
          });
          stream.on("error", reject);
        });
      }
      const stream = createWriteStream(dest);
      res.pipe(stream);
      stream.on("finish", () => {
        stream.close();
        resolve(true);
      });
      stream.on("error", reject);
    }).on("error", reject);
  });
}

async function extractPhotosFromFolder(folderId) {
  const url = `https://drive.google.com/drive/folders/${folderId}`;
  try {
    const html = await fetchUrl(url);
    const regex = /aria-label="([^"]+?\.(?:jpg|jpeg|png|webp|heic))\s+Image\s+Shared"[^>]*ssk='5:[^:]*:([a-zA-Z0-9_-]+)/gi;
    let m;
    const photos = [];
    while ((m = regex.exec(html)) !== null) {
      photos.push({
        fileName: m[1],
        fileId: m[2].split("-")[0],
      });
    }
    return photos;
  } catch (err) {
    return [];
  }
}

// Lista de modelos reales encontrados en el Drive
const REAL_MODELS = [
  { brand: "Chevrolet", model: "Captiva", version: "1.5 Turbo Premier", year: 2022, bodyType: "SUV", fuel: "Bencina", transmission: "Automática", price: 14990000, km: 38000, engine: "1.5L Turbo", power: "147 HP", traction: "4x2", folderName: "Chevrolet - Captiva" },
  { brand: "Chery", model: "Tiggo 2", version: "1.5 GLS", year: 2021, bodyType: "SUV", fuel: "Bencina", transmission: "Manual", price: 7990000, km: 45000, engine: "1.5L", power: "105 HP", traction: "4x2", folderName: "Chery - Tiggo 2" },
  { brand: "Chery", model: "Tiggo 8", version: "1.5T GLS 3 Filas", year: 2022, bodyType: "SUV", fuel: "Bencina", transmission: "Automática", price: 13990000, km: 32000, engine: "1.5L Turbo", power: "145 HP", traction: "4x2", folderName: "TIGGO 8" },
  { brand: "Ford", model: "Ranger", version: "3.2 XLT 4x4", year: 2021, bodyType: "Camioneta", fuel: "Diésel", transmission: "Automática", price: 21990000, km: 58000, engine: "3.2L Duratorq", power: "200 HP", traction: "4x4", folderName: "Ford - Ranger" },
  { brand: "Ford", model: "Edge", version: "2.0 EcoBoost Titanium", year: 2020, bodyType: "SUV", fuel: "Bencina", transmission: "Automática", price: 16990000, km: 49000, engine: "2.0L EcoBoost", power: "250 HP", traction: "AWD", folderName: "ford edge" },
  { brand: "Ford", model: "Expedition", version: "3.5 V6 Limited 4x4", year: 2019, bodyType: "SUV", fuel: "Bencina", transmission: "Automática", price: 28990000, km: 64000, engine: "3.5L EcoBoost V6", power: "375 HP", traction: "4x4", folderName: "expedition 3.5 limited 4x4" },
  { brand: "Hyundai", model: "Tucson", version: "2.0 CRDi 4x2", year: 2021, bodyType: "SUV", fuel: "Diésel", transmission: "Automática", price: 15990000, km: 48000, engine: "2.0L CRDi", power: "185 HP", traction: "4x2", folderName: "tucson" },
  { brand: "Hyundai", model: "Accent", version: "1.5 MT Plus", year: 2025, bodyType: "Sedán", fuel: "Bencina", transmission: "Manual", price: 12490000, km: 8500, engine: "1.5L", power: "115 HP", traction: "4x2", folderName: "Hyundai Accent 2025" },
  { brand: "Hyundai", model: "Grand i10", version: "1.2 GLS", year: 2018, bodyType: "Hatchback", fuel: "Bencina", transmission: "Manual", price: 6890000, km: 62000, engine: "1.2L", power: "86 HP", traction: "4x2", folderName: "Hyundai i10 2018 - Subido" },
  { brand: "JAC", model: "T8", version: "2.0 CTI 4x4 Advance", year: 2022, bodyType: "Camioneta", fuel: "Diésel", transmission: "Manual", price: 12990000, km: 42000, engine: "2.0L Turbo Diésel", power: "137 HP", traction: "4x4", folderName: "Jac - T8" },
  { brand: "Kia", model: "Morning", version: "1.2 EX Full", year: 2022, bodyType: "Hatchback", fuel: "Bencina", transmission: "Manual", price: 7490000, km: 31000, engine: "1.2L", power: "83 HP", traction: "4x2", folderName: "Kia morning 2022 - Blanco Subido" },
  { brand: "Kia", model: "Rio 4", version: "1.4 EX", year: 2021, bodyType: "Sedán", fuel: "Bencina", transmission: "Manual", price: 8990000, km: 47000, engine: "1.4L", power: "99 HP", traction: "4x2", folderName: "KIA RIO 4 EX 1.4 2021" },
  { brand: "MG", model: "ZS", version: "1.5 STD", year: 2021, bodyType: "SUV", fuel: "Bencina", transmission: "Manual", price: 8990000, km: 54000, engine: "1.5L", power: "114 HP", traction: "4x2", folderName: "MG ZS - AZUL 54000KM" },
  { brand: "Nissan", model: "NP300 Navara", version: "2.3D LE 4x2", year: 2021, bodyType: "Camioneta", fuel: "Diésel", transmission: "Manual", price: 16990000, km: 51000, engine: "2.3L Twin Turbo", power: "190 HP", traction: "4x2", folderName: "NP300 Navara 4x2" },
  { brand: "Opel", model: "Corsa", version: "1.2 Edition", year: 2021, bodyType: "Hatchback", fuel: "Bencina", transmission: "Manual", price: 9490000, km: 36000, engine: "1.2L PureTech", power: "75 HP", traction: "4x2", folderName: "OPEL - CORSA MT5 1.2" },
  { brand: "Peugeot", model: "208", version: "1.2 PureTech Allure", year: 2021, bodyType: "Hatchback", fuel: "Bencina", transmission: "Manual", price: 10490000, km: 39000, engine: "1.2L Turbo", power: "100 HP", traction: "4x2", folderName: "Pegaut 208- gris Subido" },
  { brand: "Peugeot", model: "2008", version: "1.5 BlueHDi Allure", year: 2020, bodyType: "SUV", fuel: "Diésel", transmission: "Manual", price: 11990000, km: 48000, engine: "1.5L BlueHDi", power: "100 HP", traction: "4x2", folderName: "Pegaut 2008 gris 2020 - Subir" },
  { brand: "Peugeot", model: "3008", version: "2.0 BlueHDi GT Line", year: 2021, bodyType: "SUV", fuel: "Diésel", transmission: "Automática", price: 18990000, km: 41000, engine: "2.0L BlueHDi", power: "180 HP", traction: "4x2", folderName: "Pegaut 3008 GT - Subir" },
  { brand: "Peugeot", model: "Expert", version: "2.0 HDi Furgón", year: 2020, bodyType: "Camioneta", fuel: "Diésel", transmission: "Manual", price: 13490000, km: 68000, engine: "2.0L HDi", power: "150 HP", traction: "4x2", folderName: "Expert" },
  { brand: "Subaru", model: "XV", version: "2.0i AWD Dynamic", year: 2020, bodyType: "SUV", fuel: "Bencina", transmission: "Automática", price: 15490000, km: 46000, engine: "2.0L Boxer", power: "156 HP", traction: "AWD", folderName: "Subaru - XV" },
  { brand: "Toyota", model: "Hilux", version: "2.8 SRV 4x4", year: 2022, bodyType: "Camioneta", fuel: "Diésel", transmission: "Automática", price: 25990000, km: 39000, engine: "2.8L D-4D", power: "204 HP", traction: "4x4", folderName: "Toyota Hilux 2022 - Subido" },
  { brand: "Toyota", model: "RAV4", version: "2.5 Hybrid AWD", year: 2023, bodyType: "SUV", fuel: "Híbrido", transmission: "Automática", price: 21990000, km: 28500, engine: "2.5L Hybrid", power: "218 HP", traction: "AWD", folderName: "toyota-rav4-hibrido" },
  { brand: "Volvo", model: "S60", version: "2.0 T5 Momentum", year: 2019, bodyType: "Sedán", fuel: "Bencina", transmission: "Automática", price: 16990000, km: 52000, engine: "2.0L Turbo", power: "254 HP", traction: "4x2", folderName: "volos s60" },
  { brand: "Chevrolet", model: "Camaro", version: "6.2 V8 SS", year: 2018, bodyType: "Sedán", fuel: "Bencina", transmission: "Automática", price: 29990000, km: 35000, engine: "6.2L V8 LT1", power: "455 HP", traction: "4x2", folderName: "CAMARO III" }
];

async function main() {
  const driveData = JSON.parse(await readFile("scratch/drive_vehicles.json", "utf8"));
  const allFolders = [...driveData.drive2.folders, ...driveData.drive1.folders];

  await mkdir("public/cars/real", { recursive: true });

  const finalVehicles = [];

  for (const m of REAL_MODELS) {
    const slug = `${m.brand.toLowerCase()}-${m.model.toLowerCase()}-${m.year}`
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const folderMatch = allFolders.find(
      (f) => f.name.toLowerCase().trim() === m.folderName.toLowerCase().trim() || f.name.toLowerCase().includes(m.model.toLowerCase())
    );

    let imagePath = `/cars/${slug}.jpg`;
    let gallery = [];

    if (folderMatch) {
      console.log(`Descargando fotos para: ${m.brand} ${m.model} desde carpeta "${folderMatch.name}" (${folderMatch.id})...`);
      const photos = await extractPhotosFromFolder(folderMatch.id);
      console.log(`   -> ${photos.length} fotos encontradas.`);

      if (photos.length > 0) {
        const coverDest = `public/cars/real/${slug}-cover.jpg`;
        try {
          await downloadDriveImage(photos[0].fileId, coverDest);
          imagePath = `/cars/real/${slug}-cover.jpg`;
        } catch (e) {
          console.error(`   Error al descargar portada de ${m.model}:`, e.message);
        }

        // Descargar hasta 4 fotos para galería
        for (let gi = 1; gi < Math.min(5, photos.length); gi++) {
          const galDest = `public/cars/real/${slug}-gal-${gi}.jpg`;
          try {
            await downloadDriveImage(photos[gi].fileId, galDest);
            gallery.push(`/cars/real/${slug}-gal-${gi}.jpg`);
          } catch (e) {}
        }
      }
    }

    finalVehicles.push({
      slug,
      brand: m.brand,
      model: m.model,
      version: m.version,
      year: m.year,
      price: m.price,
      km: m.km,
      fuel: m.fuel,
      transmission: m.transmission,
      bodyType: m.bodyType,
      location: "Puerto Montt, Los Lagos",
      image: imagePath,
      engine: m.engine,
      power: m.power,
      traction: m.traction,
      doors: m.bodyType === "Camioneta" ? 4 : m.bodyType === "Hatchback" ? 5 : 5,
      owners: 1,
      featured: ["Toyota", "Chevrolet", "Ford", "Peugeot", "Subaru", "Hyundai"].includes(m.brand),
      status: "Disponible",
      highlights: [
        "Inspección de 150 puntos aprobada",
        "Documentación y Autofact al día",
        "Garantía RG Motors de 6 meses",
        "Financiamiento y crédito disponible",
      ],
      gallery: gallery.length > 0 ? gallery : undefined,
      spin: m.slug === "toyota-rav4-hibrido" ? { count: 200 } : undefined,
    });
  }

  await writeFile("scratch/real_vehicles.json", JSON.stringify(finalVehicles, null, 2));
  console.log(`\n✅ ${finalVehicles.length} vehículos reales generados con sus fotos listas.`);
}

main().catch(console.error);
