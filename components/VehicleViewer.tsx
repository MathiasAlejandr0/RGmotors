"use client";

import { useState } from "react";
import Showroom3D from "./Showroom3D";
import InteriorTour from "./InteriorTour";
import PhotoSpin360 from "./PhotoSpin360";

type Tab = "fotos" | "exterior" | "interior" | "informe";
type ExteriorMode = "fotos" | "3d";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "fotos", label: "Fotos", icon: "🖼️" },
  { id: "exterior", label: "Tour 360°", icon: "🔄" },
  { id: "interior", label: "Interior", icon: "🚗" },
  { id: "informe", label: "Informe", icon: "📋" },
];

const INSPECTION = [
  { area: "Motor y transmisión", ok: true },
  { area: "Frenos y suspensión", ok: true },
  { area: "Sistema eléctrico", ok: true },
  { area: "Carrocería y pintura", ok: true },
  { area: "Neumáticos (80% vida útil)", ok: true },
  { area: "Interior y tapices", ok: true },
  { area: "Documentación y deudas", ok: true },
  { area: "Prueba de ruta", ok: true },
];

export default function VehicleViewer({
  image,
  name,
  spinFrames = [],
}: {
  image: string;
  name: string;
  spinFrames?: string[];
}) {
  const [tab, setTab] = useState<Tab>("fotos");
  const hasSpin = spinFrames.length > 0;
  const [exteriorMode, setExteriorMode] = useState<ExteriorMode>(
    hasSpin ? "fotos" : "3d"
  );

  return (
    <div>
      <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-ink-700 to-ink-900 sm:aspect-[16/10]">
        {tab === "fotos" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} className="h-full w-full object-cover" />
        )}
        {tab === "exterior" &&
          (hasSpin && exteriorMode === "fotos" ? (
            <PhotoSpin360 frames={spinFrames} className="h-full w-full" />
          ) : (
            <Showroom3D className="h-full w-full" />
          ))}
        {tab === "interior" && <InteriorTour className="h-full w-full" />}
        {tab === "informe" && (
          <div className="h-full overflow-y-auto p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-medium text-emerald-300">
                ✓ Inspección de 150 puntos aprobada
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {INSPECTION.map((item) => (
                <div
                  key={item.area}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-ink-800/60 px-3 py-2 text-sm"
                >
                  <span className="text-white/70">{item.area}</span>
                  <span className="text-emerald-400">✓ OK</span>
                </div>
              ))}
            </div>
            <button className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:bg-white/5">
              Descargar informe PDF
            </button>
          </div>
        )}
      </div>

      {/* Selector Fotos reales / Modelo 3D (solo si hay fotos 360°) */}
      {tab === "exterior" && hasSpin && (
        <div className="mt-3 flex justify-center">
          <div className="flex gap-1 rounded-full border border-white/10 bg-ink-800/60 p-1">
            <button
              onClick={() => setExteriorMode("fotos")}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                exteriorMode === "fotos"
                  ? "bg-brand-500 text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              📷 Fotos 360°
            </button>
            <button
              onClick={() => setExteriorMode("3d")}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                exteriorMode === "3d"
                  ? "bg-brand-500 text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              🔄 Modelo 3D
            </button>
          </div>
        </div>
      )}

      {/* Tabs / thumbnails */}
      <div className="mt-3 grid grid-cols-4 gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-sm font-medium transition ${
              tab === t.id
                ? "border-brand-500 bg-brand-500/15 text-white"
                : "border-white/10 bg-ink-800/60 text-white/60 hover:text-white"
            }`}
          >
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-white/40">
        {tab === "exterior"
          ? hasSpin && exteriorMode === "fotos"
            ? "Giro 360° con fotos reales del vehículo: arrastra para girar."
            : "Modelo 3D interactivo: arrastra para girar y cambia el color."
          : tab === "interior"
            ? "Explora el interior y toca los puntos destacados."
            : tab === "informe"
              ? "Cada auto pasa por una inspección mecánica de 150 puntos."
              : "Fotografías reales del vehículo."}
      </p>
    </div>
  );
}
