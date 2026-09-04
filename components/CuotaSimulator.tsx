"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatCLP } from "@/lib/vehicles";
import {
  AUTOFIN_DEFAULT_MONTHLY_RATE,
  CREDIT_RULES,
  simulateCredit,
} from "@/lib/finance/autofin";

type Props = {
  price: number;
  vehicleYear?: number;
  vehicleSlug?: string;
};

export default function CuotaSimulator({ price, vehicleYear, vehicleSlug }: Props) {
  const [downPct, setDownPct] = useState(20);
  const [term, setTerm] = useState(48);
  const [rate, setRate] = useState(AUTOFIN_DEFAULT_MONTHLY_RATE);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.preferences?.monthlyInterestRate) {
          setRate(Number(data.preferences.monthlyInterestRate));
        }
      })
      .catch(() => {});
  }, []);

  const sim = useMemo(
    () =>
      simulateCredit({
        price,
        downPct,
        termMonths: term,
        monthlyRate: rate,
        vehicleYear,
      }),
    [price, downPct, term, rate, vehicleYear],
  );

  const simuladorHref = vehicleSlug
    ? `/simulador?auto=${encodeURIComponent(vehicleSlug)}`
    : "/simulador";

  return (
    <div className="apple-glass-card rounded-3xl p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-bold tracking-tight text-white">Simular crédito Autofin</h3>
        <span className="rounded-full border border-brand-400/30 bg-brand-400/10 px-3 py-1 text-[11px] font-semibold text-brand-300">
          Referencial
        </span>
      </div>

      <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-amber-100/85">
        Esta cuota es una <b>preidea</b>. En sucursal, Autofin puede confirmarla o{" "}
        <b>aumentar</b> el valor según evaluación y seguros.
      </div>

      <div className="space-y-5">
        <div>
          <div className="mb-2 flex justify-between text-xs font-semibold">
            <span className="text-white/60">Pie ({sim.downPct}%)</span>
            <span className="font-bold text-white">{formatCLP(sim.downPayment)}</span>
          </div>
          <input
            type="range"
            min={CREDIT_RULES.minDownPct}
            max={CREDIT_RULES.maxDownPct}
            step={5}
            value={Math.max(CREDIT_RULES.minDownPct, downPct)}
            onChange={(e) => setDownPct(Number(e.target.value))}
            className="apple-range w-full cursor-pointer"
          />
        </div>
        <div>
          <div className="mb-2 flex justify-between text-xs font-semibold">
            <span className="text-white/60">Plazo</span>
            <span className="font-bold text-white">{sim.termMonths} meses</span>
          </div>
          <input
            type="range"
            min={CREDIT_RULES.minTermMonths}
            max={CREDIT_RULES.maxTermMonths}
            step={CREDIT_RULES.termStep}
            value={Math.min(CREDIT_RULES.maxTermMonths, term)}
            onChange={(e) => setTerm(Number(e.target.value))}
            className="apple-range w-full cursor-pointer"
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/50 p-5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-white/45">
          Cuota mensual referencial
        </p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight text-brand-300">
          {formatCLP(sim.monthlyPayment)}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center text-xs">
          <div>
            <p className="text-[10px] uppercase text-white/40">Financiado</p>
            <p className="mt-0.5 font-bold text-white/90">{formatCLP(sim.financed)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-white/40">CAE aprox.</p>
            <p className="mt-0.5 font-bold text-white/90">{sim.caeWithFeesApprox.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-white/40">Total est.</p>
            <p className="mt-0.5 font-bold text-white/90">{formatCLP(sim.totalCostWithDown)}</p>
          </div>
        </div>
      </div>

      <Link
        href={simuladorHref}
        className="apple-btn-primary mt-4 flex w-full items-center justify-center rounded-full py-3 text-xs font-bold text-white shadow-glow"
      >
        Completar simulación y dejar datos
      </Link>
    </div>
  );
}
