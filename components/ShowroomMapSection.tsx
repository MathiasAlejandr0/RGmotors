"use client";

import { COMPANY, whatsappLink } from "@/lib/company";

export default function ShowroomMapSection({ className = "" }: { className?: string }) {
  // Coordenadas exactas del ex Edificio Banco de Chile en Ruta 226 / Av. El Tepual, Puerto Montt
  const lat = -41.4636;
  const lng = -72.9794;
  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const wazeUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;

  return (
    <section className={`rounded-3xl border border-white/10 bg-ink-800/60 p-6 sm:p-8 backdrop-blur-xl space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-3.5 py-1 text-[11px] font-bold text-brand-300 mb-2.5">
            <span>📍</span> Ubicación Showroom Oficial
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Visítanos en RG Motors · Puerto Montt
          </h2>
          <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-xl">
            Ven a revisar los vehículos en persona, probarlos en ruta y recibir asesoría presencial en nuestro showroom de Av. El Tepual (Ex Banco de Chile).
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
            <span>🗺️</span> Abrir en Google Maps
          </a>
          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 hover:border-blue-400/50"
          >
            <span>🚗</span> Abrir en Waze
          </a>
          <a
            href={whatsappLink("Hola RG Motors, quiero coordinar una visita a su showroom de Av. El Tepual (Ex Banco de Chile) en Puerto Montt.")}
            target="_blank"
            rel="noopener noreferrer"
            className="apple-btn-primary flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold text-white shadow-glow"
          >
            <span>💬</span> Coordinar Visita
          </a>
        </div>
      </div>

      {/* Grid: Map + Location Info */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] items-stretch">
        {/* Google Maps Iframe */}
        <div className="relative min-h-[340px] lg:min-h-[420px] w-full overflow-hidden rounded-2xl border border-white/15 shadow-xl bg-ink-950">
          <iframe
            title="Ubicación RG Motors Puerto Montt - Av. El Tepual (Ex Banco de Chile)"
            src={`https://maps.google.com/maps?q=${lat},${lng}&t=&z=17&ie=UTF8&iwloc=&output=embed`}
            className="absolute inset-0 h-full w-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Card de la Sucursal Oficial */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-600/15 via-ink-900 to-black p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-brand-300">RG Motors · Showroom Oficial</span>
              <span className="rounded-full bg-brand-500/20 px-2.5 py-0.5 text-[10px] font-bold text-brand-200">Showroom</span>
            </div>
            
            <div>
              <p className="text-sm font-bold text-white">Av. El Tepual (Ex Banco de Chile)</p>
              <p className="text-xs text-white/50">Puerto Montt, Región de Los Lagos</p>
            </div>

            <p className="text-xs text-white/65 leading-relaxed">
              Exhibición de camionetas 4x4, SUVs y vehículos seleccionados. Ubicados en Av. El Tepual (Ex Banco de Chile), a pasos del trébol con Ruta 5 Sur. Contamos con amplio patio de exhibición, estacionamiento para clientes y pruebas de manejo.
            </p>

            <div className="border-t border-white/10 pt-3 space-y-2 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <span>🕒</span>
                <span><b>Horario:</b> {COMPANY.hours}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📞</span>
                <span><b>Contacto directo:</b> {COMPANY.phoneDisplay}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-4 text-xs text-white/60 space-y-2">
            <p className="font-semibold text-white/90">¿Cómo llegar?</p>
            <p className="text-[11px] leading-relaxed text-white/50">
              Ubicados estratégicamente a pasos del enlace de Ruta 5 Sur con Av. Cardonal y El Tepual, de fácil acceso vehicular desde cualquier punto de Puerto Montt, Puerto Varas o alrededores.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
