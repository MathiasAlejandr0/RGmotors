"use client";

import { useMemo, useState } from "react";
import { vehicles, formatCLP, Vehicle } from "@/lib/vehicles";
import FastCreditPreApprovalModal from "@/components/FastCreditPreApprovalModal";

const MONTHLY_RATE = 0.019;

export default function SimuladorPage() {
  const [selectedSlug, setSelectedSlug] = useState(vehicles[0]?.slug || "");
  const [price, setPrice] = useState(vehicles[0]?.price || 18990000);
  const [downPct, setDownPct] = useState(20);
  const [term, setTerm] = useState(48);
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);

  const selectedVehicle: Vehicle | undefined = vehicles.find((v) => v.slug === selectedSlug);

  const handleVehicleChange = (slug: string) => {
    setSelectedSlug(slug);
    const found = vehicles.find((v) => v.slug === slug);
    if (found) setPrice(found.price);
  };

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
    <>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-3.5 py-1 text-[11px] font-bold text-brand-300 mb-3">
            ⚡ Simulación de Crédito Online
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Simulador de crédito automotriz
          </h1>
          <p className="mt-2 text-sm text-white/50 max-w-lg mx-auto">
            Calcula tu cuota al instante y envía tu simulación a nuestro equipo para recibir una cotización a la brevedad.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 items-start">
          {/* Inputs */}
          <div className="apple-glass-card rounded-3xl p-7 space-y-6">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Vehículo del catálogo
              </label>
              <select
                onChange={(e) => handleVehicleChange(e.target.value)}
                value={selectedSlug}
                className="mt-2 w-full rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 text-xs font-medium text-white outline-none focus:border-brand-500 transition cursor-pointer"
              >
                {vehicles.map((v) => (
                  <option key={v.slug} value={v.slug} className="bg-ink-900">
                    {v.brand} {v.model} {v.year} — {formatCLP(v.price)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-xs font-semibold">
                <span className="text-white/60">Valor del vehículo</span>
                <span className="text-white font-bold">{formatCLP(price)}</span>
              </div>
              <input
                type="range"
                min={5000000}
                max={30000000}
                step={500000}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="apple-range w-full cursor-pointer"
              />
            </div>

            <div>
              <div className="mb-2 flex justify-between text-xs font-semibold">
                <span className="text-white/60">Pie inicial ({downPct}%)</span>
                <span className="text-white font-bold">{formatCLP(r.down)}</span>
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
                <span className="text-white/60">Plazo ({term} cuotas)</span>
                <span className="text-white font-bold">{term} meses</span>
              </div>
              <input
                type="range"
                min={12}
                max={60}
                step={6}
                value={term}
                onChange={(e) => setTerm(Number(e.target.value))}
                className="apple-range w-full cursor-pointer"
              />
            </div>
          </div>

          {/* Result */}
          <div className="apple-glass-card relative overflow-hidden rounded-3xl p-7 border-brand-500/30 bg-gradient-to-br from-brand-500/15 via-ink-900/90 to-black">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Tu cuota mensual estimada</p>
            <p className="mt-2 text-5xl font-extrabold tracking-tight text-brand-300">
              {formatCLP(r.monthly)}
            </p>

            <div className="mt-8 space-y-3.5 border-t border-white/10 pt-6">
              <Row label="Monto a financiar" value={formatCLP(r.financed)} />
              <Row label="Tasa de interés mensual referencial" value={`${(MONTHLY_RATE * 100).toFixed(2)}%`} />
              <Row label="CAE aproximada" value={`${r.cae.toFixed(1)}%`} />
              <Row label="Costo total estimado" value={formatCLP(r.total)} highlight />
            </div>

            <button
              onClick={() => setIsSimulationOpen(true)}
              className="apple-btn-primary mt-8 flex items-center justify-center gap-2 w-full rounded-full py-3.5 text-xs font-bold text-white shadow-glow"
            >
              <span>⚡</span> Solicitar simulación a nuestro equipo
            </button>

            <p className="mt-4 text-[11px] leading-relaxed text-white/50 text-center">
              Tu simulación será enviada a nuestro equipo de ventas y te responderemos a la brevedad a tu correo electrónico con las mejores opciones de financiamiento.
            </p>
          </div>
        </div>
      </main>

      <FastCreditPreApprovalModal
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        targetVehicle={selectedVehicle}
      />
    </>
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
      className={`flex items-center justify-between border-b border-white/[0.08] pb-3 ${
        highlight ? "text-white" : "text-white/70"
      }`}
    >
      <span className="text-xs font-medium">{label}</span>
      <span className={`font-bold ${highlight ? "text-base text-brand-300" : "text-xs"}`}>{value}</span>
    </div>
  );
}
