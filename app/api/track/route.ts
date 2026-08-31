import { NextRequest } from "next/server";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CapturedLead = {
  id: string;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  budget?: number;
  bodyType?: string;
  financing?: boolean;
  intents?: string[];
  models?: string[];
  name?: string;
  contact?: string;
  messages?: number;
  trafficSource?: any;
};

const getCwd = () => process.cwd();
const DATA_DIR = join(getCwd(), "data");
const FILE = join(DATA_DIR, "leads.json");

async function readAll(): Promise<CapturedLead[]> {
  try {
    return JSON.parse(await readFile(FILE, "utf8"));
  } catch {
    return [];
  }
}

async function writeAll(list: CapturedLead[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(FILE, JSON.stringify(list, null, 2));
}

/** Devuelve los leads capturados (más recientes primero). */
export async function GET() {
  const list = await readAll();
  list.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  return Response.json({ leads: list });
}

/**
 * Registra/actualiza un lead del chatbot. Hace upsert por sessionId, así una
 * misma conversación no crea múltiples leads: enriquece el existente.
 */
export async function POST(req: NextRequest) {
  let body: Partial<CapturedLead> & { sessionId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }
  const sessionId = String(body.sessionId || "").slice(0, 64);
  if (!sessionId) return Response.json({ error: "Falta sessionId" }, { status: 400 });

  const list = await readAll();
  const now = new Date().toISOString();
  const existing = list.find((l) => l.sessionId === sessionId);

  const mergeArr = (a?: string[], b?: string[]) =>
    Array.from(new Set([...(a ?? []), ...(b ?? [])]));

  if (existing) {
    existing.updatedAt = now;
    if (body.budget != null) existing.budget = body.budget;
    if (body.bodyType) existing.bodyType = body.bodyType;
    if (body.financing != null) existing.financing = body.financing;
    if (body.name) existing.name = body.name;
    if (body.contact) existing.contact = body.contact;
    if (body.trafficSource) existing.trafficSource = body.trafficSource;
    existing.intents = mergeArr(existing.intents, body.intents);
    existing.models = mergeArr(existing.models, body.models);
    existing.messages = (existing.messages ?? 0) + (body.messages ?? 1);
  } else {
    list.push({
      id: `C${Date.now().toString(36)}`,
      sessionId,
      createdAt: now,
      updatedAt: now,
      budget: body.budget,
      bodyType: body.bodyType,
      financing: body.financing,
      intents: body.intents ?? [],
      models: body.models ?? [],
      name: body.name,
      contact: body.contact,
      messages: body.messages ?? 1,
      trafficSource: body.trafficSource,
    });
  }

  // Mantener acotado (últimos 500).
  const trimmed = list.slice(-500);
  await writeAll(trimmed);
  return Response.json({ ok: true });
}
