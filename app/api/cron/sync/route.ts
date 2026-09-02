import { NextResponse } from "next/server";
import { runAutoSync, getAutoSyncStatus } from "@/lib/server/autoSyncScheduler";
import { syncFromLiveGoogleSheet } from "@/lib/server/googleSheetSyncService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const status = getAutoSyncStatus();
  return NextResponse.json({
    status: "ok",
    ...status,
  });
}

export async function POST() {
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
