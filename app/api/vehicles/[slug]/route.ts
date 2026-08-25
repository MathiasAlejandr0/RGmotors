import { NextRequest, NextResponse } from "next/server";
import { getVehicleBySlug, saveVehicle, deleteVehicle } from "@/lib/server/vehiclesStore";
import { Vehicle } from "@/lib/vehicles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const v = await getVehicleBySlug(slug);
  if (!v) {
    return NextResponse.json({ error: "Vehículo no encontrado." }, { status: 404 });
  }
  return NextResponse.json({ vehicle: v });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const existing = await getVehicleBySlug(slug);
    if (!existing) {
      return NextResponse.json({ error: "Vehículo no encontrado." }, { status: 404 });
    }

    const body = (await req.json()) as Partial<Vehicle>;
    const updated: Vehicle = {
      ...existing,
      ...body,
      slug, // protect original slug unless explicitly handling rename
    };

    const res = await saveVehicle(updated);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, vehicle: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al actualizar vehículo." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const res = await deleteVehicle(slug);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: `Vehículo ${slug} eliminado.` });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al eliminar vehículo." },
      { status: 500 }
    );
  }
}
