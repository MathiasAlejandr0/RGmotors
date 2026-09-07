import { NextRequest, NextResponse } from "next/server";
import { getTestDrives, addTestDrive, type TrafficInfo } from "@/lib/server/testDrivesStore";
import { notifyTeam } from "@/lib/server/notify";
import {
  guardPublicLeadPost,
  isValidChilePhone,
  isValidEmail,
} from "@/lib/server/security";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await getTestDrives();
    return NextResponse.json({ testDrives: list });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const guard = await guardPublicLeadPost(req, "test-drives", 8);
  if (!guard.ok) return guard.response;
  const body = guard.body;

  try {
    const clientName = String(body.clientName || "").trim();
    const clientPhone = String(body.clientPhone || "").trim();
    const clientEmail = body.clientEmail ? String(body.clientEmail).trim() : "";
    const vehicleSlug = String(body.vehicleSlug || "").trim();

    if (!clientName || !clientPhone || !vehicleSlug) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios (nombre, teléfono o vehículo)" },
        { status: 400 },
      );
    }
    if (!isValidChilePhone(clientPhone)) {
      return NextResponse.json({ error: "Teléfono inválido." }, { status: 400 });
    }
    if (clientEmail && !isValidEmail(clientEmail)) {
      return NextResponse.json({ error: "Correo electrónico inválido." }, { status: 400 });
    }

    const created = await addTestDrive({
      vehicleSlug,
      vehicleTitle: String(body.vehicleTitle || vehicleSlug),
      branch: String(body.branch || "Showroom Av. El Tepual (Puerto Montt)"),
      date: String(body.date || new Date().toLocaleDateString("es-CL")),
      time: String(body.time || "11:30"),
      executive: String(body.executive || "Sin preferencia"),
      clientName,
      clientPhone,
      clientEmail,
      trafficSource:
        body.trafficSource && typeof body.trafficSource === "object"
          ? (body.trafficSource as TrafficInfo)
          : undefined,
      notes: body.notes ? String(body.notes).slice(0, 1000) : "",
    });

    await notifyTeam({
      type: "test-drive",
      title: `Prueba de manejo: ${created.vehicleTitle}`,
      body: `${clientName} · ${clientPhone} · ${created.date} ${created.time}`,
      meta: { id: created.id, vehicleSlug },
    });

    return NextResponse.json({ ok: true, testDrive: created }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 },
    );
  }
}
