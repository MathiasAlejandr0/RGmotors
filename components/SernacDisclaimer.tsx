import React from "react";

export default function SernacDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5 text-left text-xs leading-relaxed text-white/50 backdrop-blur-md space-y-2.5 ${className}`}
    >
      <div className="flex items-center gap-2 text-white/80 font-bold text-[11px] uppercase tracking-wider">
        <span className="text-sm">⚖️</span>
        <span>Información Legal y Transparencia Financiera (SERNAC / Ley N° 19.496)</span>
      </div>

      <p className="text-[11px] text-white/60">
        Las simulaciones de crédito de este sitio son referenciales. Usan la misma lógica de
        mercado que partners Autofin (pie desde 20%, hasta 48 cuotas, tasa referencial). La
        cuota o el costo total <b className="text-white/70">puede coincidir o aumentar</b> al
        formalizar con Autofin en sucursal (evaluación, seguros, campaña).
      </p>

      <p className="text-[11px] text-white/60">
        El crédito lo otorga Autofin. RG Motors comercializa el vehículo y captura tus datos
        solo para contacto y análisis propios. Solicita siempre la información formal (FIEL)
        antes de firmar.
      </p>

      <div className="flex flex-wrap items-center justify-between border-t border-white/10 pt-2 text-[10px] text-white/40">
        <span>RG Motors Puerto Montt · Calidad y Transparencia Automotriz</span>
        <span>Conforme a la Ley de Protección de los Derechos de los Consumidores</span>
      </div>
    </div>
  );
}
