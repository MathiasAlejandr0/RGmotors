import { NextRequest, NextResponse } from "next/server";
import { getCreditApplications, addCreditApplication } from "@/lib/server/creditsStore";
import { notifyTeam } from "@/lib/server/notify";
import { clientKey, rateLimit } from "@/lib/server/rateLimit";

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
  const rl = rateLimit(clientKey(req, "credits"), 8, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Demasiados envíos. Intenta en un minuto." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    if (!body.clientName || !body.email || !body.phone) {
      return NextResponse.json(
        { error: "Por favor completa tu nombre, correo electrónico y teléfono." },
        { status: 400 }
      );
    }

    const credit = await addCreditApplication({
      clientName: String(body.clientName).trim(),
      rut: body.rut ? String(body.rut).trim() : undefined,
      email: String(body.email).trim(),
      phone: String(body.phone).trim(),
      vehicleSlug: String(body.vehicleSlug || "simulacion-general").trim(),
      downPct: Number(body.downPct || 20),
      downPayment: body.downPayment ? Number(body.downPayment) : undefined,
      term: Number(body.term || 48),
      monthlyEstimate: Number(body.monthlyEstimate || 0),
      income: body.income ? Number(body.income) : undefined,
      employmentType: body.employmentType ? String(body.employmentType).trim() : undefined,
      maxApprovedAmount: body.maxApprovedAmount ? Number(body.maxApprovedAmount) : undefined,
      status: "En evaluación",
      trafficSource: body.trafficSource,
      notes: body.notes
        ? String(body.notes).trim()
        : `Simulación de crédito para ${body.clientName} (RUT: ${body.rut || "No especificado"}).`,
    });

    await notifyTeam({
      type: "credit",
      title: `Nueva simulación de crédito: ${credit.clientName}`,
      body: `${credit.clientName} (RUT: ${credit.rut || "n/d"}) solicitó simulación. Vehículo: ${credit.vehicleSlug}. Pie: ${credit.downPayment ?? "n/d"}. Plazo: ${credit.term} meses. Cuota est.: ${credit.monthlyEstimate}. Contacto: ${credit.email} / ${credit.phone}.`,
      meta: {
        id: credit.id,
        clientName: credit.clientName,
        rut: credit.rut,
        email: credit.email,
        phone: credit.phone,
        vehicleSlug: credit.vehicleSlug,
        income: credit.income,
        downPayment: credit.downPayment,
        monthlyEstimate: credit.monthlyEstimate,
        term: credit.term,
      },
    });

    return NextResponse.json({
      success: true,
      credit,
      message: `Simulación de crédito recibida con éxito. Te responderemos a la brevedad a tu correo (${credit.email}).`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al procesar la simulación de crédito." },
      { status: 500 }
    );
  }
}
