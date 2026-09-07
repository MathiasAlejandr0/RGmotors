import { NextRequest, NextResponse } from "next/server";
import { runAutoSync, getAutoSyncStatus } from "@/lib/server/autoSyncScheduler";
import { syncFromLiveGoogleSheet } from "@/lib/server/googleSheetSyncService";
import { timingSafeEqualString } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorizeCron(req: NextRequest): { ok: boolean } {
  const secret = process.env.CRON_SECRET?.trim();
  const isProd =
    process.env.VERCEL_ENV === "production" ||
    (process.env.NODE_ENV === "production" && process.env.VERCEL === "1");

  if (!secret || secret.length < 16) {
    if (isProd) return { ok: false };
    console.warn("[CronSync] CRON_SECRET ausente — solo permitido en desarrollo.");
    return { ok: true };
  }

  const auth = req.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  // Query secret solo en no-prod o con flag explícito (evita leaks en logs/Referer).
  const allowQuery =
    !isProd || process.env.CRON_ALLOW_QUERY_SECRET === "1";
  const querySecret = allowQuery
    ? req.nextUrl.searchParams.get("secret") || ""
    : "";
  const provided = bearer || querySecret;

  if (!provided || !timingSafeEqualString(provided, secret)) {
    return { ok: false };
  }
  return { ok: true };
}

export async function GET(req: NextRequest) {
  const auth = authorizeCron(req);
  if (!auth.ok) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const status = getAutoSyncStatus();
  return NextResponse.json({
    status: "ok",
    ...status,
  });
}

export async function POST(req: NextRequest) {
  const auth = authorizeCron(req);
  if (!auth.ok) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  console.log("[CronSync] Ejecutando sincronización diaria de Google Sheets e inventario...");
  const sheetResult = await syncFromLiveGoogleSheet();
  const driveResult = await runAutoSync();

  return NextResponse.json({
    success: sheetResult.success || driveResult.success,
    sheetSync: sheetResult,
    driveSync: driveResult,
    timestamp: new Date().toISOString(),
  });
}
