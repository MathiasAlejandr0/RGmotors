"use client";

import { useState } from "react";

interface VehicleHealthCardProps {
  vehicleName: string;
}

export default function VehicleHealthCard({ vehicleName }: VehicleHealthCardProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert(`Informe PDF de inspección de 150 puntos para ${vehicleName} descargado correctamente.`);
    }, 1200);
  };

  const metrics = [
    { label: "Motor & Sistema de Transmisión", score: 98, status: "Excelente", color: "from-emerald-400 to-emerald-500" },
    { label: "Sistema de Frenos & Neumáticos", score: 95, status: "Seminuevo", color: "from-emerald-400 to-emerald-500" },
    { label: "Habitáculo, Tapizado & Climatización", score: 100, status: "Impecable", color: "from-emerald-400 to-emerald-500" },
    { label: "Estructura, Chasis & Suspensión", score: 97, status: "Sin impactos", color: "from-emerald-400 to-emerald-500" },
    { label: "Documentación & Certificado Registro", score: 100, status: "Al día (Limpio)", color: "from-emerald-400 to-emerald-500" },
  ];

  return (
    <div className="apple-glass-card rounded-3xl p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🔋</span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Informe de Inspección Técnica & Salud del Vehículo
            </h3>
          </div>

          <p className="text-xs text-white/50 mt-0.5">
            Certificación técnica de 150 puntos con escáner mecánico digital.
          </p>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-3 py-1 text-xs font-extrabold text-emerald-400 shadow-glow">
            98% Excelente
          </span>
        </div>
      </div>

      {/* Metric Bars */}
      <div className="space-y-3.5">
        {metrics.map((m) => (
          <div key={m.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white/85">{m.label}</span>
              <span className="font-bold text-emerald-400">{m.score}% · {m.status}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 p-0.5 backdrop-blur-md">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${m.color} transition-all duration-1000 shadow-sm`}
                style={{ width: `${m.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Download PDF button */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="apple-btn-secondary flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-semibold text-white shadow-sm transition active:scale-98"
      >
        {downloading ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Generando PDF oficial…
          </>
        ) : (
          <>
            <span>📄</span> Descargar informe de inspección técnica PDF (150 Puntos)
          </>
        )}
      </button>
    </div>
  );
}
