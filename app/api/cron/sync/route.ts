import { NextRequest, NextResponse } from "next/server";
import { runAutoSync, getAutoSyncStatus } from "@/lib/server/autoSyncScheduler";
import { syncFromLiveGoogleSheet } from "@/lib/server/googleSheetSyncService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorizeCron(req: NextRequest): { ok: boolean; warning?: string } {
  const secret = process.env.CRON_SECRET;
  const isProd = process.env.NODE_ENV === "production";

  if (!secret) {
    if (isProd) {
      return { ok: false };
    }
    console.warn(
      "[CronSync] CRON_SECRET no está definido. Permitiendo acceso solo en desarrollo."
    );
    return { ok: true, warning: "CRON_SECRET unset (dev)" };
  }

  const auth = req.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const querySecret = req.nextUrl.searchParams.get("secret") || "";

  if (bearer === secret || querySecret === secret) {
    return { ok: true };
  }
  return { ok: false };
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
