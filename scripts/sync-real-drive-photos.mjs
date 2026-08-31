import https from "node:https";
import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import { createWriteStream, existsSync } from "node:fs";

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
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
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

async function main() {
  const driveData = JSON.parse(await readFile("scratch/drive_vehicles.json", "utf8"));
  const folders = driveData.drive1.folders; // Carpetas reales por Patente de "FOTOS RG Y UNIDADES CHILE"

  console.log(`Analizando ${folders.length} carpetas de unidades reales con fotos orgánicas en Drive...`);
  await mkdir("public/cars/real_stock", { recursive: true });

  const realVehicles = [];

  for (let i = 0; i < folders.length; i++) {
    const folder = folders[i];
    const plate = folder.name.trim();
    console.log(`[${i + 1}/${folders.length}] Explorando patente: ${plate} (${folder.id})...`);
    const photos = await extractPhotosFromFolder(folder.id);
    console.log(`   -> ${photos.length} fotos reales encontradas.`);

    if (photos.length > 0) {
      const slug = `auto-${plate.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      const coverDest = `public/cars/real_stock/${slug}-0.jpg`;

      // Descargamos las fotos
      try {
        await downloadDriveImage(photos[0].fileId, coverDest);
      } catch (e) {
        console.error(`Error descargando portada para ${plate}:`, e.message);
      }

      const gallery = [];
      for (let gi = 1; gi < Math.min(6, photos.length); gi++) {
        const galDest = `public/cars/real_stock/${slug}-${gi}.jpg`;
        try {
          await downloadDriveImage(photos[gi].fileId, galDest);
          gallery.push(`/cars/real_stock/${slug}-${gi}.jpg`);
        } catch (e) {}
      }

      // Verificamos que la portada exista y tenga tamaño real (> 20KB)
      let validCover = false;
      try {
        const st = await stat(coverDest);
        if (st.size > 20000) validCover = true;
      } catch {}

      if (validCover) {
        realVehicles.push({
          plate,
          slug,
          coverImage: `/cars/real_stock/${slug}-0.jpg`,
          gallery,
          photoCount: photos.length,
          folderId: folder.id,
        });
      }
    }
  }

  await writeFile("scratch/verified_real_stock.json", JSON.stringify(realVehicles, null, 2));
  console.log(`\n✅ ${realVehicles.length} vehículos verificados con fotos 100% reales y orgánicas.`);
}

main().catch(console.error);
