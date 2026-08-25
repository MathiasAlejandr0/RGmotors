import { NextRequest, NextResponse } from "next/server";
import { updateCreditStatus } from "@/lib/server/creditsStore";

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

    const updated = await updateCreditStatus(id, status, notes);
    if (!updated) {
      return NextResponse.json({ error: "Solicitud no encontrada." }, { status: 404 });
    }

    return NextResponse.json({ success: true, credit: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al actualizar crédito." },
      { status: 500 }
    );
  }
}
