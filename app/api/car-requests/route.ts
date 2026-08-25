import { NextRequest, NextResponse } from "next/server";
import { getCarRequests, addCarRequest } from "@/lib/server/carRequestsStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const list = await getCarRequests();
  return NextResponse.json({ requests: list, total: list.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.clientName || !body.phone || !body.brand || !body.model || !body.maxBudget) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios (nombre, teléfono, marca, modelo, presupuesto)." },
        { status: 400 }
      );
    }

    const item = await addCarRequest({
      clientName: String(body.clientName).trim(),
      phone: String(body.phone).trim(),
      email: body.email ? String(body.email).trim() : undefined,
      brand: String(body.brand).trim(),
      model: String(body.model).trim(),
      maxBudget: Number(body.maxBudget),
      minYear: body.minYear ? Number(body.minYear) : undefined,
      fuel: body.fuel ? String(body.fuel).trim() : undefined,
      transmission: body.transmission ? String(body.transmission).trim() : undefined,
      notes: body.notes ? String(body.notes).trim() : undefined,
    });

    return NextResponse.json({ success: true, request: item });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al procesar solicitud de búsqueda." },
      { status: 500 }
    );
  }
}
