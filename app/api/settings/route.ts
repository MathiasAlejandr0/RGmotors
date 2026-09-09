import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/server/settingsStore";
import { requireAdminSession } from "@/lib/auth/requireAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const s = await getSettings();
    return NextResponse.json(s, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al obtener configuración." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const updated = await updateSettings(body);
    return NextResponse.json({ success: true, settings: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al guardar configuración." },
      { status: 500 }
    );
  }
}
