import { NextRequest, NextResponse } from "next/server";
import { updateCarRequestStatus } from "@/lib/server/carRequestsStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.status) {
      return NextResponse.json({ error: "Campo 'status' es obligatorio." }, { status: 400 });
    }

    const updated = await updateCarRequestStatus(id, body.status, body.notes);

    if (!updated) {
      return NextResponse.json({ error: "Solicitud no encontrada." }, { status: 404 });
    }

    return NextResponse.json({ success: true, request: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al actualizar solicitud." },
      { status: 500 }
    );
  }
}
