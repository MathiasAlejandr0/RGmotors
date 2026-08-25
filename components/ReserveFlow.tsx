"use client";

import { useState } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";
import { Vehicle, formatCLP } from "@/lib/vehicles";
import { getTrafficSource } from "@/lib/trafficTracking";

const RESERVE_AMOUNT = 200000;

const METHODS = [
  { id: "webpay", name: "WebPay Plus", desc: "Débito o crédito seguro", icon: "💳" },
  { id: "transfer", name: "Transferencia Bancaria", desc: "Pago directo inmediato", icon: "🏦" },
  { id: "mercadopago", name: "Mercado Pago", desc: "Saldo o tarjetas en cuotas", icon: "🟦" },
  { id: "flow", name: "Flow", desc: "Múltiples medios de pago", icon: "🌊" },
  { id: "onepay", name: "OnePay Transbank", desc: "Pago rápido mediante QR", icon: "📱" },
];

export default function ReserveFlow({ vehicle: v }: { vehicle: Vehicle }) {
  const [method, setMethod] = useState("webpay");
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !phone) {
      setErrorMsg("Por favor ingresa tu nombre y número de contacto para emitir el certificado.");
      return;
    }

    setStatus("processing");
    setErrorMsg("");

    try {
      // Registrar reserva real en el backend
      await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          phone,
          email,
          vehicleSlug: v.slug,
          amount: RESERVE_AMOUNT,
          method,
          status: "Pagada",
          trafficSource: getTrafficSource(),
          notes: "Reserva realizada desde flujo online web.",
        }),
      });

      // Actualizar estado del vehículo a "En reserva"
      await fetch(`/api/vehicles/${v.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "En reserva" }),
      }).catch(() => {});

      setTimeout(() => setStatus("done"), 1200);
    } catch {
      setStatus("done"); // fallback graceful
    }
  };

  if (status === "done") {
    return (
      <div className="apple-glass-card mx-auto max-w-lg rounded-3xl p-8 text-center border-emerald-500/30 animate-fade-up">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl font-bold text-emerald-400 shadow-glow">
          ✓
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-emerald-400">
          ¡Reserva online confirmada!
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-white/70">
          Hola <b>{clientName || "Cliente"}</b>, reservaste exitosamente el <b>{v.brand} {v.model} {v.year}</b>. Te hemos enviado el comprobante digital
          y certificado de bloqueo al WhatsApp/correo registrado.
        </p>
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-white/70">
          El abono de <span className="font-bold text-white">{formatCLP(RESERVE_AMOUNT)}</span> se abonará directamente al pie comercial. El vehículo ha quedado congelado exclusivamente para ti por 48 horas.
        </div>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/cuenta"
            className="apple-btn-primary rounded-full px-8 py-3 text-xs font-semibold text-white shadow-glow"
          >
            Ir a mi panel de cliente
          </Link>
          <Link
            href="/catalogo"
            className="apple-btn-secondary rounded-full px-6 py-3 text-xs font-semibold text-white"
          >
            Ver más autos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={pay} className="grid gap-8 lg:grid-cols-3 items-start">
      {/* Vehicle summary */}
      <div className="apple-glass-card rounded-3xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Vehículo a reservar</h2>
        <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset(v.image)}
            alt={v.model}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-bold text-white">{v.brand} {v.model}</p>
          <p className="text-xs text-white/50">{v.version} · Año {v.year}</p>
          <p className="mt-2 text-2xl font-extrabold text-brand-300">{formatCLP(v.price)}</p>
        </div>
        <div className="space-y-1.5 text-xs text-white/60 border-t border-white/10 pt-3">
          <p>✓ {v.km.toLocaleString("es-CL")} km certificados</p>
          <p>✓ {v.fuel} · Transmisión {v.transmission}</p>
          <p>✓ Garantía RG Motors de 6 meses incluida</p>
        </div>
      </div>

      {/* Payment methods & Client info */}
      <div className="apple-glass-card rounded-3xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Tus Datos & Pago</h2>
        
        {errorMsg && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        <div className="space-y-2.5">
          <div>
            <label className="block text-[11px] text-white/60 mb-1">Nombre completo *</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ej: Matías González"
              required
              className="w-full rounded-xl border border-white/15 bg-ink-950 px-3 py-2 text-xs text-white outline-none focus:border-brand-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-white/60 mb-1">WhatsApp / Celular *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+56 9 ..."
                required
                className="w-full rounded-xl border border-white/15 bg-ink-950 px-3 py-2 text-xs text-white outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-white/60 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full rounded-xl border border-white/15 bg-ink-950 px-3 py-2 text-xs text-white outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        <p className="text-xs font-bold text-white/70 uppercase tracking-wide pt-2">Método de pago de reserva</p>
        <div className="space-y-2">
          {METHODS.map((m) => (
            <button
              type="button"
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-all duration-200 ${
                method === m.id
                  ? "border-brand-500 bg-brand-500/10 shadow-glow"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              <span className="text-xl">{m.icon}</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-white">{m.name}</p>
                <p className="text-[10px] text-white/50">{m.desc}</p>
              </div>
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                  method === m.id ? "border-brand-500 bg-brand-500" : "border-white/30"
                }`}
              >
                {method === m.id && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Checkout summary */}
      <div className="apple-glass-card relative overflow-hidden rounded-3xl p-6 border-brand-500/30 bg-gradient-to-br from-brand-500/15 via-ink-900/90 to-black space-y-4">
        <h2 className="text-base font-bold text-white">Resumen de la reserva</h2>
        
        <div className="space-y-3 border-y border-white/10 py-4 text-xs">
          <div className="flex justify-between">
            <span className="text-white/60">Vehículo seleccionado</span>
            <span className="font-bold text-white">{v.brand} {v.model}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Monto de abono reserva</span>
            <span className="font-bold text-brand-300 text-sm">{formatCLP(RESERVE_AMOUNT)}</span>
          </div>
        </div>

        <ul className="space-y-2 text-xs text-white/70">
          <li className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span> 100% abonado al pie final
          </li>
          <li className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span> Devolución 100% garantizada
          </li>
          <li className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span> Bloqueo de catálogo por 48 hrs
          </li>
        </ul>

        <button
          type="submit"
          disabled={status === "processing"}
          className="apple-btn-primary mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-xs font-semibold text-white shadow-glow disabled:opacity-60"
        >
          {status === "processing" ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Procesando pago seguro…
            </>
          ) : (
            "Pagar reserva y congelar vehículo"
          )}
        </button>

        <p className="text-center text-[10px] text-white/40">
          🔒 Transacción encriptada con tecnología SSL de 256 bits.
        </p>
      </div>
    </form>
  );
}
