"use client";

import { useState } from "react";
import Link from "next/link";
import { Vehicle, formatCLP } from "@/lib/vehicles";

const RESERVE_AMOUNT = 200000;

const METHODS = [
  { id: "webpay", name: "WebPay", desc: "Débito o crédito", icon: "💳" },
  { id: "transfer", name: "Transferencia bancaria", desc: "Pago directo", icon: "🏦" },
  { id: "mercadopago", name: "Mercado Pago", desc: "Saldo o tarjeta", icon: "🟦" },
  { id: "flow", name: "Flow", desc: "Múltiples medios", icon: "🌊" },
  { id: "onepay", name: "OnePay", desc: "Pago con QR", icon: "📱" },
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
      <div className="mx-auto max-w-lg rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-400/20 text-3xl">
          ✓
        </div>
        <h2 className="mt-4 text-2xl font-bold text-emerald-300">
          ¡Reserva confirmada!
        </h2>
        <p className="mt-2 text-white/70">
          Reservaste el {v.brand} {v.model} {v.year}. Te enviamos el comprobante
          por correo. Un ejecutivo te contactará para coordinar la entrega.
        </p>
        <p className="mt-4 rounded-xl bg-ink-900 p-3 text-sm text-white/60">
          El monto de {formatCLP(RESERVE_AMOUNT)} se descontará del pie. El auto
          quedó bloqueado a tu nombre por 48 horas.
        </p>
        <Link
          href="/cuenta"
          className="mt-6 inline-block rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-400"
        >
          Ir a mi cuenta
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Vehicle summary */}
      <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-5">
        <h2 className="text-lg font-semibold">Reserva este vehículo</h2>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={v.image}
          alt={v.model}
          className="mt-4 w-full rounded-xl object-cover"
        />
        <p className="mt-4 font-semibold">{v.brand} {v.model}</p>
        <p className="text-sm text-white/50">{v.version} · {v.year}</p>
        <p className="mt-2 text-2xl font-bold text-brand-300">{formatCLP(v.price)}</p>
        <div className="mt-4 space-y-1 text-sm text-white/60">
          <p>· {v.km.toLocaleString("es-CL")} km</p>
          <p>· {v.fuel} · {v.transmission}</p>
          <p>· Inspección de 150 puntos aprobada</p>
        </div>
      </div>

      {/* Payment methods */}
      <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-5">
        <h2 className="text-lg font-semibold">Selecciona tu método de pago</h2>
        <div className="mt-4 space-y-2">
          {METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                method === m.id
                  ? "border-brand-500 bg-brand-500/10"
                  : "border-white/10 hover:border-white/25"
              }`}
            >
              <span className="text-2xl">{m.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{m.name}</p>
                <p className="text-xs text-white/50">{m.desc}</p>
              </div>
              <span
                className={`grid h-5 w-5 place-items-center rounded-full border ${
                  method === m.id ? "border-brand-500 bg-brand-500" : "border-white/30"
                }`}
              >
                {method === m.id && <span className="h-2 w-2 rounded-full bg-white" />}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-b from-brand-500/10 to-transparent p-5">
        <h2 className="text-lg font-semibold">Detalle de la reserva</h2>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Vehículo</span>
            <span className="text-right font-medium">{v.brand} {v.model}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-3">
            <span className="text-white/60">Monto de reserva</span>
            <span className="font-medium">{formatCLP(RESERVE_AMOUNT)}</span>
          </div>
        </div>

        <ul className="mt-4 space-y-2 text-sm text-white/60">
          <li className="flex gap-2"><span className="text-emerald-400">✓</span> Se descuenta del pie</li>
          <li className="flex gap-2"><span className="text-emerald-400">✓</span> 100% reembolsable</li>
          <li className="flex gap-2"><span className="text-emerald-400">✓</span> Bloqueo por 48 horas</li>
        </ul>

        <button
          onClick={pay}
          disabled={status === "processing"}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 font-semibold text-white transition hover:bg-brand-400 disabled:opacity-60"
        >
          {status === "processing" ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Procesando pago…
            </>
          ) : (
            "Continuar con el pago"
          )}
        </button>
        <p className="mt-3 text-center text-[11px] text-white/40">
          Pago seguro y encriptado
        </p>
      </div>
    </div>
  );
}
