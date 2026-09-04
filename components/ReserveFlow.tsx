"use client";

import { useState } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";
import { Vehicle, formatCLP } from "@/lib/vehicles";
import { getTrafficSource } from "@/lib/trafficTracking";
import { whatsappLink } from "@/lib/company";

const RESERVE_AMOUNT = 200000;

export default function ReserveFlow({ vehicle: v }: { vehicle: Vehicle }) {
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !phone.trim() || !email.trim()) {
      setErrorMsg("Por favor ingresa nombre, teléfono y correo.");
      return;
    }

    setStatus("processing");
    setErrorMsg("");

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: clientName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          vehicleSlug: v.slug,
          amount: RESERVE_AMOUNT,
          method: "solicitud-web",
          status: "Pendiente",
          trafficSource: getTrafficSource(),
          notes: notes.trim() || "Solicitud de reserva desde el sitio web (sin pago online).",
          website,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data.error || "No se pudo enviar la solicitud. Intenta nuevamente.");
        setStatus("idle");
        return;
      }

      setStatus("done");
    } catch {
      setErrorMsg("Error de conexión. Intenta nuevamente.");
      setStatus("idle");
    }
  };

  const waUrl = whatsappLink(
    `Hola RG Motors, envié una solicitud de reserva para el ${v.brand} ${v.model} ${v.year}. Mi nombre es ${clientName || "..."}. Quiero coordinar el abono.`
  );

  if (status === "done") {
    return (
      <div className="apple-glass-card mx-auto max-w-lg rounded-3xl p-8 text-center border-emerald-500/30 animate-fade-up">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl font-bold text-emerald-400 shadow-glow">
          ✓
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-emerald-400">
          Solicitud de reserva enviada
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-white/70">
          Hola <b>{clientName}</b>, recibimos tu interés en el{" "}
          <b>
            {v.brand} {v.model} {v.year}
          </b>
          . Nuestro equipo te contactará a la brevedad para confirmar disponibilidad.
        </p>
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-white/70">
          El abono referencial de{" "}
          <span className="font-bold text-white">{formatCLP(RESERVE_AMOUNT)}</span> se
          coordina en tienda o por WhatsApp. No se realizó ningún cargo online.
        </div>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="apple-btn-primary rounded-full px-8 py-3 text-xs font-semibold text-white shadow-glow"
          >
            Continuar por WhatsApp
          </a>
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
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-3 items-start">
      <div className="apple-glass-card rounded-3xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Vehículo de interés</h2>
        <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset(v.image)} alt={v.model} className="h-full w-full object-cover" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">
            {v.brand} {v.model}
          </p>
          <p className="text-xs text-white/50">
            {v.version} · Año {v.year}
          </p>
          <p className="mt-2 text-2xl font-extrabold text-brand-300">{formatCLP(v.price)}</p>
        </div>
        <div className="space-y-1.5 text-xs text-white/60 border-t border-white/10 pt-3">
          <p>✓ {v.km.toLocaleString("es-CL")} km</p>
          <p>
            ✓ {v.fuel} · Transmisión {v.transmission}
          </p>
        </div>
      </div>

      <div className="apple-glass-card rounded-3xl p-6 space-y-4 lg:col-span-2">
        <h2 className="text-base font-bold text-white">Solicitud de reserva</h2>
        <p className="text-xs text-white/50">
          Déjanos tus datos y te contactamos para coordinar el abono en tienda o WhatsApp.
          Por ahora no hay pago online.
        </p>

        {errorMsg && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        {/* Honeypot */}
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          autoComplete="off"
          tabIndex={-1}
          aria-hidden="true"
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-[11px] text-white/60 mb-1">Nombre completo *</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ej: Juan Pérez"
              required
              className="w-full rounded-xl border border-white/15 bg-ink-950 px-3 py-2 text-xs text-white outline-none focus:border-brand-500"
            />
          </div>
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
            <label className="block text-[11px] text-white/60 mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
              className="w-full rounded-xl border border-white/15 bg-ink-950 px-3 py-2 text-xs text-white outline-none focus:border-brand-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] text-white/60 mb-1">Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Horario preferido, consultas, etc."
              className="w-full rounded-xl border border-white/15 bg-ink-950 px-3 py-2 text-xs text-white outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-white/60">
          Abono referencial:{" "}
          <span className="font-bold text-brand-300">{formatCLP(RESERVE_AMOUNT)}</span> —
          se coordina al confirmar la solicitud.
        </div>

        <button
          type="submit"
          disabled={status === "processing"}
          className="apple-btn-primary flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-xs font-semibold text-white shadow-glow disabled:opacity-60"
        >
          {status === "processing" ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Enviando solicitud…
            </>
          ) : (
            "Enviar solicitud de reserva"
          )}
        </button>
      </div>
    </form>
  );
}
