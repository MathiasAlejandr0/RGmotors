import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/server/db";
import { notifyTeam } from "@/lib/server/notify";
import { clientKey, rateLimit } from "@/lib/server/rateLimit";
import { COMPANY } from "@/lib/company";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type ContactMessage = {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  trafficSource?: unknown;
  createdAt: string;
  status: "Nuevo" | "Contactado" | "Cerrado";
};

const FILENAME = "contact-messages.json";

async function listMessages(): Promise<ContactMessage[]> {
  return readJson<ContactMessage[]>(FILENAME, []);
}

export async function GET() {
  const list = await listMessages();
  return NextResponse.json({ messages: list, total: list.length });
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "contact"), 8, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Demasiados envíos. Intenta en un minuto." }, { status: 429 });
  }

  try {
    const body = await req.json();

    // Honeypot anti-bot
    if (body.website || body.company_url) {
      return NextResponse.json({ success: true });
    }

    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim();
    const message = String(body.message || "").trim();

    if (!name || !phone || !email || !message) {
      return NextResponse.json(
        { error: "Completa nombre, teléfono, correo y mensaje." },
        { status: 400 },
      );
    }

    const entry: ContactMessage = {
      id: `MSG_${Date.now().toString(36)}`,
      name,
      phone,
      email,
      message: message.slice(0, 2000),
      trafficSource: body.trafficSource,
      createdAt: new Date().toISOString(),
      status: "Nuevo",
    };

    const list = await listMessages();
    list.unshift(entry);
    await writeJson(FILENAME, list.slice(0, 1000));

    await notifyTeam({
      type: "contact",
      title: `Nuevo contacto web: ${name}`,
      body: `${message}\n\nTel: ${phone}\nEmail: ${email}\nDestino equipo: ${COMPANY.email}`,
      meta: { id: entry.id, phone, email },
    });

    return NextResponse.json({
      success: true,
      id: entry.id,
      message: "Mensaje recibido. Un asesor te contactará pronto.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al enviar mensaje." },
      { status: 500 },
    );
  }
}
