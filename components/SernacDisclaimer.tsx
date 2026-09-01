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
        Las simulaciones de crédito, valores de cuota mensual, tasas de interés referenciales (estimadas entre 1,2% y 2,4% mensual),
        Carga Anual Equivalente (CAE) y Costo Total del Crédito (CTC) exhibidos en esta plataforma son de carácter exclusivamente ilustrativo y no constituyen una oferta formal ni aprobación vinculante.
      </p>

      <p className="text-[11px] text-white/60">
        La aprobación final, tasa de interés aplicable, costos asociados (seguro de desgravamen, gastos notariales e inscripción) y plazo definitivo están sujetos a la evaluación crediticia, verificación de ingresos y políticas de riesgo de las instituciones financieras asociadas reguladas por la CMF (Comisión para el Mercado Financiero), tales como Santander Consumer, Forum Servicios Financieros, Tanner, Autofin o Banco Falabella.
      </p>

      <div className="flex flex-wrap items-center justify-between border-t border-white/10 pt-2 text-[10px] text-white/40">
        <span>RG Motors Puerto Montt · Calidad y Transparencia Automotriz</span>
        <span>Conforme a la Ley de Protección de los Derechos de los Consumidores</span>
      </div>
    </div>
  );
}
