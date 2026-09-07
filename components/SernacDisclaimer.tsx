import React from "react";
import { CREDIT_QUOTE_COPY } from "@/lib/finance/autofin";

export default function SernacDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5 text-left text-xs leading-relaxed text-white/50 backdrop-blur-md space-y-2.5 ${className}`}
    >
      <div className="flex items-center gap-2 text-white/80 font-bold text-[11px] uppercase tracking-wider">
        <span className="text-sm">⚖️</span>
        <span>Información Legal y Transparencia Financiera (SERNAC / Ley N° 19.496)</span>
      </div>

      <p className="text-[11px] text-white/60">{CREDIT_QUOTE_COPY.longDisclaimer}</p>

      <p className="text-[11px] text-white/60">
        El crédito lo otorga Autofin. RG Motors comercializa el vehículo. Solicita siempre la
        información formal (FIEL) y la documentación oficial antes de firmar.
      </p>

      <div className="flex flex-wrap items-center justify-between border-t border-white/10 pt-2 text-[10px] text-white/40">
        <span>RG Motors Puerto Montt · Calidad y Transparencia Automotriz</span>
        <span>Conforme a la Ley de Protección de los Derechos de los Consumidores</span>
      </div>
    </div>
  );
}
