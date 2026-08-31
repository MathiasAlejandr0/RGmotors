import https from "node:https";
import http from "node:http";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync, createWriteStream } from "node:fs";
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

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 303 || res.statusCode === 307) {
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
      const fileId = m[2].split("-")[0];
      photos.push({
        fileName,
        fileId,
        downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      });
    }
    return photos;
  } catch (err) {
    console.error(`Error fetching folder ${folderId}:`, err.message);
    return [];
  }
}

async function main() {
  const driveData = JSON.parse(await readFile("scratch/drive_vehicles.json", "utf8"));
  const allFolders = [...driveData.drive2.folders, ...driveData.drive1.folders];

  console.log(`Iniciando escaneo de ${allFolders.length} carpetas de vehículos en Drive...`);
  await mkdir("public/cars/inventory", { recursive: true });

  const inventory = [];

  for (let i = 0; i < Math.min(25, allFolders.length); i++) {
    const folder = allFolders[i];
    console.log(`[${i + 1}/${allFolders.length}] Escaneando: ${folder.name} (${folder.id})...`);
    const photos = await extractPhotosFromFolder(folder.id);
    console.log(`   -> ${photos.length} fotos encontradas.`);

    if (photos.length > 0) {
      // Descargar la primera foto como portada
      const slug = folder.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      
      const coverPhotoPath = `public/cars/inventory/${slug}-cover.jpg`;
      try {
        console.log(`   Descargando portada: ${photos[0].fileName}...`);
        await downloadFile(photos[0].downloadUrl, coverPhotoPath);
      } catch (err) {
        console.log(`   Error al descargar portada:`, err.message);
      }

      inventory.push({
        name: folder.name,
        slug,
        folderId: folder.id,
        photoCount: photos.length,
        coverImage: `/cars/inventory/${slug}-cover.jpg`,
        photos: photos.map((p) => ({
          fileName: p.fileName,
          id: p.fileId,
          url: `https://drive.google.com/uc?export=download&id=${p.fileId}`,
        })),
      });
    }
  }

  await writeFile("scratch/scanned_inventory.json", JSON.stringify(inventory, null, 2));
  console.log(`\n✅ Escaneo completado. ${inventory.length} vehículos con fotos listos.`);
}

main().catch(console.error);
