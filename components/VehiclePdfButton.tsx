"use client";

import { useState } from "react";
import type { Vehicle } from "@/lib/vehicles";

export default function VehiclePdfButton({
  vehicle,
  className = "",
}: {
  vehicle: Vehicle;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/catalog/pdf?slugs=${encodeURIComponent(vehicle.slug)}`,
        { method: "GET", cache: "no-store" },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ficha-${vehicle.slug}-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (e) {
      console.error("Error generando el PDF:", e);
      alert(
        e instanceof Error
          ? `No se pudo generar la ficha PDF: ${e.message}`
          : "No se pudo generar la ficha PDF.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white/80 backdrop-blur-md transition hover:bg-white/10 hover:text-white disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Generando Ficha…
        </>
      ) : (
        <>
          <span>📄</span> Descargar Ficha Técnica Oficial (PDF)
        </>
      )}
    </button>
  );
}
