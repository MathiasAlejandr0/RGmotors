import { NextResponse } from "next/server";
import { runAutoSync, getAutoSyncStatus, startAutoSyncScheduler } from "@/lib/server/autoSyncScheduler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Inicializar el temporizador en la primera invocación del servidor
startAutoSyncScheduler();

export async function GET() {
  const status = getAutoSyncStatus();
  return NextResponse.json({
    status: "ok",
    ...status,
  });
}

export async function POST() {
  const result = await runAutoSync();
  const status = getAutoSyncStatus();
  return NextResponse.json({
    ...result,
    currentStatus: status,
  });
}
