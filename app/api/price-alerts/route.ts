import { NextRequest, NextResponse } from "next/server";
import { getPriceAlerts, addPriceAlert } from "@/lib/server/priceAlertsStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const list = await getPriceAlerts();
  return NextResponse.json({ alerts: list, total: list.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.vehicleSlug || !body.vehicleName || !body.phone || !body.clientName) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios para la alerta de precio." },
        { status: 400 }
      );
    }

    const item = await addPriceAlert({
      vehicleSlug: String(body.vehicleSlug).trim(),
      vehicleName: String(body.vehicleName).trim(),
      currentPrice: Number(body.currentPrice || 0),
      targetPrice: body.targetPrice ? Number(body.targetPrice) : undefined,
      clientName: String(body.clientName).trim(),
      phone: String(body.phone).trim(),
      email: body.email ? String(body.email).trim() : undefined,
    });

    return NextResponse.json({ success: true, alert: item });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al registrar alerta de precio." },
      { status: 500 }
    );
  }
}
