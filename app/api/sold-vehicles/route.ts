import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth/session";
import { getSoldVehicles } from "@/lib/server/soldVehiclesStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = await verifyAdminSessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );
  return Boolean(session && !session.mustChange);
}

/** GET /api/sold-vehicles — historial de ventas (solo admin). */
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const sold = await getSoldVehicles();
  return NextResponse.json({
    sold,
    count: sold.length,
  });
}
