import { NextRequest, NextResponse } from "next/server";
import { getCreditApplications, addCreditApplication } from "@/lib/server/creditsStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await getCreditApplications();
    return NextResponse.json({ credits: list, total: list.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al obtener créditos." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.clientName || !body.vehicleSlug) {
      return NextResponse.json({ error: "Faltan datos de la solicitud de crédito." }, { status: 400 });
    }

    const credit = await addCreditApplication({
      clientName: String(body.clientName).trim(),
      email: String(body.email || "").trim(),
      phone: String(body.phone || "").trim(),
      vehicleSlug: String(body.vehicleSlug).trim(),
      downPct: Number(body.downPct || 20),
      term: Number(body.term || 48),
      monthlyEstimate: Number(body.monthlyEstimate || 0),
      income: body.income ? Number(body.income) : undefined,
      status: body.status || "En evaluación",
      notes: body.notes ? String(body.notes).trim() : undefined,
    });

    return NextResponse.json({ success: true, credit });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al procesar solicitud de crédito." },
      { status: 500 }
    );
  }
}
