"use client";

import Link from "next/link";
import { MouseEvent, useRef } from "react";
import { asset } from "@/lib/asset";
import { Vehicle, formatCLP, estimateMonthly } from "@/lib/vehicles";

export default function VehicleCard({ vehicle: v }: { vehicle: Vehicle }) {
  const cardRef = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  const has360 = Boolean(v.spin && v.spin.count > 0);
  const hasRealPhotos = Boolean(
    v.hasRealPhotos &&
    v.gallery &&
    v.gallery.length > 0 &&
    v.image &&
    !v.image.includes("placeholder-pending-car")
  );
  const displayImage = hasRealPhotos
    ? asset(v.image)
    : asset("/images/placeholder-pending-car.svg");

  return (
    <Link
      ref={cardRef}
      onMouseMove={handleMouseMove}
      href={`/vehiculo/${v.slug}`}
      className="apple-glass-card apple-glass-glow group flex flex-col overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-apple-hover"
    >
      {/* Vehicle Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-ink-800 to-ink-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayImage}
          alt={`${v.brand} ${v.model}`}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = asset("/images/placeholder-pending-car.svg");
          }}
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80" />

        {hasRealPhotos ? (
          <span className="absolute left-3.5 top-3.5 flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-black/70 px-2.5 py-1 text-[10px] font-semibold text-emerald-300 backdrop-blur-md shadow-sm z-10">
            <span>📸</span> Fotos Reales de Patio
          </span>
        ) : (
          <span className="absolute left-3.5 top-3.5 flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-black/70 px-2.5 py-1 text-[10px] font-semibold text-amber-300 backdrop-blur-md shadow-sm z-10">
            <span>⏳</span> Fotos en preparación
          </span>
        )}

        {v.featured && (
          <span className="absolute right-3.5 top-3.5 rounded-full bg-brand-500/90 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md shadow-glow z-10">
            Destacado
          </span>
        )}
      </div>

      {/* Vehicle Information */}
      <div className="flex flex-1 flex-col p-5 relative z-10">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-base font-bold tracking-tight text-white group-hover:text-brand-300 transition-colors">
            {v.brand} {v.model}
          </h3>
          <span className="text-xs font-semibold text-white/40">{v.plate ? `${v.plate} · ` : ""}{v.year}</span>
        </div>
        <p className="mt-0.5 text-xs text-white/50">{v.version}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[11px] font-medium text-white/70">
            {v.km.toLocaleString("es-CL")} km
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[11px] font-medium text-white/70">
            {v.fuel}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[11px] font-medium text-white/70">
            {v.transmission}
          </span>
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xl font-extrabold tracking-tight text-white">
                {v.price > 0 ? formatCLP(v.price) : "Consultar precio"}
              </p>
              {v.price > 0 ? (
                <p className="text-[11px] text-white/45">
                  o cuota desde <span className="text-brand-300 font-medium">{formatCLP(estimateMonthly(v.price))}</span>/mes
                </p>
              ) : (
                <p className="text-[11px] text-brand-300/80">
                  Unidad física en evaluación comercial
                </p>
              )}
            </div>
          </div>

          <span className="mt-4 flex items-center justify-center gap-1.5 w-full rounded-2xl border border-white/10 bg-white/[0.06] py-2.5 text-xs font-semibold text-white transition-all duration-200 group-hover:border-brand-500/50 group-hover:bg-brand-500 group-hover:shadow-glow">
            Ver vehículo & Fotos
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
