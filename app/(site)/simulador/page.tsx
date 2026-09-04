"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import OwnCreditSimulator from "@/components/OwnCreditSimulator";

function SimuladorInner() {
  const params = useSearchParams();
  const auto = params.get("auto") || undefined;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-8 text-center sm:mb-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-3.5 py-1 text-[11px] font-bold text-brand-300">
          Financiamiento Autofin · RG Motors
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Simula tu crédito automotriz
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
          RG Motors vende el vehículo; el crédito lo otorga Autofin. Esta calculadora usa la
          misma lógica de referencia del mercado Autofin (pie, plazo y cuota fija) para que
          llegues a sucursal con una preidea cercana. Los datos quedan en RG Motors.
        </p>
      </div>

      <OwnCreditSimulator initialVehicleSlug={auto} />
    </main>
  );
}

export default function SimuladorPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-6xl px-4 py-20 text-center text-white/50">
          Cargando simulador…
        </main>
      }
    >
      <SimuladorInner />
    </Suspense>
  );
}
