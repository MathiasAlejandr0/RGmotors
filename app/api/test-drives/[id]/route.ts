import { NextRequest, NextResponse } from "next/server";
import { updateTestDrive, deleteTestDrive } from "@/lib/server/testDrivesStore";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const updated = await updateTestDrive(id, body);

    if (!updated) {
      return NextResponse.json(
        { error: "Prueba de manejo no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, testDrive: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deleted = await deleteTestDrive(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Prueba de manejo no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, deleted: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
