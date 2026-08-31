import https from "node:https";
import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import { createWriteStream, existsSync } from "node:fs";

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
  const folders2 = driveData.drive2.folders;

  console.log(`Explorando ${folders2.length} carpetas de Drive 2...`);
  await mkdir("public/cars/hero_trucks", { recursive: true });

  for (const f of folders2) {
    const cleanId = f.id.replace(/-[0-9]+-[0-9]+$/, "").replace(/-[0-9]+$/, "");
    console.log(`Explorando "${f.name}" (${cleanId})...`);
    const photos = await extractPhotosFromFolder(cleanId);
    console.log(`   -> ${photos.length} fotos:`, photos.map((p) => p.fileName));

    const slug = f.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    for (let i = 0; i < photos.length; i++) {
      const dest = `public/cars/hero_trucks/${slug}-${i}.jpg`;
      try {
        await downloadGoogleDriveImage(photos[i].fileId, dest);
      } catch (e) {}
    }
  }

  console.log("✅ Descarga completada.");
}

main().catch(console.error);
