import type { Vehicle } from "@/lib/vehicles";

/** Campos mínimos para cards de catálogo / listados (payload liviano). */
export type VehicleCardDTO = Pick<
  Vehicle,
  | "slug"
  | "brand"
  | "model"
  | "version"
  | "year"
  | "price"
  | "km"
  | "fuel"
  | "transmission"
  | "bodyType"
  | "location"
  | "image"
  | "featured"
  | "status"
  | "hasRealPhotos"
  | "plate"
  | "engine"
  | "power"
  | "traction"
  | "doors"
> & {
  galleryCount: number;
  hasSpin: boolean;
};

export function toVehicleCardDTO(v: Vehicle): VehicleCardDTO {
  return {
    slug: v.slug,
    brand: v.brand,
    model: v.model,
    version: v.version,
    year: v.year,
    price: v.price,
    km: v.km,
    fuel: v.fuel,
    transmission: v.transmission,
    bodyType: v.bodyType,
    location: v.location,
    image: v.image,
    featured: v.featured,
    status: v.status,
    hasRealPhotos: v.hasRealPhotos,
    plate: v.plate,
    engine: v.engine,
    power: v.power,
    traction: v.traction,
    doors: v.doors,
    galleryCount: v.gallery?.length ?? 0,
    hasSpin: Boolean(v.spin && v.spin.count > 0),
  };
}
