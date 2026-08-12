"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { asset } from "@/lib/asset";
import { vehicles, formatCLP, estimateMonthly } from "@/lib/vehicles";

const SECTIONS = [
  { id: "resumen", label: "Resumen", icon: "▦" },
  { id: "reservas", label: "Mis reservas", icon: "★" },
  { id: "creditos", label: "Mis créditos", icon: "💳" },
  { id: "pagos", label: "Mis pagos", icon: "↔" },
  { id: "favoritos", label: "Favoritos", icon: "♡" },
] as const;

type Section = (typeof SECTIONS)[number]["id"];

const reservas = [vehicles[0], vehicles[3]];
const favoritos = [vehicles[1], vehicles[5], vehicles[7]];

export default function CuentaPage() {
  const [section, setSection] = useState<Section>("resumen");

  return (
    <div className="min-h-screen bg-ink-950">
      <TopBar />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-500/20 text-lg text-brand-300">
                M
              </span>
              <div>
                <p className="text-xs text-white/40">Hola,</p>
                <p className="font-semibold">Matías</p>
              </div>
            </div>
            <nav className="mt-3 space-y-1">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    section === s.id
                      ? "bg-brand-500/15 text-white"
                      : "text-white/55 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="w-4 text-center">{s.icon}</span> {s.label}
                </button>
              ))}
              <Link
                href="/"
                className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400/80 hover:bg-white/5"
              >
                <span className="w-4 text-center">⏻</span> Cerrar sesión
              </Link>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1">
          {/* Mobile section switcher */}
          <div className="mb-4 flex gap-2 overflow-x-auto lg:hidden">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm ${
                  section === s.id ? "bg-brand-500 text-white" : "bg-ink-800 text-white/60"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {section === "resumen" && (
            <>
              <h1 className="text-2xl font-bold">Resumen</h1>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <StatCard icon="★" value="2" label="Reservas activas" />
                <StatCard icon="💳" value="1" label="Solicitudes de crédito" />
                <StatCard icon="♡" value="3" label="Favoritos" />
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Panel title="Reservas activas">
                  {reservas.map((v) => (
                    <ReservaRow key={v.slug} slug={v.slug} />
                  ))}
                </Panel>

                <Panel title="Estado de mi crédito">
                  <div className="rounded-xl bg-ink-900 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">Toyota RAV4 2022</span>
                      <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-xs text-amber-300">
                        En evaluación
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-2/3 bg-brand-500" />
                    </div>
                    <p className="mt-2 text-xs text-white/40">
                      Paso 2 de 3 · Te notificaremos por correo.
                    </p>
                  </div>
                  <div className="mt-3 rounded-xl bg-ink-900 p-4 text-sm">
                    <p className="text-white/60">Cuota estimada</p>
                    <p className="mt-1 text-2xl font-bold text-brand-300">
                      {formatCLP(estimateMonthly(vehicles[0].price))}
                    </p>
                  </div>
                </Panel>
              </div>

              <div className="mt-6">
                <Panel title="Documentos recientes">
                  {["Contrato_reserva.pdf", "Informe_mecanico.pdf", "Simulacion_credito.pdf"].map((d) => (
                    <div key={d} className="flex items-center justify-between rounded-xl bg-ink-900 px-4 py-3 text-sm">
                      <span className="flex items-center gap-2 text-white/70">📄 {d}</span>
                      <button className="text-brand-400 hover:text-brand-300">Descargar</button>
                    </div>
                  ))}
                </Panel>
              </div>
            </>
          )}

          {section === "reservas" && (
            <>
              <h1 className="text-2xl font-bold">Mis reservas</h1>
              <div className="mt-4 space-y-3">
                {reservas.map((v) => (
                  <ReservaRow key={v.slug} slug={v.slug} />
                ))}
              </div>
            </>
          )}

          {section === "favoritos" && (
            <>
              <h1 className="text-2xl font-bold">Favoritos</h1>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {favoritos.map((v) => (
                  <Link
                    key={v.slug}
                    href={`/vehiculo/${v.slug}`}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-ink-800/60 transition hover:border-brand-500/50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset(v.image)} alt={v.model} className="aspect-video w-full object-cover" />
                    <div className="p-3">
                      <p className="font-medium">{v.brand} {v.model}</p>
                      <p className="text-sm text-brand-300">{formatCLP(v.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {(section === "creditos" || section === "pagos") && (
            <>
              <h1 className="text-2xl font-bold">
                {section === "creditos" ? "Mis créditos" : "Mis pagos"}
              </h1>
              <div className="mt-4 rounded-2xl border border-white/10 bg-ink-800/60 p-8 text-center text-white/50">
                {section === "creditos"
                  ? "Tienes 1 solicitud de crédito en evaluación."
                  : "No tienes pagos pendientes. Tu reserva está al día."}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <header className="border-b border-white/10 bg-ink-900/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/">
          <Logo size={32} tagline={false} />
        </Link>
        <Link href="/" className="text-sm text-white/50 hover:text-white">← Volver al sitio</Link>
      </div>
    </header>
  );
}

function StatCard({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-5">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-500/15 text-brand-300">{icon}</span>
      <p className="mt-3 text-3xl font-bold">{value}</p>
      <p className="text-sm text-white/50">{label}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-5">
      <h2 className="mb-3 font-semibold">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ReservaRow({ slug }: { slug: string }) {
  const v = vehicles.find((x) => x.slug === slug)!;
  return (
    <div className="flex items-center gap-3 rounded-xl bg-ink-900 p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset(v.image)} alt={v.model} className="h-14 w-20 rounded-lg object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{v.brand} {v.model}</p>
        <p className="text-xs text-white/50">Reserva pagada · {formatCLP(200000)}</p>
      </div>
      <Link href={`/vehiculo/${v.slug}`} className="text-sm text-brand-400 hover:text-brand-300">
        Ver detalle
      </Link>
    </div>
  );
}
