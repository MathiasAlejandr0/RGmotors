"use client";

import { useMemo, useState } from "react";
import { vehicles, formatCLP } from "@/lib/vehicles";

const MONTHLY_RATE = 0.019;

export default function SimuladorPage() {
  const [price, setPrice] = useState(18990000);
  const [downPct, setDownPct] = useState(20);
  const [term, setTerm] = useState(48);
  const [sent, setSent] = useState(false);

  const r = useMemo(() => {
    const down = Math.round((price * downPct) / 100);
    const financed = price - down;
    const i = MONTHLY_RATE;
    const monthly = financed > 0 ? (financed * i) / (1 - Math.pow(1 + i, -term)) : 0;
    const total = monthly * term + down;
    const cae = (Math.pow(1 + i, 12) - 1) * 100;
    return {
      down,
      financed,
      monthly: Math.round(monthly),
      total: Math.round(total),
      cae,
    };
  }, [price, downPct, term]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Simulador de crédito automotriz</h1>
        <p className="mt-2 text-white/50">
          Calcula tu cuota al instante, con CAE y costo total transparente.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Inputs */}
        <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-6">
          <label className="text-sm text-white/60">Vehículo o precio</label>
          <select
            onChange={(e) => setPrice(Number(e.target.value))}
            defaultValue={price}
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
          >
            {vehicles.map((v) => (
              <option key={v.slug} value={v.price}>
                {v.brand} {v.model} {v.year} — {formatCLP(v.price)}
              </option>
            ))}
          </select>

          <div className="mt-6">
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-white/60">Valor del vehículo</span>
              <span className="font-medium">{formatCLP(price)}</span>
            </div>
            <input
              type="range"
              min={5000000}
              max={30000000}
              step={500000}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full accent-brand-500"
            />
          </div>

          <div className="mt-6">
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-white/60">Pie ({downPct}%)</span>
              <span className="font-medium">{formatCLP(r.down)}</span>
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

          <div className="mt-6">
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

        {/* Result */}
        <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-b from-brand-500/10 to-transparent p-6">
          <p className="text-sm text-white/50">Tu cuota mensual estimada</p>
          <p className="mt-1 text-5xl font-extrabold text-brand-300">
            {formatCLP(r.monthly)}
          </p>

          <div className="mt-6 space-y-3">
            <Row label="Monto financiado" value={formatCLP(r.financed)} />
            <Row label="Tasa mensual" value={`${(MONTHLY_RATE * 100).toFixed(2)}%`} />
            <Row label="CAE aproximada" value={`${r.cae.toFixed(1)}%`} />
            <Row label="Costo total del crédito" value={formatCLP(r.total)} highlight />
          </div>

          {sent ? (
            <div className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm">
              <p className="font-semibold text-emerald-300">¡Solicitud enviada! ✓</p>
              <p className="mt-1 text-white/70">
                Un ejecutivo revisará tu perfil y te contactará con tu evaluación
                en menos de 24 horas hábiles.
              </p>
            </div>
          ) : (
            <button
              onClick={() => setSent(true)}
              className="mt-6 w-full rounded-xl bg-brand-500 py-3 font-semibold text-white transition hover:bg-brand-400"
            >
              Solicitar crédito
            </button>
          )}

          <p className="mt-3 text-[11px] leading-relaxed text-white/40">
            Simulación referencial. La tasa y cuota definitiva dependen de la
            evaluación crediticia de la financiera. No constituye una oferta.
          </p>
        </div>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between border-b border-white/10 pb-3 ${
        highlight ? "text-white" : "text-white/70"
      }`}
    >
      <span className="text-sm">{label}</span>
      <span className={`font-semibold ${highlight ? "text-lg" : ""}`}>{value}</span>
    </div>
  );
}
