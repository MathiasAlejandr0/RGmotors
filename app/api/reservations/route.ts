import { NextRequest, NextResponse } from "next/server";
import { getReservations, addReservation } from "@/lib/server/reservationsStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await getReservations();
    return NextResponse.json({ reservations: list, total: list.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al obtener reservas." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.clientName || !body.vehicleSlug || !body.amount) {
      return NextResponse.json({ error: "Faltan datos de la reserva." }, { status: 400 });
    }

    const reservation = await addReservation({
      clientName: String(body.clientName).trim(),
      email: String(body.email || "").trim(),
      phone: String(body.phone || "").trim(),
      vehicleSlug: String(body.vehicleSlug).trim(),
      amount: Number(body.amount),
      method: String(body.method || "webpay"),
      status: body.status || "Pagada",
      notes: body.notes ? String(body.notes).trim() : undefined,
    });

    return NextResponse.json({ success: true, reservation });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al registrar la reserva." },
      { status: 500 }
    );
  }
}
