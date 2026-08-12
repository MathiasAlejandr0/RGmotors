"use client";

import { useState } from "react";
import type { Vehicle } from "@/lib/vehicles";

export default function CatalogPdfButton({
  vehicles,
  filterSummary = "Catálogo completo",
}: {
  vehicles: Vehicle[];
  filterSummary?: string;
}) {
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (loading || vehicles.length === 0) return;
    setLoading(true);
    try {
      const { generateCatalogPdf } = await import("./CatalogPdfDoc");
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const generatedAt = new Date().toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const blob = await generateCatalogPdf(vehicles, {
        generatedAt,
        count: vehicles.length,
        filterSummary,
        origin,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `catalogo-rg-motors-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (e) {
      console.error("Error generando el PDF:", e);
      alert("No se pudo generar el PDF. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handle}
      disabled={loading || vehicles.length === 0}
      className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Generando PDF…
        </>
      ) : (
        <>
          <span aria-hidden>⬇</span>
          Descargar catálogo PDF
          <span className="hidden text-xs font-normal text-white/70 sm:inline">
            ({vehicles.length})
          </span>
        </>
      )}
    </button>
  );
}
