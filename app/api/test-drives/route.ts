import { NextRequest, NextResponse } from "next/server";
import { getTestDrives, addTestDrive } from "@/lib/server/testDrivesStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await getTestDrives();
    return NextResponse.json({ testDrives: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.clientName || !body.clientPhone || !body.vehicleSlug) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios (nombre, teléfono o vehículo)" },
        { status: 400 }
      );
    }

    const created = await addTestDrive({
      vehicleSlug: body.vehicleSlug,
      vehicleTitle: body.vehicleTitle || body.vehicleSlug,
      branch: body.branch || "Las Condes",
      date: body.date || new Date().toLocaleDateString("es-CL"),
      time: body.time || "11:30",
      executive: body.executive || "Sin preferencia",
      clientName: body.clientName,
      clientPhone: body.clientPhone,
      clientEmail: body.clientEmail || "",
      trafficSource: body.trafficSource,
      notes: body.notes || "",
    });

    return NextResponse.json({ ok: true, testDrive: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
