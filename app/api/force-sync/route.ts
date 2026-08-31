import { NextResponse } from "next/server";
import { runAutoSync } from "@/lib/server/autoSyncScheduler";

export async function GET() {
  const result = await runAutoSync();
  return NextResponse.json(result);
}
