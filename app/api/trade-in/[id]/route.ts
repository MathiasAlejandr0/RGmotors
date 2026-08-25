import { NextRequest, NextResponse } from "next/server";
import { updateTradeInStatus } from "@/lib/server/tradeInStore";

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

    const updated = await updateTradeInStatus(
      id,
      body.status,
      body.notes,
      body.estimatedAppraisal ? Number(body.estimatedAppraisal) : undefined
    );

    if (!updated) {
      return NextResponse.json({ error: "Tasación no encontrada." }, { status: 404 });
    }

    return NextResponse.json({ success: true, request: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al actualizar tasación." },
      { status: 500 }
    );
  }
}
