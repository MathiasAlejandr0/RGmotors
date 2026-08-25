import { NextRequest, NextResponse } from "next/server";
import { getVehicles, saveVehicle } from "@/lib/server/vehiclesStore";
import { Vehicle } from "@/lib/vehicles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let list = await getVehicles();

    const featured = searchParams.get("featured");
    if (featured === "true") {
      list = list.filter((v) => v.featured);
    }

    const brand = searchParams.get("brand");
    if (brand) {
      list = list.filter((v) => v.brand.toLowerCase() === brand.toLowerCase());
    }

    const bodyType = searchParams.get("bodyType");
    if (bodyType) {
      list = list.filter((v) => v.bodyType.toLowerCase() === bodyType.toLowerCase());
    }

    const status = searchParams.get("status");
    if (status) {
      list = list.filter((v) => (v.status || "Disponible").toLowerCase() === status.toLowerCase());
    }

    return NextResponse.json({ vehicles: list, total: list.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al obtener vehículos." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<Vehicle>;

    if (!body.brand || !body.model || !body.year || !body.price) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios (marca, modelo, año, precio)." },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const slug =
      body.slug && /^[a-z0-9-]+$/i.test(body.slug)
        ? body.slug.toLowerCase()
        : `${body.brand}-${body.model}-${body.year}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

    const vehicle: Vehicle = {
      slug,
      brand: String(body.brand).trim(),
      model: String(body.model).trim(),
      version: String(body.version || "1.0").trim(),
      year: Number(body.year),
      price: Number(body.price),
      km: Number(body.km || 0),
      fuel: body.fuel || "Bencina",
      transmission: body.transmission || "Automática",
      bodyType: body.bodyType || "SUV",
      location: String(body.location || "Santiago, RM").trim(),
      image: body.image || "/cars/toyota-rav4-2022.jpg",
      engine: String(body.engine || "2.0L").trim(),
      power: String(body.power || "150 HP").trim(),
      traction: String(body.traction || "4x2").trim(),
      doors: Number(body.doors || 5),
      owners: Number(body.owners || 1),
      featured: Boolean(body.featured),
      status: body.status || "Disponible",
      highlights: Array.isArray(body.highlights) && body.highlights.length > 0
        ? body.highlights
        : [
            "Inspección de 150 puntos aprobada",
            "Mantenciones al día",
            "Garantía RG Motors de 6 meses",
          ],
      spin: body.spin && body.spin.count ? body.spin : undefined,
    };

    const res = await saveVehicle(vehicle);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, vehicle });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al guardar el vehículo." },
      { status: 500 }
    );
  }
}
