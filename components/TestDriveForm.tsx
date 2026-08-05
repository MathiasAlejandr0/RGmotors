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

  if (done) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-400/20 text-3xl">
          ✓
        </div>
        <h2 className="mt-4 text-2xl font-bold text-emerald-300">¡Prueba agendada!</h2>
        <p className="mt-2 text-white/70">
          {name ? `${name}, t` : "T"}e esperamos el <b>{day}</b> de {monthName} a las{" "}
          <b>{time}</b> en sucursal {branch} para probar el {v.brand} {v.model}.
          {phone ? ` Te confirmaremos al ${phone}.` : ""}
        </p>
        <Link
          href="/catalogo"
          className="mt-6 inline-block rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-400"
        >
          Seguir explorando
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      {/* Vehicle summary */}
      <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset(v.image)} alt={v.model} className="w-full rounded-xl object-cover" />
        <p className="mt-4 font-semibold">{v.brand} {v.model}</p>
        <p className="text-sm text-white/50">{v.version} · {v.year}</p>
        <p className="mt-2 text-2xl font-bold text-brand-300">{formatCLP(v.price)}</p>
        <p className="mt-4 text-sm text-white/60">
          Agenda una prueba de manejo sin costo y conoce tu próximo auto en
          persona.
        </p>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-5">
        <label className="text-sm text-white/60">Sucursal</label>
        <select
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
        >
          {BRANCHES.map((b) => <option key={b}>{b}</option>)}
        </select>

        <div className="mt-5">
          <p className="text-sm text-white/60">Fecha — <span className="capitalize">{monthName}</span></p>
          <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs text-white/40">
            {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((c, i) => (
              <button
                key={i}
                disabled={!c || c < today}
                onClick={() => c && setDay(c)}
                className={`aspect-square rounded-lg text-sm transition ${
                  !c
                    ? "invisible"
                    : c < today
                      ? "cursor-not-allowed text-white/20"
                      : day === c
                        ? "bg-brand-500 font-semibold text-white"
                        : "bg-ink-900 text-white/70 hover:bg-white/10"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm text-white/60">Hora</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TIMES.map((t) => (
              <button
                key={t}
                onClick={() => setTime(t)}
                className={`rounded-lg border px-4 py-2 text-sm transition ${
                  time === t
                    ? "border-brand-500 bg-brand-500/15 text-white"
                    : "border-white/10 text-white/70 hover:border-white/25"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <label className="text-sm text-white/60">Ejecutivo</label>
          <select
            value={exec}
            onChange={(e) => setExec(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
          >
            {EXECUTIVES.map((e) => <option key={e}>{e}</option>)}
          </select>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm text-white/60">Tu nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre y apellido"
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-sm text-white/60">Teléfono</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+56 9 ..."
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <button
          onClick={() => setDone(true)}
          disabled={!canConfirm}
          className="mt-6 w-full rounded-xl bg-brand-500 py-3 font-semibold text-white transition hover:bg-brand-400 disabled:opacity-50"
        >
          {canConfirm ? "Confirmar prueba de manejo" : "Completa fecha, hora y contacto"}
        </button>
      </div>
    </div>
  );
}
