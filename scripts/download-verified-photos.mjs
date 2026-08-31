import https from "node:https";
import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import { createWriteStream, existsSync, unlinkSync } from "node:fs";

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
      res.on("error", reject);
    });
  });
}

function downloadGoogleDriveImage(fileId, dest) {
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
      const fileName = m[1];
      const fileId = m[2].replace(/-[0-9]+-[0-9]+$/, "").replace(/-[0-9]+$/, "");
      photos.push({ fileName, fileId });
    }
    return photos;
  } catch (err) {
    return [];
  }
}

async function main() {
  const driveData = JSON.parse(await readFile("scratch/drive_vehicles.json", "utf8"));
  const folders = driveData.drive1.folders;

  console.log(`Iniciando descarga limpia de fotos reales de ${folders.length} vehículos...`);
  await mkdir("public/cars/real_stock", { recursive: true });

  const validVehicles = [];

  for (let i = 0; i < folders.length; i++) {
    const folder = folders[i];
    const plate = folder.name.trim().replace(/\s+Salgado/i, "").replace(/\s+RG MOTORS/i, "");
    const cleanId = folder.id.replace(/-[0-9]+-[0-9]+$/, "").replace(/-[0-9]+$/, "");
    console.log(`[${i + 1}/${folders.length}] ${plate} (${cleanId})...`);

    const photos = await extractPhotosFromFolder(cleanId);
    console.log(`   -> ${photos.length} fotos reales encontradas.`);

    const validPhotoPaths = [];
    const slug = `rg-${plate.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

    for (let pi = 0; pi < photos.length; pi++) {
      const dest = `public/cars/real_stock/${slug}-${pi}.jpg`;
      try {
        await downloadGoogleDriveImage(photos[pi].fileId, dest);
        const st = await stat(dest);
        if (st.size > 25000) {
          validPhotoPaths.push(`/cars/real_stock/${slug}-${pi}.jpg`);
        } else {
          try { unlinkSync(dest); } catch {}
        }
      } catch {}
    }

    if (validPhotoPaths.length > 0) {
      console.log(`   ✅ ${validPhotoPaths.length} fotos válidas descargadas.`);
      validVehicles.push({
        plate,
        slug,
        cover: validPhotoPaths[0],
        gallery: validPhotoPaths.slice(1),
        photoCount: validPhotoPaths.length,
      });
    }
  }

  await writeFile("scratch/fully_verified_stock.json", JSON.stringify(validVehicles, null, 2));
  console.log(`\n🎉 PROCESO COMPLETADO: ${validVehicles.length} autos con fotos 100% reales verificadas.`);
}

main().catch(console.error);
