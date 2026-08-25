"use client";

import { useState } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";
import { Vehicle, formatCLP } from "@/lib/vehicles";

const BRANCHES = ["Las Condes", "Providencia", "Maipú", "La Florida"];
const TIMES = ["10:00", "11:30", "12:30", "15:00", "16:30", "17:30"];
const EXECUTIVES = ["Sin preferencia", "Camila Rojas", "Diego Fuentes", "Valentina Soto"];

function daysOfMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7; // lunes = 0
  const total = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(startDay).fill(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  return { cells, monthName: first.toLocaleDateString("es-CL", { month: "long", year: "numeric" }), today: now.getDate() };
}

export default function TestDriveForm({ vehicle: v }: { vehicle: Vehicle }) {
  const { cells, monthName, today } = daysOfMonth();
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [exec, setExec] = useState(EXECUTIVES[0]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);

  const canConfirm = !!(day && time && name.trim() && phone.trim());

  const handleConfirm = async () => {
    setDone(true);
    try {
      await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: `td_${Date.now()}`,
          name,
          contact: phone,
          bodyType: v.bodyType,
          models: [v.slug],
          intents: ["prueba-manejo", `sucursal-${branch}`],
        }),
      });
    } catch {}
  };

  if (done) {
    return (
      <div className="apple-glass-card mx-auto max-w-lg rounded-3xl p-8 text-center border-emerald-500/30">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl font-bold text-emerald-400 shadow-glow">
          ✓
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-emerald-400">¡Prueba de manejo agendada!</h2>
        <p className="mt-3 text-xs leading-relaxed text-white/70">
          {name ? `${name}, t` : "T"}e esperamos el <b>{day}</b> de {monthName} a las{" "}
          <b>{time}</b> en la sucursal <b>{branch}</b> para probar tu {v.brand} {v.model}.
          {phone ? ` Te enviaremos una confirmación al ${phone}.` : ""}
        </p>
        <Link
          href="/catalogo"
          className="apple-btn-primary mt-6 inline-block rounded-full px-8 py-3.5 text-xs font-semibold text-white shadow-glow"
        >
          Seguir explorando el catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] items-start">
      {/* Vehicle summary */}
      <div className="apple-glass-card rounded-3xl p-6 space-y-4">
        <div className="aspect-[16/10] overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset(v.image)} alt={v.model} className="h-full w-full object-cover" />
        </div>
        <div>
          <p className="text-base font-bold text-white">{v.brand} {v.model}</p>
          <p className="text-xs text-white/50">{v.version} · Año {v.year}</p>
          <p className="mt-2 text-2xl font-extrabold text-brand-300">{formatCLP(v.price)}</p>
        </div>
        <p className="text-xs text-white/60 leading-relaxed border-t border-white/10 pt-3">
          Prueba el vehículo en condiciones reales con asistencia de un especialista comercial de RG Motors.
        </p>
      </div>

      {/* Form */}
      <div className="apple-glass-card rounded-3xl p-7 space-y-6">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-white/70">Sucursal de atención</label>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 text-xs font-medium text-white outline-none focus:border-brand-500 cursor-pointer"
          >
            {BRANCHES.map((b) => <option key={b} className="bg-ink-900">{b}</option>)}
          </select>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Selecciona fecha — <span className="capitalize text-brand-300">{monthName}</span></p>
          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-white/40">
            {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1.5">
            {cells.map((c, i) => (
              <button
                key={i}
                disabled={!c || c < today}
                onClick={() => c && setDay(c)}
                className={`aspect-square rounded-xl text-xs font-semibold transition-all ${
                  !c
                    ? "invisible"
                    : c < today
                      ? "cursor-not-allowed text-white/20 bg-transparent"
                      : day === c
                        ? "bg-brand-500 text-white shadow-glow"
                        : "bg-white/[0.05] text-white/70 hover:bg-white/15 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Selecciona horario</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {TIMES.map((t) => (
              <button
                key={t}
                onClick={() => setTime(t)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  time === t
                    ? "bg-brand-500 text-white shadow-glow"
                    : "border border-white/15 bg-white/[0.04] text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {t} hrs
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-white/70">Ejecutivo de ventas (Opcional)</label>
          <select
            value={exec}
            onChange={(e) => setExec(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 text-xs font-medium text-white outline-none focus:border-brand-500 cursor-pointer"
          >
            {EXECUTIVES.map((e) => <option key={e} className="bg-ink-900">{e}</option>)}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-white/70">Tu nombre completo</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre y apellido"
              className="mt-1.5 w-full rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-3 text-xs text-white outline-none focus:border-brand-500 placeholder-white/40"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-white/70">Teléfono</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+56 9 1234 5678"
              className="mt-1.5 w-full rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-3 text-xs text-white outline-none focus:border-brand-500 placeholder-white/40"
            />
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={!canConfirm}
          className="apple-btn-primary w-full rounded-full py-3.5 text-xs font-semibold text-white shadow-glow disabled:opacity-50 disabled:pointer-events-none"
        >
          {canConfirm ? "Confirmar reserva de prueba de manejo" : "Selecciona fecha, hora y contacto"}
        </button>
      </div>
    </div>
  );
}

