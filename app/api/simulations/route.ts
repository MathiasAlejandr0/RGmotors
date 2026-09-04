import { NextRequest, NextResponse } from "next/server";
import { addSimulationEvent, getSimulationEvents } from "@/lib/server/simulationsStore";
import { clientKey, rateLimit } from "@/lib/server/rateLimit";
import { notifyTeam } from "@/lib/server/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await getSimulationEvents();
    return NextResponse.json({ simulations: list, total: list.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al listar simulaciones." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "simulations"), 40, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  }

  try {
    const body = await req.json();
    if (body.website || body.company_url) {
      return NextResponse.json({ success: true });
    }

    const sessionId = String(body.sessionId || "").slice(0, 64);
    if (!sessionId) {
      return NextResponse.json({ error: "Falta sessionId." }, { status: 400 });
    }

    const eventType = body.eventType === "lead_submit" ? "lead_submit" : "view_calc";

    const event = await addSimulationEvent({
      sessionId,
      source: body.source || "simulador",
      vehicleSlug: body.vehicleSlug ? String(body.vehicleSlug) : undefined,
      vehiclePrice: body.vehiclePrice != null ? Number(body.vehiclePrice) : undefined,
      vehicleYear: body.vehicleYear != null ? Number(body.vehicleYear) : undefined,
      productId: String(body.productId || "autofin"),
      downPct: Number(body.downPct || 20),
      downPayment: Number(body.downPayment || 0),
      termMonths: Number(body.termMonths || 48),
      monthlyPayment: Number(body.monthlyPayment || 0),
      financed: Number(body.financed || 0),
      monthlyRate: Number(body.monthlyRate || 0),
      caeApprox: Number(body.caeApprox || 0),
      clientName: body.clientName ? String(body.clientName).trim() : undefined,
      phone: body.phone ? String(body.phone).trim() : undefined,
      email: body.email ? String(body.email).trim() : undefined,
      rut: body.rut ? String(body.rut).trim() : undefined,
      income: body.income != null ? Number(body.income) : undefined,
      employmentType: body.employmentType ? String(body.employmentType) : undefined,
      trafficSource: body.trafficSource,
      eventType,
    });

    if (eventType === "lead_submit" && (event.phone || event.email)) {
      await notifyTeam({
        type: "simulation-lead",
        title: `Lead simulación: ${event.clientName || "Sin nombre"}`,
        body: `${event.clientName || "Cliente"} · ${event.phone || ""} · ${event.email || ""} · cuota ${event.monthlyPayment} · pie ${event.downPct}% · ${event.termMonths}m · ${event.vehicleSlug || "sin auto"}`,
        meta: { id: event.id, sessionId: event.sessionId },
      });
    }

    return NextResponse.json({ success: true, simulation: event });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al guardar simulación." },
      { status: 500 },
    );
  }
}
