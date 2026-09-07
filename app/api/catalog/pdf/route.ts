import { readFile, access } from "node:fs/promises";
import { join } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getVehicles } from "@/lib/server/vehiclesStore";
import { isPublicCatalogVehicle } from "@/lib/vehicles/publicCatalog";
import { enrichVehicleTechSpec } from "@/lib/vehicles/techSpecs";
import {
  generateCatalogPdfBuffer,
  isPdfSafeImagePath,
  type CatalogPdfImageMap,
} from "@/components/CatalogPdfDoc";
import type { Vehicle } from "@/lib/vehicles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function fileToDataUri(publicPath: string): Promise<string | null> {
  if (!isPdfSafeImagePath(publicPath)) return null;
  const rel = publicPath.replace(/^\/+/, "").split("?")[0];
  const abs = join(process.cwd(), "public", rel);
  try {
    await access(abs);
    const buf = await readFile(abs);
    const ext = rel.split(".").pop()?.toLowerCase();
    const mime =
      ext === "png"
        ? "image/png"
        : ext === "webp"
          ? "image/webp"
          : "image/jpeg";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

async function buildImageMap(vehicles: Vehicle[]): Promise<CatalogPdfImageMap> {
  const map: CatalogPdfImageMap = {};
  const logo = await fileToDataUri("/logo.png");
  if (logo) map["__logo__"] = logo;

  await Promise.all(
    vehicles.map(async (v) => {
      if (!v.image || !isPdfSafeImagePath(v.image)) return;
      const data = await fileToDataUri(v.image);
      if (data) map[v.slug] = data;
    }),
  );
  return map;
}

function parseSlugs(req: NextRequest): string[] | null {
  const q = req.nextUrl.searchParams.get("slugs");
  if (!q) return null;
  return q
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function GET(req: NextRequest) {
  try {
    const all = (await getVehicles())
      .filter(isPublicCatalogVehicle)
      .map((v) => enrichVehicleTechSpec(v));

    const slugs = parseSlugs(req);
    const vehicles = slugs?.length
      ? slugs
          .map((slug) => all.find((v) => v.slug === slug))
          .filter(Boolean) as Vehicle[]
      : all;

    if (!vehicles.length) {
      return NextResponse.json(
        { error: "No hay vehículos para el catálogo PDF." },
        { status: 404 },
      );
    }

    const generatedAt = new Date().toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const filterSummary = slugs?.length
      ? `Selección (${vehicles.length})`
      : "Catálogo completo";

    const imageMap = await buildImageMap(vehicles);
    const buffer = await generateCatalogPdfBuffer(vehicles, {
      generatedAt,
      count: vehicles.length,
      filterSummary,
    }, imageMap);

    const filename = `catalogo-rg-motors-${new Date().toISOString().slice(0, 10)}.pdf`;
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[catalog/pdf]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "No se pudo generar el catálogo PDF.",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { slugs?: string[] };
    const url = req.nextUrl.clone();
    if (body.slugs?.length) {
      url.searchParams.set("slugs", body.slugs.join(","));
    }
    return GET(new NextRequest(url, { method: "GET" }));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al generar PDF." },
      { status: 500 },
    );
  }
}
