import { NextRequest, NextResponse } from "next/server";
import { updatePriceAlertStatus } from "@/lib/server/priceAlertsStore";

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

    const updated = await updatePriceAlertStatus(id, body.status);

    if (!updated) {
      return NextResponse.json({ error: "Alerta no encontrada." }, { status: 404 });
    }

    return NextResponse.json({ success: true, alert: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al actualizar alerta." },
      { status: 500 }
    );
  }
}
