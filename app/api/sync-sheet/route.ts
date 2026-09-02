import { NextRequest, NextResponse } from "next/server";
import { syncFromLiveGoogleSheet } from "@/lib/server/googleSheetSyncService";
import { getSoldVehicles } from "@/lib/server/soldVehiclesStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sold = await getSoldVehicles();
  return NextResponse.json({
    status: "ready",
    soldArchiveCount: sold.length,
    message: "Servicio de sincronización continua con Google Sheets listo.",
  });
}

export async function POST(req: NextRequest) {
  try {
    let sheetId: string | undefined;
    try {
      const body = await req.json();
      sheetId = body?.sheetId;
    } catch {
      /* noop */
    }

    const report = await syncFromLiveGoogleSheet(sheetId);
    return NextResponse.json(report);
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Error durante la sincronización",
      },
      { status: 500 }
    );
  }
}
