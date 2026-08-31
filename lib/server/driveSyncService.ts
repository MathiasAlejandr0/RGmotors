import https from "node:https";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createWriteStream, existsSync } from "node:fs";
import { join } from "node:path";
import * as XLSX from "xlsx";
import { Vehicle } from "@/lib/vehicles";
import { getVehicles, saveVehicle } from "./vehiclesStore";

export type SyncResult = {
  success: boolean;
  totalFolders: number;
  syncedVehicles: number;
  newPhotosDownloaded: number;
  message: string;
  vehicles: Vehicle[];
};

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
      res.on("error", reject);
    });
  });
}

function downloadDriveImage(fileId: string, dest: string): Promise<boolean> {
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

export async function extractPhotosFromFolder(folderId: string): Promise<{ fileName: string; fileId: string; downloadUrl: string }[]> {
  const url = `https://drive.google.com/drive/folders/${folderId}`;
  try {
    const html = await fetchUrl(url);
    const regex = /aria-label="([^"]+?\.(?:jpg|jpeg|png|webp|heic))\s+Image\s+Shared"[^>]*ssk='5:[^:]*:([a-zA-Z0-9_-]+)/gi;
    let m: RegExpExecArray | null;
    const photos: { fileName: string; fileId: string; downloadUrl: string }[] = [];
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
  } catch {
    return [];
  }
}

export async function extractFoldersFromDriveUrl(folderUrl: string): Promise<{ name: string; id: string }[]> {
  try {
    const html = await fetchUrl(folderUrl);
    const folders: { name: string; id: string }[] = [];
    const regex = /aria-label="([^"]+?)\s+(?:Shared folder|Google Drive Folder|folder)"[^>]*ssk='5:[^:]*:([a-zA-Z0-9_-]+)/gi;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(html)) !== null) {
      const name = m[1].trim();
      const id = m[2].trim().split("-")[0];
      if (!folders.some((f) => f.name === name)) {
        folders.push({ name, id });
      }
    }
    return folders;
  } catch {
    return [];
  }
}

export async function syncCatalogFromDriveFolders(folderUrls: string[]): Promise<SyncResult> {
  const allFolders: { name: string; id: string }[] = [];

  for (const url of folderUrls) {
    const folders = await extractFoldersFromDriveUrl(url);
    for (const f of folders) {
      if (!allFolders.some((existing) => existing.id === f.id || existing.name.toLowerCase() === f.name.toLowerCase())) {
        allFolders.push(f);
      }
    }
  }

  await mkdir("public/cars/real", { recursive: true });

  const existingList = await getVehicles();
  let newPhotos = 0;
  let synced = 0;

  for (const folder of allFolders) {
    const photos = await extractPhotosFromFolder(folder.id);
    if (photos.length === 0) continue;

    const slug = folder.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const coverDest = `public/cars/real/${slug}-cover.jpg`;
    if (!existsSync(coverDest)) {
      try {
        await downloadDriveImage(photos[0].fileId, coverDest);
        newPhotos += 1;
      } catch {}
    }

    const gallery: string[] = [];
    for (let gi = 1; gi < Math.min(6, photos.length); gi++) {
      const galDest = `public/cars/real/${slug}-gal-${gi}.jpg`;
      if (!existsSync(galDest)) {
        try {
          await downloadDriveImage(photos[gi].fileId, galDest);
          newPhotos += 1;
          gallery.push(`/cars/real/${slug}-gal-${gi}.jpg`);
        } catch {}
      } else {
        gallery.push(`/cars/real/${slug}-gal-${gi}.jpg`);
      }
    }

    const existing = existingList.find((v) => v.slug === slug || (v.highlights && v.highlights.includes(`Patente: ${folder.name}`)));

    const vehicle: Vehicle = {
      slug,
      brand: existing?.brand || folder.name.split(" ")[0] || "Vehículo",
      model: existing?.model || folder.name.split(" ").slice(1).join(" ") || folder.name,
      version: existing?.version || "Full Equipo",
      year: existing?.year || 2021,
      price: existing?.price || 12990000,
      km: existing?.km || 45000,
      fuel: existing?.fuel || "Bencina",
      transmission: existing?.transmission || "Automática",
      bodyType: existing?.bodyType || "SUV",
      location: "Puerto Montt, Los Lagos",
      image: `/cars/real/${slug}-cover.jpg`,
      engine: existing?.engine || "2.0L",
      power: existing?.power || "150 HP",
      traction: existing?.traction || "4x2",
      doors: existing?.doors || 5,
      owners: existing?.owners || 1,
      featured: existing?.featured ?? true,
      status: existing?.status || "Disponible",
      highlights: [
        `Patente: ${folder.name}`,
        "Inspección de 150 puntos aprobada",
        "Documentación y Autofact al día",
        "Garantía RG Motors de 6 meses",
      ],
      gallery: gallery.length > 0 ? gallery : undefined,
      spin: existing?.spin,
    };

    await saveVehicle(vehicle);
    synced += 1;
  }

  const updatedList = await getVehicles();

  return {
    success: true,
    totalFolders: allFolders.length,
    syncedVehicles: synced,
    newPhotosDownloaded: newPhotos,
    message: `Sincronización completada: ${synced} vehículos sincronizados desde Google Drive.`,
    vehicles: updatedList,
  };
}

export async function parseExcelStockBuffer(buffer: Buffer): Promise<any[]> {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: any[] = XLSX.utils.sheet_to_json(sheet);
  return rows;
}
