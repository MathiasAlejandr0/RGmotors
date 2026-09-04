import { NextRequest, NextResponse } from "next/server";
import { getReservations, addReservation } from "@/lib/server/reservationsStore";
import { notifyTeam } from "@/lib/server/notify";
import { clientKey, rateLimit } from "@/lib/server/rateLimit";

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
  const rl = rateLimit(clientKey(req, "reservations"), 8, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Demasiados envíos. Intenta en un minuto." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    // Honeypot anti-bot
    if (body.website || body.company_url) {
      return NextResponse.json({ success: true });
    }

    if (!body.clientName || !body.vehicleSlug) {
      return NextResponse.json({ error: "Faltan datos de la reserva." }, { status: 400 });
    }

    // Público no puede marcar Pagada: siempre Pendiente
    const status = "Pendiente" as const;

    const reservation = await addReservation({
      clientName: String(body.clientName).trim(),
      email: String(body.email || "").trim(),
      phone: String(body.phone || "").trim(),
      vehicleSlug: String(body.vehicleSlug).trim(),
      amount: Number(body.amount ?? 200000),
      method: String(body.method || "solicitud-web"),
      status,
      notes: body.notes ? String(body.notes).trim() : undefined,
      trafficSource: body.trafficSource,
    });

    await notifyTeam({
      type: "reservation",
      title: `Nueva solicitud de reserva: ${reservation.vehicleSlug}`,
      body: `${reservation.clientName} (${reservation.phone} / ${reservation.email}) solicitó reservar ${reservation.vehicleSlug}. Monto referencial: $${reservation.amount}. Método: ${reservation.method}. Estado: ${reservation.status}.`,
      meta: {
        id: reservation.id,
        vehicleSlug: reservation.vehicleSlug,
        clientName: reservation.clientName,
        phone: reservation.phone,
        email: reservation.email,
        amount: reservation.amount,
        method: reservation.method,
        status: reservation.status,
      },
    });

    return NextResponse.json({ success: true, reservation });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al registrar la reserva." },
      { status: 500 }
    );
  }
}
