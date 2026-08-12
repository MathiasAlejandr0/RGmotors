"use client";

import { useState } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";
import { Vehicle, formatCLP } from "@/lib/vehicles";

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
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");

  const pay = () => {
    setStatus("processing");
    setTimeout(() => setStatus("done"), 1800);
  };

  if (status === "done") {
    return (
      <div className="apple-glass-card mx-auto max-w-lg rounded-3xl p-8 text-center border-emerald-500/30">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl font-bold text-emerald-400 shadow-glow">
          ✓
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-emerald-400">
          ¡Reserva online confirmada!
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-white/70">
          Reservaste exitosamente el <b>{v.brand} {v.model} {v.year}</b>. Te hemos enviado el comprobante digital
          y certificado de bloqueo al correo registrado.
        </p>
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-white/70">
          El abono de <span className="font-bold text-white">{formatCLP(RESERVE_AMOUNT)}</span> se abonará directamente al pie comercial. El vehículo ha quedado congelado exclusivamente para ti por 48 horas.
        </div>
        <Link
          href="/cuenta"
          className="apple-btn-primary mt-6 inline-block rounded-full px-8 py-3.5 text-xs font-semibold text-white shadow-glow"
        >
          Ir a mi panel de cliente
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3 items-start">
      {/* Vehicle summary */}
      <div className="apple-glass-card rounded-3xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Vehículo a reservar</h2>
        <div className="aspect-[16/10] overflow-hidden rounded-2xl">
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

      {/* Payment methods */}
      <div className="apple-glass-card rounded-3xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Método de pago de reserva</h2>
        <div className="space-y-2.5">
          {METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`flex w-full items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all duration-200 ${
                method === m.id
                  ? "border-brand-500 bg-brand-500/10 shadow-glow"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              <span className="text-2xl">{m.icon}</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-white">{m.name}</p>
                <p className="text-[11px] text-white/50">{m.desc}</p>
              </div>
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                  method === m.id ? "border-brand-500 bg-brand-500" : "border-white/30"
                }`}
              >
                {method === m.id && <span className="h-2 w-2 rounded-full bg-white" />}
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
          onClick={pay}
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
    </div>
  );
}

