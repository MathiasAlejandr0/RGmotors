"use client";

import { COMPANY, whatsappLink } from "@/lib/company";

export default function ShowroomMapSection({ className = "" }: { className?: string }) {
  const gmapsUrl = "https://www.google.com/maps/search/?api=1&query=Cardonal,+Puerto+Montt,+Chile";
  const wazeUrl = "https://waze.com/ul?q=Cardonal+Puerto+Montt";

  return (
    <section className={`rounded-3xl border border-white/10 bg-ink-800/60 p-6 sm:p-8 backdrop-blur-xl space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-3 py-1 text-[11px] font-bold text-brand-300 mb-2.5">
            <span>📍</span> Ubicación & Sucursales Físicas
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Encuéntranos en Puerto Montt
          </h2>
          <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-xl">
            Ven a revisar los vehículos en persona, probarlos en ruta y recibir asesoría comercial directa en nuestras sucursales.
          </p>
        </div>

        {/* Quick Nav Links */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={gmapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 hover:border-brand-500/50"
          >
            <span>🗺️</span> Google Maps
          </a>
          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 hover:border-blue-400/50"
          >
            <span>🚗</span> Waze
          </a>
          <a
            href={whatsappLink("Hola RG Motors, quiero coordinar una visita a su sucursal de Puerto Montt.")}
            target="_blank"
            rel="noopener noreferrer"
            className="apple-btn-primary flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold text-white shadow-glow"
          >
            <span>💬</span> Coordinar Visita
          </a>
        </div>
      </div>

      {/* Grid: Map + Locations info */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] items-stretch">
        {/* Google Maps Iframe */}
        <div className="relative min-h-[320px] lg:min-h-[400px] w-full overflow-hidden rounded-2xl border border-white/15 shadow-xl bg-ink-950">
          <iframe
            title="Mapa Ubicación RG Motors Puerto Montt"
            src="https://maps.google.com/maps?q=Cardonal,+Puerto+Montt,+Los+Lagos,+Chile&t=&z=14&ie=UTF8&iwloc=&output=embed"
            className="absolute inset-0 h-full w-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Sucursales Info Cards */}
        <div className="space-y-3.5 flex flex-col justify-between">
          <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-600/15 via-ink-900 to-black p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-brand-300">Sucursal Principal Cardonal</span>
              <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-bold text-brand-200">Showroom</span>
            </div>
            <p className="text-xs font-bold text-white">Av. Cardonal, Puerto Montt</p>
            <p className="text-[11px] text-white/60 leading-relaxed">
              Exhibición principal de camionetas 4x4, SUVs y vehículos de trabajo seleccionados.
            </p>
            <p className="text-[10px] text-white/40 pt-1">
              🕒 {COMPANY.hours}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white/90">Sucursal Salgado</span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60">Taller & Retomas</span>
            </div>
            <p className="text-xs text-white/80">Sector Salgado, Puerto Montt</p>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Punto de evaluación técnica de retomas, inspección de 150 puntos y consignaciones.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white/90">Sucursal Unidades Chile</span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60">Patio de Stock</span>
            </div>
            <p className="text-xs text-white/80">Puerto Montt, Región de Los Lagos</p>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Patio de preparación de unidades, sesión fotográfica y entrega inmediata garantizada.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
