"use client";

import { useEffect, useState } from "react";
import InteriorTour from "./InteriorTour";
import PhotoSpin360 from "./PhotoSpin360";

type Tab = "fotos" | "exterior" | "interior" | "informe";

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
  slug,
  spinFrames = [],
}: {
  image: string;
  name: string;
  slug?: string;
  spinFrames?: string[];
}) {
  const [tab, setTab] = useState<Tab>("fotos");
  const [frames, setFrames] = useState<string[]>(spinFrames);
  const hasSpin = frames.length > 0;

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetch(`/cars/spin/${slug}/manifest.json`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((m) => {
        if (cancelled || !m || !m.count) return;
        const bust = m.updatedAt
          ? `?v=${encodeURIComponent(m.updatedAt)}`
          : `?v=${Date.now()}`;
        setFrames(
          Array.from(
            { length: m.count },
            (_, i) =>
              `/cars/spin/${slug}/${String(i + 1).padStart(3, "0")}.jpg${bust}`
          )
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <div>
      <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-ink-700 to-ink-900 sm:aspect-[16/10]">
        {tab === "fotos" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} className="h-full w-full object-cover" />
        )}
        {tab === "exterior" &&
          (hasSpin ? (
            <PhotoSpin360 frames={frames} className="h-full w-full" />
          ) : (
            <div className="relative flex h-full w-full items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={name}
                className="h-full w-full object-cover opacity-40"
              />
              <p className="absolute text-sm text-white/70">
                Tour 360° no disponible para este vehículo
              </p>
            </div>
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
          ? hasSpin
            ? "Tour 360° con video real: arrastra a tu ritmo para ver cada detalle."
            : "Este vehículo aún no tiene tour 360°."
          : tab === "interior"
            ? "Explora el interior y toca los puntos destacados."
            : tab === "informe"
              ? "Cada auto pasa por una inspección mecánica de 150 puntos."
              : "Fotografías reales del vehículo."}
      </p>
    </div>
  );
}
