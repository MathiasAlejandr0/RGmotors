import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/requireAdmin";
import { getSoldVehicles } from "@/lib/server/soldVehiclesStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/sold-vehicles — historial de ventas (solo admin). */
export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const sold = await getSoldVehicles();
  return NextResponse.json({
    sold,
    count: sold.length,
  });
}
