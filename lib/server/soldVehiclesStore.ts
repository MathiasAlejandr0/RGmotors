import { readJson, writeJson } from "./db";
import { Vehicle } from "@/lib/vehicles";
import { unlink, readdir, rmdir } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";

export interface SoldVehicleRecord {
  id: string;
  slug: string;
  plate: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  salePrice: number;
  listPrice?: number;
  km: number;
  fuel: string;
  transmission: string;
  bodyType: string;
  location: string;
  supplier?: string;
  soldAt: string;
  status: "Vendido";
  notes?: string;
}

const SOLD_FILENAME = "sold_vehicles.json";

export async function getSoldVehicles(): Promise<SoldVehicleRecord[]> {
  const records = await readJson<SoldVehicleRecord[]>(SOLD_FILENAME, []);
  return records;
}

export async function archiveSoldVehicle(
  vehicle: Vehicle,
  salePrice?: number,
  notes?: string
): Promise<{ success: boolean; record?: SoldVehicleRecord; error?: string }> {
  const records = await getSoldVehicles();

  const record: SoldVehicleRecord = {
    id: `sold-${vehicle.slug}-${Date.now()}`,
    slug: vehicle.slug,
    plate: vehicle.plate || "SIN PLACA",
    brand: vehicle.brand,
    model: vehicle.model,
    version: vehicle.version,
    year: vehicle.year,
    salePrice: salePrice && salePrice > 0 ? salePrice : vehicle.price,
    listPrice: vehicle.listPrice,
    km: vehicle.km,
    fuel: vehicle.fuel,
    transmission: vehicle.transmission,
    bodyType: vehicle.bodyType,
    location: vehicle.location,
    supplier: vehicle.supplier,
    soldAt: new Date().toISOString(),
    status: "Vendido",
    notes: notes || "Vendido y archivado para analítica y ciencia de datos",
  };

  // Avoid duplicate archives of same slug
  const filtered = records.filter((r) => r.slug !== vehicle.slug);
  filtered.unshift(record);

  const ok = await writeJson(SOLD_FILENAME, filtered);
  if (!ok) {
    return { success: false, error: "No se pudo guardar en el registro de ventas." };
  }

  // Delete physical photos to free storage space
  try {
    const uploadDir = join(/*turbopackIgnore: true*/ process.cwd(), "public", "cars", "uploads", vehicle.slug);
    if (existsSync(uploadDir)) {
      const files = await readdir(uploadDir);
      for (const file of files) {
        try {
          await unlink(join(uploadDir, file));
        } catch {
          /* ignore individual file unlink errors */
        }
      }
      try {
        await rmdir(uploadDir);
      } catch {
        /* ignore rmdir error */
      }
    }
  } catch (err) {
    console.error(`[ArchiveSold] Error al eliminar fotos de ${vehicle.slug}:`, err);
  }

  return { success: true, record };
}
