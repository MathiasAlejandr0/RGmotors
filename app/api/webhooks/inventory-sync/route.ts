import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { syncFromLiveGoogleSheet } from "@/lib/server/googleSheetSyncService";
import { timingSafeEqualString } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Webhook de solo lectura: Google Sheets / Apps Script avisa un cambio
 * y la web refresca el inventario en KV. Nunca escribe en Excel ni Drive.
 *
 * Auth: Authorization: Bearer <CRON_SECRET|INVENTORY_SYNC_SECRET>
 * Body opcional: { "sheetId": "...", "source": "apps-script" }
 */
function authorizeWebhook(req: NextRequest): boolean {
  const secret =
    process.env.INVENTORY_SYNC_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    "";
  const isProd =
    process.env.VERCEL_ENV === "production" ||
    (process.env.NODE_ENV === "production" && process.env.VERCEL === "1");

  if (!secret || secret.length < 16) {
    if (isProd) return false;
    console.warn(
      "[InventoryWebhook] Sin secret — permitido solo en desarrollo.",
    );
    return true;
  }

  const auth = req.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const headerSecret = req.headers.get("x-inventory-sync-secret") || "";
  const provided = bearer || headerSecret;

  return Boolean(provided && timingSafeEqualString(provided, secret));
}

export async function GET() {
  return NextResponse.json({
    status: "ready",
    mode: "read-only",
    message:
      "Webhook de inventario: lee Google Sheets y actualiza la web. No modifica Excel ni Drive.",
  });
}

export async function POST(req: NextRequest) {
  if (!authorizeWebhook(req)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let sheetId: string | undefined;
  let source = "webhook";
  try {
    const body = (await req.json()) as { sheetId?: string; source?: string };
    sheetId = body?.sheetId;
    if (body?.source) source = String(body.source).slice(0, 64);
  } catch {
    /* body vacío OK */
  }

  console.log(
    `[InventoryWebhook] Sync solo-lectura desde ${source} (no escribe Sheets/Drive)…`,
  );

  const report = await syncFromLiveGoogleSheet(sheetId);

  // Invalidar caché de páginas que muestran stock
  try {
    revalidatePath("/");
    revalidatePath("/catalogo");
    revalidatePath("/api/vehicles");
  } catch {
    /* noop en entornos sin cache */
  }

  return NextResponse.json({
    ...report,
    mode: "read-only",
    source,
    touchedGoogleSheet: false,
    touchedGoogleDrive: false,
    timestamp: new Date().toISOString(),
  });
}
