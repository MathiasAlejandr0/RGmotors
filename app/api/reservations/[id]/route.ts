import { NextRequest, NextResponse } from "next/server";
import { updateReservationStatus } from "@/lib/server/reservationsStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { status, notes } = body;
    if (!status) {
      return NextResponse.json({ error: "Estado no especificado." }, { status: 400 });
    }

    const updated = await updateReservationStatus(id, status, notes);
    if (!updated) {
      return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
    }

    return NextResponse.json({ success: true, reservation: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al actualizar estado." },
      { status: 500 }
    );
  }
}
