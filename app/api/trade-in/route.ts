import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type TradeInRequest = {
  id: string;
  clientName: string;
  phone: string;
  email?: string;
  brand: string;
  model: string;
  year: number;
  km: number;
  targetVehicleSlug?: string;
  notes?: string;
  date: string;
};

const FILENAME = "trade-ins.json";

export async function GET() {
  const list = await readJson<TradeInRequest[]>(FILENAME, []);
  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return NextResponse.json({ requests: list, total: list.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.clientName || !body.phone || !body.brand || !body.model || !body.year) {
      return NextResponse.json(
        { error: "Faltan datos de tasación (nombre, teléfono, marca, modelo, año)." },
        { status: 400 }
      );
    }

    const list = await readJson<TradeInRequest[]>(FILENAME, []);
    const item: TradeInRequest = {
      id: `TI-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: String(body.clientName).trim(),
      phone: String(body.phone).trim(),
      email: body.email ? String(body.email).trim() : undefined,
      brand: String(body.brand).trim(),
      model: String(body.model).trim(),
      year: Number(body.year),
      km: Number(body.km || 0),
      targetVehicleSlug: body.targetVehicleSlug ? String(body.targetVehicleSlug).trim() : undefined,
      notes: body.notes ? String(body.notes).trim() : undefined,
      date: new Date().toISOString(),
    };

    list.unshift(item);
    await writeJson(FILENAME, list);

    return NextResponse.json({ success: true, request: item });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al procesar solicitud de tasación." },
      { status: 500 }
    );
  }
}
