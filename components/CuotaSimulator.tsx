"use client";

import { useMemo, useState, useEffect } from "react";
import { formatCLP } from "@/lib/vehicles";

type Props = {
  price: number;
};

export default function CuotaSimulator({ price }: Props) {
  const [downPct, setDownPct] = useState(20);
  const [term, setTerm] = useState(48);
  const [rate, setRate] = useState(0.019);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.preferences?.monthlyInterestRate) {
          setRate(data.preferences.monthlyInterestRate);
        }
      })
      .catch(() => {});
  }, []);

  const { down, financed, monthly, total, cae } = useMemo(() => {
    const down = Math.round((price * downPct) / 100);
    const financed = price - down;
    const i = rate;
    // Cuota francesa
    const monthly =
      financed > 0
        ? Math.round((financed * i) / (1 - Math.pow(1 + i, -term)))
        : 0;
    const total = monthly * term + down;
    const cae = (Math.pow(1 + i, 12) - 1) * 100; // aproximación anual
    return { down, financed, monthly, total, cae };
  }, [price, downPct, term, rate]);

  return (
    <div className="apple-glass-card rounded-3xl p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-base font-bold tracking-tight text-white">Simulador de crédito</h3>
        <span className="flex items-center gap-1.5 rounded-full border border-brand-400/30 bg-brand-400/10 px-3 py-1 text-[11px] font-semibold text-brand-300 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
          En tiempo real
        </span>
      </div>

      <div className="space-y-5">
        <div>
          <div className="mb-2 flex justify-between text-xs font-semibold">
            <span className="text-white/60">Pie inicial ({downPct}%)</span>
            <span className="text-white font-bold">{formatCLP(down)}</span>
          </div>
          <input
            type="range"
            min={10}
            max={60}
            step={5}
            value={downPct}
            onChange={(e) => setDownPct(Number(e.target.value))}
            className="apple-range w-full cursor-pointer"
          />
        </div>

        <div>
          <div className="mb-2 flex justify-between text-xs font-semibold">
            <span className="text-white/60">Plazo ({term} meses)</span>
            <span className="text-white font-bold">{term / 12} años</span>
          </div>
          <input
            type="range"
            min={12}
            max={60}
            step={12}
            value={term}
            onChange={(e) => setTerm(Number(e.target.value))}
            className="apple-range w-full cursor-pointer"
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/50 p-5 backdrop-blur-md">
        <p className="text-[11px] font-medium uppercase tracking-wider text-white/45">Cuota mensual estimada</p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight text-brand-300">
          {formatCLP(monthly)}
        </p>
        
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center text-xs">
          <div>
            <p className="text-[10px] text-white/40 font-medium uppercase">Financiado</p>
            <p className="mt-0.5 font-bold text-white/90">{formatCLP(financed)}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/40 font-medium uppercase">CAE aprox.</p>
            <p className="mt-0.5 font-bold text-white/90">{cae.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-[10px] text-white/40 font-medium uppercase">Costo total</p>
            <p className="mt-0.5 font-bold text-white/90">{formatCLP(total)}</p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[10px] leading-relaxed text-white/40 text-center">
        Simulación referencial sujeta a evaluación de antecedentes comerciales por la entidad crediticia.
      </p>
    </div>
  );
}
