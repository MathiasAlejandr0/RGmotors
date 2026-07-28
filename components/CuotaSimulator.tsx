"use client";

import { useMemo, useState } from "react";
import { formatCLP } from "@/lib/vehicles";

type Props = {
  price: number;
};

const MONTHLY_RATE = 0.019; // tasa mensual referencial (~1.9%)

export default function CuotaSimulator({ price }: Props) {
  const [downPct, setDownPct] = useState(20);
  const [term, setTerm] = useState(48);

  const { down, financed, monthly, total, cae } = useMemo(() => {
    const down = Math.round((price * downPct) / 100);
    const financed = price - down;
    const i = MONTHLY_RATE;
    // Cuota francesa
    const monthly =
      financed > 0
        ? Math.round((financed * i) / (1 - Math.pow(1 + i, -term)))
        : 0;
    const total = monthly * term + down;
    const cae = (Math.pow(1 + i, 12) - 1) * 100; // aproximación anual
    return { down, financed, monthly, total, cae };
  }, [price, downPct, term]);

  return (
    <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Simula tu crédito</h3>
        <span className="rounded-full bg-brand-500/20 px-2.5 py-1 text-xs text-brand-300">
          En tiempo real
        </span>
      </div>

      <div className="space-y-5">
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-white/60">Pie ({downPct}%)</span>
            <span className="font-medium">{formatCLP(down)}</span>
          </div>
          <input
            type="range"
            min={10}
            max={60}
            step={5}
            value={downPct}
            onChange={(e) => setDownPct(Number(e.target.value))}
            className="w-full accent-brand-500"
          />
        </div>

        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-white/60">Plazo</span>
            <span className="font-medium">{term} cuotas</span>
          </div>
          <input
            type="range"
            min={12}
            max={60}
            step={6}
            value={term}
            onChange={(e) => setTerm(Number(e.target.value))}
            className="w-full accent-brand-500"
          />
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-ink-900 p-4">
        <p className="text-sm text-white/50">Cuota mensual estimada</p>
        <p className="mt-1 text-3xl font-bold text-brand-300">
          {formatCLP(monthly)}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-center text-xs">
          <div>
            <p className="text-white/40">Monto financiado</p>
            <p className="mt-0.5 font-medium">{formatCLP(financed)}</p>
          </div>
          <div>
            <p className="text-white/40">CAE aprox.</p>
            <p className="mt-0.5 font-medium">{cae.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-white/40">Costo total</p>
            <p className="mt-0.5 font-medium">{formatCLP(total)}</p>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-white/40">
        Simulación referencial. La tasa y cuota definitiva dependen de la
        evaluación crediticia de la financiera. No constituye una oferta.
      </p>
    </div>
  );
}
