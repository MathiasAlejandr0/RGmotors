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
// downloadDriveImage function removed
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
      // Evitar duplicados si el HTML renderiza el mismo archivo varias veces
      if (!photos.some((p) => p.fileId === fileId)) {
        photos.push({
          fileName,
          fileId,
          downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
        });
      }
    }
    // Ordenamos alfabéticamente por el nombre de archivo original. 
    // Como las cámaras nombran secuencialmente (ej. IMG_001.jpg), la primera foto suele ser la frontal.
    return photos.sort((a, b) => a.fileName.localeCompare(b.fileName, undefined, { numeric: true }));
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

  // Only work with vehicles already in the database (from PDF)
  const existingList = await getVehicles();
  let newPhotos = 0;
  let synced = 0;

  for (const folder of allFolders) {
    const cleanFolderName = folder.name.toLowerCase().replace(/[^a-z0-9]/g, "");

    // RULE: Only match if an existing (PDF-verified) vehicle's plate exactly matches the folder name
    const existing = existingList.find((v) => {
      const vPlate = v.plate ? v.plate.toLowerCase().replace(/[^a-z0-9]/g, "") : "";
      return vPlate === cleanFolderName;
    });

    if (!existing) {
      // Folder does not correspond to any PDF-verified vehicle → SKIP completely
      continue;
    }

    const photos = await extractPhotosFromFolder(folder.id);
    if (photos.length === 0) continue;

    // Build gallery using direct Drive thumbnail URLs (no local downloads, no edits)
    const gallery = photos.map(p => `https://drive.google.com/thumbnail?id=${p.fileId}&sz=w1000`);
    newPhotos += photos.length;

    // Only update the gallery/image fields — preserve ALL other data from the PDF
    const vehicle: Vehicle = {
      ...existing,
      hasRealPhotos: true,
      gallery,
      image: gallery[0],
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
    message: `Sincronización completada: ${synced} vehículos con fotos vinculadas desde Google Drive.`,
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
