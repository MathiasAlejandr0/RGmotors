"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { formatCLP, vehicles as initialVehicles, type Vehicle } from "@/lib/vehicles";
import {
  AUTOFIN_DEFAULT_MONTHLY_RATE,
  CREDIT_RULES,
  VEHICLE_TYPES,
  type VehicleTypeId,
  matchVehicleType,
  simulateCredit,
} from "@/lib/finance/autofin";
import { getTrafficSource } from "@/lib/trafficTracking";
import { whatsappLink } from "@/lib/company";
import SernacDisclaimer from "@/components/SernacDisclaimer";

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  const key = "rg_sim_session";
  try {
    let id = localStorage.getItem(key);
    if (!id) {
      id = `sim_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return `sim_${Date.now().toString(36)}`;
  }
}

type Props = { initialVehicleSlug?: string };

export default function OwnCreditSimulator({ initialVehicleSlug }: Props) {
  const [vehiclesData, setVehiclesData] = useState<Vehicle[]>(initialVehicles);
  const [vehicleType, setVehicleType] = useState<VehicleTypeId>("camioneta");
  const [selectedSlug, setSelectedSlug] = useState(initialVehicleSlug || "");
  const [price, setPrice] = useState(12_000_000);
  const [downPct, setDownPct] = useState(20);
  const [term, setTerm] = useState(48);
  const [rate, setRate] = useState(AUTOFIN_DEFAULT_MONTHLY_RATE);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const sessionId = useRef(getSessionId());
  const lastTrackKey = useRef("");

  const filteredVehicles = useMemo(() => {
    return vehiclesData.filter((v) => matchVehicleType(v.bodyType) === vehicleType);
  }, [vehiclesData, vehicleType]);

  useEffect(() => {
    fetch("/api/vehicles")
      .then((r) => r.json())
      .then((data) => {
        if (!data?.vehicles?.length) return;
        setVehiclesData(data.vehicles);
        const preferred =
          (initialVehicleSlug &&
            data.vehicles.find((v: Vehicle) => v.slug === initialVehicleSlug)) ||
          data.vehicles[0];
        if (preferred) {
          setSelectedSlug(preferred.slug);
          setPrice(preferred.price);
          setVehicleType(matchVehicleType(preferred.bodyType));
        }
      })
      .catch(() => {});

    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.preferences?.monthlyInterestRate) {
          setRate(Number(data.preferences.monthlyInterestRate));
        }
      })
      .catch(() => {});
  }, [initialVehicleSlug]);

  const selectedVehicle =
    vehiclesData.find((v) => v.slug === selectedSlug) ||
    filteredVehicles[0] ||
    vehiclesData[0];

  useEffect(() => {
    if (!filteredVehicles.length) return;
    const stillInType = filteredVehicles.some((v) => v.slug === selectedSlug);
    if (!stillInType) {
      setSelectedSlug(filteredVehicles[0]!.slug);
      setPrice(filteredVehicles[0]!.price);
    }
  }, [filteredVehicles, selectedSlug]);

  const sim = useMemo(
    () =>
      simulateCredit({
        price,
        downPct,
        termMonths: term,
        monthlyRate: rate,
        vehicleYear: selectedVehicle?.year,
        vehicleType,
      }),
    [price, downPct, term, rate, selectedVehicle?.year, vehicleType],
  );

  const trackCalc = useCallback(async () => {
    const key = [selectedSlug, sim.downPayment, sim.termMonths, sim.monthlyPayment].join("|");
    if (key === lastTrackKey.current) return;
    lastTrackKey.current = key;
    try {
      await fetch("/api/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId.current,
          eventType: "view_calc",
          source: "simulador",
          vehicleSlug: selectedSlug || undefined,
          vehiclePrice: price,
          vehicleYear: selectedVehicle?.year,
          productId: "autofin",
          downPct: sim.downPct,
          downPayment: sim.downPayment,
          termMonths: sim.termMonths,
          monthlyPayment: sim.monthlyPayment,
          financed: sim.financed,
          monthlyRate: sim.monthlyRate,
          caeApprox: sim.caeWithFeesApprox,
          trafficSource: getTrafficSource(),
        }),
      });
    } catch {
      /* ignore */
    }
  }, [selectedSlug, sim, price, selectedVehicle?.year]);

  useEffect(() => {
    const t = setTimeout(() => void trackCalc(), 800);
    return () => clearTimeout(t);
  }, [trackCalc]);

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      setError("Completa nombre, teléfono y correo.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        sessionId: sessionId.current,
        eventType: "lead_submit",
        source: "simulador",
        vehicleSlug: selectedSlug || undefined,
        vehiclePrice: price,
        vehicleYear: selectedVehicle?.year,
        productId: "autofin",
        downPct: sim.downPct,
        downPayment: sim.downPayment,
        termMonths: sim.termMonths,
        monthlyPayment: sim.monthlyPayment,
        financed: sim.financed,
        monthlyRate: sim.monthlyRate,
        caeApprox: sim.caeWithFeesApprox,
        clientName: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        trafficSource: getTrafficSource(),
        website: honeypot,
      };

      const [simRes, creditRes] = await Promise.all([
        fetch("/api/simulations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        fetch("/api/credits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientName: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            vehicleSlug: selectedSlug || "simulacion-general",
            downPct: sim.downPct,
            downPayment: sim.downPayment,
            term: sim.termMonths,
            monthlyEstimate: sim.monthlyPayment,
            trafficSource: getTrafficSource(),
            notes: `Simulación RG × Autofin · tipo ${vehicleType} · tasa ${(sim.monthlyRate * 100).toFixed(2)}%`,
          }),
        }),
      ]);

      if (!simRes.ok && !creditRes.ok) {
        const data = await creditRes.json().catch(() => ({}));
        setError(data.error || "No se pudo guardar. Intenta de nuevo.");
        return;
      }
      setSent(true);
    } catch {
      setError("Error de conexión. Intenta nuevamente o escríbenos por WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="apple-glass-card mx-auto max-w-lg rounded-3xl border-emerald-500/30 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-2xl font-bold text-emerald-400">
          ✓
        </div>
        <h2 className="mt-4 text-xl font-bold text-emerald-400">Simulación recibida</h2>
        <p className="mt-2 text-xs leading-relaxed text-white/70">
          Gracias, <b>{name}</b>. Registramos tu cuota referencial de{" "}
          <b>{formatCLP(sim.monthlyPayment)}</b>. Un asesor te contactará; en sucursal se
          formaliza con Autofin.
        </p>
        <a
          href={whatsappLink(
            `Hola RG Motors, envié una simulación. Cuota ref. ${formatCLP(sim.monthlyPayment)} · pie ${formatCLP(sim.downPayment)} · ${sim.termMonths} meses.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex rounded-full bg-[#25D366] px-6 py-3 text-xs font-semibold text-white"
        >
          Seguir por WhatsApp
        </a>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-4 block w-full text-xs text-white/40 hover:text-white"
        >
          Hacer otra simulación
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Advertencia principal */}
      <div className="rounded-2xl border border-amber-400/35 bg-amber-500/10 px-4 py-3.5 text-sm leading-relaxed text-amber-100/90 sm:px-5">
        <p className="font-bold text-amber-200">Importante — simulación referencial</p>
        <p className="mt-1 text-xs sm:text-[13px] text-amber-100/80">
          El valor de cuota que ves aquí es una <b>referencia</b> calculada con la misma lógica
          de mercado que usa Autofin (pie desde 20%, hasta 48 cuotas, tasa referencial). Al
          evaluar el crédito en sucursal con Autofin, la cuota o el costo total{" "}
          <b>puede coincidir o puede aumentar</b> respecto a este precio de referencia, según
          tu perfil, seguros y condiciones vigentes.
        </p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-2">
        <div className="apple-glass-card space-y-6 rounded-3xl p-6 sm:p-7">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/70">
              ¿Qué quieres financiar?
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {VEHICLE_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setVehicleType(t.id)}
                  className={`rounded-2xl border px-3 py-2.5 text-xs font-semibold transition ${
                    vehicleType === t.id
                      ? "border-brand-400/50 bg-brand-500/15 text-white"
                      : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-white/40">
              Mismo criterio de tipos que en Autofin (autos, SUV, camionetas, camiones y
              furgones que vende RG Motors).
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-white/70">
              Vehículo del catálogo
            </label>
            <select
              value={selectedSlug}
              onChange={(e) => {
                const slug = e.target.value;
                setSelectedSlug(slug);
                const found = vehiclesData.find((v) => v.slug === slug);
                if (found) setPrice(found.price);
              }}
              className="mt-2 w-full cursor-pointer rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 text-xs font-medium text-white outline-none focus:border-brand-500"
            >
              {(filteredVehicles.length ? filteredVehicles : vehiclesData).map((v) => (
                <option key={v.slug} value={v.slug} className="bg-ink-900">
                  {v.brand} {v.model} {v.year} — {formatCLP(v.price)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-2 flex justify-between text-xs font-semibold">
              <span className="text-white/60">Valor del vehículo</span>
              <span className="font-bold text-white">{formatCLP(price)}</span>
            </div>
            <input
              type="range"
              min={5_000_000}
              max={45_000_000}
              step={100_000}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="apple-range w-full cursor-pointer"
            />
          </div>

          <div>
            <div className="mb-2 flex justify-between text-xs font-semibold">
              <span className="text-white/60">Pie inicial ({sim.downPct}%)</span>
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
            <p className="mt-1 text-[10px] text-white/35">Mínimo 20% · como en financiamiento Autofin</p>
          </div>

          <div>
            <div className="mb-2 flex justify-between text-xs font-semibold">
              <span className="text-white/60">Plazo</span>
              <span className="font-bold text-white">{sim.termMonths} cuotas</span>
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
            <p className="mt-1 text-[10px] text-white/35">Hasta 48 meses</p>
          </div>

          {sim.warnings.length > 0 && (
            <ul className="space-y-1 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200/90">
              {sim.warnings.map((w) => (
                <li key={w}>• {w}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-5">
          <div className="apple-glass-card relative overflow-hidden rounded-3xl border-brand-500/30 bg-gradient-to-br from-brand-500/15 via-ink-900/90 to-black p-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Cuota mensual referencial
            </p>
            <p className="mt-2 text-5xl font-extrabold tracking-tight text-brand-300">
              {formatCLP(sim.monthlyPayment)}
            </p>
            <p className="mt-1 text-[11px] text-white/45">
              Primera cuota ~{sim.deferredFirstPaymentDays} días · tasa{" "}
              {(sim.monthlyRate * 100).toFixed(2)}% mens. (referencial Autofin)
            </p>

            <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-xs">
              <Row label="Financiamiento" value="Autofin vía RG Motors" />
              <Row label="Monto a financiar" value={formatCLP(sim.financed)} />
              <Row label="CAE aprox. c/gastos" value={`${sim.caeWithFeesApprox.toFixed(1)}%`} />
              <Row label="Gastos operacionales est." value={formatCLP(sim.operationalFees)} />
              <Row label="Costo total estimado" value={formatCLP(sim.totalCostWithDown)} highlight />
            </div>

            <p className="mt-4 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-[10px] leading-relaxed text-white/45">
              En sucursal Autofin puede confirmar esta cuota o elevarla según evaluación,
              seguros y campaña vigente. Este número es solo una preidea.
            </p>
          </div>

          <form onSubmit={submitLead} className="apple-glass-card space-y-4 rounded-3xl p-6">
            <div>
              <h3 className="text-sm font-bold text-white">Deja tus datos — los guarda RG Motors</h3>
              <p className="mt-1 text-[11px] text-white/45">
                No enviamos esta simulación al portal de Autofin. Usamos tus datos para
                contactarte y para análisis comercial.
              </p>
            </div>

            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
            />

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {error}
              </div>
            )}

            <Field label="Nombre" value={name} onChange={setName} required />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Teléfono" value={phone} onChange={setPhone} required />
              <Field label="Email" value={email} onChange={setEmail} type="email" required />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="apple-btn-primary w-full rounded-full py-3.5 text-xs font-bold text-white shadow-glow disabled:opacity-50"
            >
              {submitting ? "Enviando…" : "Enviar simulación a RG Motors"}
            </button>

            <p className="text-[10px] leading-relaxed text-white/35">
              Crédito otorgado por Autofin · simulación propia RG Motors ·{" "}
              <Link href="/aviso-credito" className="text-brand-300 hover:underline">
                aviso de crédito
              </Link>
              .
            </p>
          </form>
        </div>
      </div>

      <SernacDisclaimer />
    </div>
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
    <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
      <span className={`font-medium ${highlight ? "text-white" : "text-white/60"}`}>{label}</span>
      <span className={`font-bold ${highlight ? "text-brand-300" : "text-white/90"}`}>{value}</span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-white/70">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-3 text-xs text-white outline-none focus:border-brand-500"
      />
    </div>
  );
}
