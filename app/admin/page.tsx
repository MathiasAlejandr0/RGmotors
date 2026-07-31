"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import SpinUploader from "@/components/admin/SpinUploader";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import {
  VehiclesSection,
  ReservationsSection,
  CreditsSection,
  ClientsSection,
  ConfigSection,
} from "@/components/admin/AdminSections";
import { vehicles, formatCLP } from "@/lib/vehicles";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "analitica", label: "Analítica", icon: "📊" },
  { id: "vehiculos", label: "Vehículos", icon: "🚗" },
  { id: "spin360", label: "360° / Videos", icon: "🔄" },
  { id: "reservas", label: "Reservas", icon: "★" },
  { id: "creditos", label: "Créditos", icon: "💳" },
  { id: "clientes", label: "Clientes", icon: "👥" },
  { id: "config", label: "Configuración", icon: "⚙" },
];

const SALES = [12, 18, 15, 22, 19, 28, 24, 31, 27, 35, 30, 38];
const MONTHS = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export default function AdminPage() {
  const [active, setActive] = useState("dashboard");

  return (
    <div className="min-h-screen bg-ink-950">
      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-white/10 bg-ink-800/40 p-4 lg:block">
          <Link href="/" className="block px-2 py-2">
            <Logo size={32} tagline={false} />
          </Link>
          <p className="mt-2 px-2 text-xs uppercase tracking-wide text-white/30">Admin</p>
          <nav className="mt-3 space-y-1">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setActive(n.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  active === n.id ? "bg-brand-500/15 text-white" : "text-white/55 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="w-4 text-center">{n.icon}</span> {n.label}
              </button>
            ))}
          </nav>
          <Link href="/" className="mt-6 flex items-center gap-2 px-3 py-2 text-sm text-white/40 hover:text-white">
            ← Volver al sitio
          </Link>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {
                  {
                    dashboard: "Dashboard",
                    analitica: "Analítica de negocio",
                    vehiculos: "Vehículos",
                    spin360: "360° / Videos",
                    reservas: "Reservas",
                    creditos: "Créditos",
                    clientes: "Clientes",
                    config: "Configuración",
                  }[active]
                }
              </h1>
              <p className="text-sm text-white/50">
                {
                  {
                    dashboard: "Resumen general de RG Motors",
                    analitica: "Inteligencia de datos para vender más",
                    vehiculos: "Inventario publicado en el catálogo",
                    spin360: "Genera giros 360° de los autos subiendo un video",
                    reservas: "Reservas con pago parcial",
                    creditos: "Solicitudes y pre-aprobaciones",
                    clientes: "Base de clientes y leads",
                    config: "Datos de la empresa y preferencias",
                  }[active]
                }
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-ink-800 px-3 py-1.5 text-sm">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-500/20 text-brand-300">A</span>
              Administrador
            </div>
          </div>

          {active === "spin360" && <SpinUploader />}
          {active === "analitica" && <AnalyticsDashboard />}
          {active === "vehiculos" && <VehiclesSection />}
          {active === "reservas" && <ReservationsSection />}
          {active === "creditos" && <CreditsSection />}
          {active === "clientes" && <ClientsSection />}
          {active === "config" && <ConfigSection />}
          {active === "dashboard" && (
          <>
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi icon="🚗" value="452" label="Vehículos publicados" trend="+8%" />
            <Kpi icon="👁" value="12.480" label="Visitas este mes" trend="+23%" />
            <Kpi icon="★" value="16" label="Reservas activas" trend="+4" />
            <Kpi icon="💰" value="$248M" label="Ventas del mes" trend="+15%" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            {/* Chart */}
            <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Ventas del mes</h2>
                <span className="text-sm text-emerald-400">+15% vs mes anterior</span>
              </div>
              <AreaChart data={SALES} labels={MONTHS} />
            </div>

            {/* Most viewed */}
            <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-5">
              <h2 className="mb-4 font-semibold">Vehículos más vistos</h2>
              <div className="space-y-3">
                {vehicles.slice(0, 5).map((v, i) => (
                  <div key={v.slug} className="flex items-center gap-3">
                    <span className="text-sm text-white/30">{i + 1}</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={v.image} alt={v.model} className="h-10 w-14 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{v.brand} {v.model}</p>
                      <p className="text-xs text-white/40">{formatCLP(v.price)}</p>
                    </div>
                    <span className="text-sm text-white/50">{(2400 - i * 320).toLocaleString("es-CL")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent reservations table */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-ink-800/60 p-5">
            <h2 className="mb-4 font-semibold">Reservas recientes</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="text-left text-white/40">
                  <tr className="border-b border-white/10">
                    <th className="pb-2">Cliente</th>
                    <th className="pb-2">Vehículo</th>
                    <th className="pb-2">Monto</th>
                    <th className="pb-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { c: "Matías González", v: vehicles[0], s: "Pagada", color: "emerald" },
                    { c: "Carla Muñoz", v: vehicles[3], s: "En proceso", color: "amber" },
                    { c: "Pedro Rivas", v: vehicles[1], s: "Pagada", color: "emerald" },
                    { c: "Ana Torres", v: vehicles[8], s: "Cancelada", color: "red" },
                  ].map((r, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-3">{r.c}</td>
                      <td className="py-3">{r.v.brand} {r.v.model}</td>
                      <td className="py-3">{formatCLP(200000)}</td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs ${
                            r.color === "emerald"
                              ? "bg-emerald-400/15 text-emerald-300"
                              : r.color === "amber"
                                ? "bg-amber-400/15 text-amber-300"
                                : "bg-red-400/15 text-red-300"
                          }`}
                        >
                          {r.s}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </>
          )}
        </main>
      </div>
    </div>
  );
}

function Kpi({ icon, value, label, trend }: { icon: string; value: string; label: string; trend: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-5">
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-500/15 text-brand-300">{icon}</span>
        <span className="text-xs text-emerald-400">{trend}</span>
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="text-sm text-white/50">{label}</p>
    </div>
  );
}

function AreaChart({ data, labels }: { data: number[]; labels: string[] }) {
  const w = 560;
  const h = 200;
  const pad = 10;
  const max = Math.max(...data) * 1.15;
  const step = (w - pad * 2) / (data.length - 1);
  const pts = data.map((d, i) => [pad + i * step, h - pad - (d / max) * (h - pad * 2)]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0]},${h - pad} L${pts[0][0]},${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h + 20}`} className="w-full">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#006CFF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#006CFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#areaGrad)" />
      <path d={line} fill="none" stroke="#006CFF" strokeWidth="2.5" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#49A7FF" />
      ))}
      {labels.map((l, i) => (
        <text key={i} x={pad + i * step} y={h + 14} fill="rgba(255,255,255,0.35)" fontSize="10" textAnchor="middle">
          {l}
        </text>
      ))}
    </svg>
  );
}
