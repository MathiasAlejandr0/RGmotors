import { NextRequest, NextResponse } from "next/server";
import { syncCatalogFromDriveFolders, parseExcelStockBuffer } from "@/lib/server/driveSyncService";
import { saveVehicle, getVehicles } from "@/lib/server/vehiclesStore";
import { startAutoSyncScheduler, getAutoSyncStatus } from "@/lib/server/autoSyncScheduler";
import { Vehicle } from "@/lib/vehicles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Inicializar temporizador si no estaba ya
startAutoSyncScheduler();

const DEFAULT_DRIVE_URLS = [
  "https://drive.google.com/drive/folders/1zqX6z_sKWHjHyNoMlS_rtkkF6pK_FqVh?usp=sharing",
  "https://drive.google.com/drive/folders/1VQ6IHTjk5sJYjJckZY1kzeRJAI5d09Od?usp=sharing",
];

export async function GET() {
  try {
    const list = await getVehicles();
    return NextResponse.json({
      connectedFolders: DEFAULT_DRIVE_URLS,
      totalVehicles: list.length,
      vehicles: list,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al obtener estado de sincronización." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // Si viene un archivo Excel (FormData)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No se subió ningún archivo Excel." }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const rows = await parseExcelStockBuffer(buffer);

      let imported = 0;
      for (const r of rows) {
        const marca = r["Marca"] || r["MARCA"] || r["brand"] || "Vehículo";
        const modelo = r["Modelo"] || r["MODELO"] || r["model"] || r["Nombre"] || "Modelo";
        const year = Number(r["Año"] || r["AÑO"] || r["year"] || 2021);
        const precio = Number(r["Precio"] || r["PRECIO"] || r["price"] || r["Valor"] || 11990000);
        const km = Number(r["Kilometraje"] || r["KM"] || r["km"] || 40000);
        const patente = r["Patente"] || r["PATENTE"] || r["patente"] || "";
        const version = r["Versión"] || r["VERSION"] || r["version"] || "Full Equipo";
        const combustible = r["Combustible"] || r["COMBUSTIBLE"] || "Bencina";
        const transmision = r["Transmisión"] || r["TRANSMISION"] || "Automática";
        const tipo = r["Carrocería"] || r["CARROCERIA"] || r["Tipo"] || "SUV";

        const slug = `${marca.toLowerCase()}-${modelo.toLowerCase()}-${year}`
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

        const vehicle: Vehicle = {
          slug,
          brand: marca,
          model: modelo,
          version,
          year,
          price: precio,
          km,
          fuel: combustible,
          transmission: transmision,
          bodyType: tipo,
          location: "Puerto Montt, Los Lagos",
          image: `/cars/real/${slug}-cover.jpg`,
          engine: "2.0L",
          power: "150 HP",
          traction: "4x2",
          doors: tipo === "Camioneta" ? 4 : 5,
          owners: 1,
          featured: true,
          status: "Disponible",
          highlights: [
            patente ? `Patente: ${patente}` : "Inspección aprobada",
            "Inspección de 150 puntos aprobada",
            "Garantía RG Motors de 6 meses",
          ],
        };

        await saveVehicle(vehicle);
        imported += 1;
      }

      return NextResponse.json({
        success: true,
        message: `Excel importado con éxito: ${imported} vehículos actualizados en el inventario.`,
        importedCount: imported,
      });
    }

    // Sincronización normal desde Google Drive
    const body = await req.json().catch(() => ({}));
    const urls = body.folderUrls && Array.isArray(body.folderUrls) && body.folderUrls.length > 0
      ? body.folderUrls
      : DEFAULT_DRIVE_URLS;

    const result = await syncCatalogFromDriveFolders(urls);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al sincronizar con Google Drive." },
      { status: 500 }
    );
  }
}
