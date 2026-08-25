"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import SpinUploader from "@/components/admin/SpinUploader";
import PhotoManager from "@/components/admin/PhotoManager";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import AdminAuthGate from "@/components/admin/AdminAuthGate";
import {
  VehiclesSection,
  ReservationsSection,
  CreditsSection,
  ClientsSection,
  ConfigSection,
  LeadScoringSection,
  TradeInsSection,
  CarRequestsSection,
  PriceAlertsSection,
} from "@/components/admin/AdminSections";
import { asset } from "@/lib/asset";
import { Vehicle, formatCLP } from "@/lib/vehicles";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "leadscoring", label: "🔥 Lead Scoring", icon: "🔥" },
  { id: "tasaciones", label: "💎 Tasaciones / Retomas", icon: "💎" },
  { id: "pedidos", label: "🎯 Autos a Pedido", icon: "🎯" },
  { id: "alertas", label: "🔔 Alertas de Precio", icon: "🔔" },
  { id: "vehiculos", label: "Vehículos", icon: "🚗" },
  { id: "reservas", label: "Reservas", icon: "★" },
  { id: "creditos", label: "Créditos", icon: "💳" },
  { id: "fotos", label: "Fotos & Galería", icon: "📸" },
  { id: "spin360", label: "360° / Videos", icon: "🔄" },
  { id: "analitica", label: "Analítica", icon: "📊" },
  { id: "clientes", label: "Clientes", icon: "👥" },
  { id: "config", label: "Configuración", icon: "⚙" },
];

const SALES = [12, 18, 15, 22, 19, 28, 24, 31, 27, 35, 30, 38];
const MONTHS = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export default function AdminPage() {
  const [active, setActive] = useState("dashboard");
  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>([]);
  const [reservationsList, setReservationsList] = useState<any[]>([]);
  const [photoSlug, setPhotoSlug] = useState<string>("");

  useEffect(() => {
    fetch("/api/vehicles")
      .then((r) => (r.ok ? r.json() : { vehicles: [] }))
      .then((data) => {
        setVehiclesList(data.vehicles || []);
        if (data.vehicles && data.vehicles.length > 0 && !photoSlug) {
          setPhotoSlug(data.vehicles[0].slug);
        }
      })
      .catch(() => {});

    fetch("/api/reservations")
      .then((r) => (r.ok ? r.json() : { reservations: [] }))
      .then((data) => {
        setReservationsList(data.reservations || []);
      })
      .catch(() => {});
  }, [photoSlug]);

  const handleOpenPhotoManager = (slug: string) => {
    setPhotoSlug(slug);
    setActive("fotos");
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("rg_admin_auth");
      window.location.reload();
    } catch {}
  };

  return (
    <AdminAuthGate>
      <div className="min-h-screen bg-ink-950 text-white">
        <div className="flex">
          {/* Sidebar */}
          <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/10 bg-ink-800/40 p-4 lg:flex flex-col justify-between overflow-y-auto">
            <div>
              <Link href="/" className="block px-2 py-2">
                <Logo size={32} tagline={false} />
              </Link>
              <p className="mt-2 px-2 text-[10px] font-bold uppercase tracking-wider text-brand-400">
                Panel Administrador RG
              </p>
              <nav className="mt-4 space-y-1">
                {NAV.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setActive(n.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      active === n.id
                        ? "bg-brand-500 text-white shadow-glow"
                        : "text-white/55 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="w-4 text-center text-sm">{n.icon}</span> {n.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="space-y-2 border-t border-white/10 pt-4 mt-4">
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-2 text-xs text-white/40 hover:text-white transition"
              >
                ← Volver al sitio público
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-red-400/80 hover:text-red-300 transition"
              >
                ⏻ Cerrar sesión admin
              </button>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 p-6 overflow-y-auto max-w-7xl">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {
                    {
                      dashboard: "Dashboard Principal",
                      leadscoring: "Lead Scoring Inteligente",
                      tasaciones: "Minería de Tasaciones & Retomas",
                      pedidos: "Autos a Pedido / Personal Shopper",
                      alertas: "Alertas de Baja de Precio",
                      analitica: "Analítica de Negocio & Ventas",
                      vehiculos: "Gestión de Inventario",
                      fotos: "Gestor de Fotos y Galería",
                      spin360: "Generador 360° desde Video (IA)",
                      reservas: "CRM de Reservas Online",
                      creditos: "Solicitudes de Financiamiento",
                      clientes: "Base de Clientes & Leads",
                      config: "Configuración del Negocio",
                    }[active]
                  }
                </h1>
                <p className="text-xs text-white/50 mt-0.5">
                  {
                    {
                      dashboard: "Resumen integral de ventas, inventario y reservas activas",
                      leadscoring: "Semáforo comercial de prospectos clasificados por temperatura de compra",
                      tasaciones: "Clientes que entregan su auto actual en parte de pago (Oportunidad de doble margen)",
                      pedidos: "Compradores en lista de espera para modelos no encontrados en stock",
                      alertas: "Prospectos esperando rebaja u ofertas para cerrar compra rápida",
                      analitica: "Inteligencia de datos y señales de compra inferidas",
                      vehiculos: "Crea, edita y organiza los vehículos del catálogo",
                      fotos: "Sube y organiza fotos y fotogramas 360° por arrastre",
                      spin360: "Genera giros 360° con recorte de fondo automático",
                      reservas: "Control de abonos y contacto directo por WhatsApp",
                      creditos: "Evaluaciones y pre-aprobaciones con RUT en 60 segundos",
                      clientes: "Leads capturados desde la web y chatbot",
                      config: "Datos de contacto, teléfonos, horarios y parámetros de cálculo",
                    }[active]
                  }
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-ink-800 px-3.5 py-1.5 text-xs">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-500/20 font-bold text-brand-300">
                    A
                  </span>
                  <span className="text-white/80 font-medium">Administrador RG</span>
                </div>
              </div>
            </div>

            {/* Mobile Nav Tabs */}
            <div className="mb-6 flex gap-1.5 overflow-x-auto pb-2 lg:hidden">
              {NAV.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setActive(n.id)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold ${
                    active === n.id
                      ? "bg-brand-500 text-white"
                      : "bg-ink-800/80 text-white/60 hover:text-white"
                  }`}
                >
                  <span>{n.icon}</span> {n.label}
                </button>
              ))}
            </div>

            {active === "leadscoring" && <LeadScoringSection />}
            {active === "tasaciones" && <TradeInsSection />}
            {active === "pedidos" && <CarRequestsSection />}
            {active === "alertas" && <PriceAlertsSection />}
            {active === "fotos" && <PhotoManager initialSlug={photoSlug || vehiclesList[0]?.slug} />}
            {active === "spin360" && <SpinUploader />}
            {active === "analitica" && <AnalyticsDashboard />}
            {active === "vehiculos" && <VehiclesSection onManagePhotos={handleOpenPhotoManager} />}
            {active === "reservas" && <ReservationsSection />}
            {active === "creditos" && <CreditsSection />}
            {active === "clientes" && <ClientsSection />}
            {active === "config" && <ConfigSection />}

            {active === "dashboard" && (
              <>
                {/* Stat cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Kpi
                    icon="🚗"
                    value={String(vehiclesList.length || 10)}
                    label="Vehículos en catálogo"
                    trend="+2 nuevos"
                  />
                  <Kpi icon="🔥" value="95%" label="Calidad de Leads" trend="Top Scoring" />
                  <Kpi
                    icon="★"
                    value={String(reservationsList.length || 4)}
                    label="Reservas registradas"
                    trend={`${reservationsList.filter((r) => r.status === "Pagada").length || 3} pagadas`}
                  />
                  <Kpi icon="💰" value="$248M" label="Ventas estimadas" trend="+15%" />
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                  {/* Chart */}
                  <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="font-semibold text-white">Ventas y reservas del mes</h2>
                      <span className="text-xs text-emerald-400 font-medium">+15% vs mes anterior</span>
                    </div>
                    <AreaChart data={SALES} labels={MONTHS} />
                  </div>

                  {/* Most viewed */}
                  <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="font-semibold text-white">Vehículos destacados</h2>
                      <button
                        onClick={() => setActive("vehiculos")}
                        className="text-xs text-brand-400 hover:underline"
                      >
                        Ver todos →
                      </button>
                    </div>
                    <div className="space-y-3">
                      {vehiclesList.slice(0, 5).map((v, i) => (
                        <div key={v.slug} className="flex items-center gap-3">
                          <span className="text-xs font-bold text-white/30">{i + 1}</span>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={asset(v.image)}
                            alt={v.model}
                            className="h-10 w-14 rounded-lg object-cover border border-white/10"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-white">
                              {v.brand} {v.model}
                            </p>
                            <p className="text-[11px] text-brand-300 font-medium">{formatCLP(v.price)}</p>
                          </div>
                          <span className="text-xs text-white/50">{v.status || "Disponible"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent reservations table */}
                <div className="mt-6 rounded-2xl border border-white/10 bg-ink-800/60 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-semibold text-white">Últimas Reservas Online</h2>
                    <button
                      onClick={() => setActive("reservas")}
                      className="text-xs text-brand-400 hover:underline"
                    >
                      Gestionar reservas →
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-sm">
                      <thead className="text-left text-white/40">
                        <tr className="border-b border-white/10">
                          <th className="pb-2">ID / Fecha</th>
                          <th className="pb-2">Cliente</th>
                          <th className="pb-2">Vehículo</th>
                          <th className="pb-2">Monto Abono</th>
                          <th className="pb-2">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservationsList.slice(0, 5).map((r) => (
                          <tr key={r.id} className="border-b border-white/5">
                            <td className="py-3 text-xs text-white/50">
                              {r.id} · {new Date(r.date).toLocaleDateString("es-CL")}
                            </td>
                            <td className="py-3 font-medium text-white">{r.clientName}</td>
                            <td className="py-3 text-white/70">{r.vehicleSlug}</td>
                            <td className="py-3 font-bold text-white">{formatCLP(r.amount)}</td>
                            <td className="py-3">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                  r.status === "Pagada"
                                    ? "bg-emerald-400/15 text-emerald-300"
                                    : r.status === "En proceso"
                                    ? "bg-amber-400/15 text-amber-300"
                                    : "bg-red-400/15 text-red-300"
                                }`}
                              >
                                {r.status}
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
    </AdminAuthGate>
  );
}

function Kpi({
  icon,
  value,
  label,
  trend,
}: {
  icon: string;
  value: string;
  label: string;
  trend: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-5">
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/15 text-brand-300 text-lg">
          {icon}
        </span>
        <span className="text-xs text-emerald-400 font-medium">{trend}</span>
      </div>
      <p className="mt-3 text-2xl font-extrabold text-white">{value}</p>
      <p className="text-xs text-white/50">{label}</p>
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
        <text
          key={i}
          x={pad + i * step}
          y={h + 14}
          fill="rgba(255,255,255,0.35)"
          fontSize="10"
          textAnchor="middle"
        >
          {l}
        </text>
      ))}
    </svg>
  );
}
