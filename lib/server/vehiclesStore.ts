import { readJson, writeJson } from "./db";
import { Vehicle, vehicles as initialVehicles } from "@/lib/vehicles";

const FILENAME = "vehicles.json";

/** RG Motors no ofrece garantía en usados: filtrar textos heredados. */
function stripWarrantyClaims(vehicle: Vehicle): Vehicle {
  if (!vehicle.highlights?.length) return vehicle;
  const cleaned = vehicle.highlights.filter(
    (h) => !/garant[ií]a/i.test(h) || /no ofrece garantía/i.test(h),
  );
  if (cleaned.length === vehicle.highlights.length) return vehicle;
  return { ...vehicle, highlights: cleaned };
}

export async function getVehicles(): Promise<Vehicle[]> {
  const list = await readJson<Vehicle[]>(FILENAME, initialVehicles);
  return list.map(stripWarrantyClaims);
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const list = await getVehicles();
  return list.find((v) => v.slug === slug) ?? null;
}

export async function saveVehicle(vehicle: Vehicle): Promise<{ success: boolean; vehicle?: Vehicle; error?: string }> {
  const list = await getVehicles();
  const existingIdx = list.findIndex((v) => v.slug === vehicle.slug);

  if (existingIdx >= 0) {
    list[existingIdx] = { ...list[existingIdx], ...vehicle };
  } else {
    // New vehicle
    list.unshift(vehicle);
  }

  const ok = await writeJson(FILENAME, list);
  if (!ok) return { success: false, error: "Error al guardar en el almacenamiento." };
  return { success: true, vehicle };
}

export async function deleteVehicle(slug: string): Promise<{ success: boolean; error?: string }> {
  const list = await getVehicles();
  const filtered = list.filter((v) => v.slug !== slug);
  if (filtered.length === list.length) {
    return { success: false, error: "Vehículo no encontrado." };
  }
  const ok = await writeJson(FILENAME, filtered);
  if (!ok) return { success: false, error: "Error al eliminar del almacenamiento." };
  return { success: true };
}
