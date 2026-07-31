"use client";

import Link from "next/link";
import { vehicles, formatCLP, estimateMonthly } from "@/lib/vehicles";
import { COMPANY } from "@/lib/company";

const STATUS = {
  emerald: "bg-emerald-400/15 text-emerald-300",
  amber: "bg-amber-400/15 text-amber-300",
  red: "bg-red-400/15 text-red-300",
  blue: "bg-brand-500/15 text-brand-300",
} as const;

function Badge({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: keyof typeof STATUS;
}) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS[tone]}`}>
      {children}
    </span>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

/** Inventario completo del catálogo (demo). */
export function VehiclesSection() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/50">
          {vehicles.length} vehículos publicados · stock demo para presentación
        </p>
        <button className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400">
          + Publicar vehículo
        </button>
      </div>
      <Panel title="Inventario">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-sm">
            <thead className="text-left text-white/40">
              <tr className="border-b border-white/10">
                <th className="pb-2 font-medium">Vehículo</th>
                <th className="pb-2 font-medium">Año</th>
                <th className="pb-2 font-medium">Km</th>
                <th className="pb-2 font-medium">Precio</th>
                <th className="pb-2 font-medium">360°</th>
                <th className="pb-2 font-medium">Estado</th>
                <th className="pb-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.slug} className="border-b border-white/5">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={v.image} alt={v.model} className="h-10 w-14 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium">
                          {v.brand} {v.model}
                        </p>
                        <p className="text-xs text-white/40">{v.version}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-white/70">{v.year}</td>
                  <td className="py-3 text-white/70">{v.km.toLocaleString("es-CL")}</td>
                  <td className="py-3 text-white/70">{formatCLP(v.price)}</td>
                  <td className="py-3">
                    {v.spin ? <Badge tone="emerald">Activo</Badge> : <Badge tone="amber">3D</Badge>}
                  </td>
                  <td className="py-3">
                    {v.featured ? <Badge>Destacado</Badge> : <Badge tone="emerald">Publicado</Badge>}
                  </td>
                  <td className="py-3 text-right">
                    <Link href={`/vehiculo/${v.slug}`} className="text-xs text-brand-300 hover:underline">
                      Ver ficha
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

const RESERVAS = [
  { id: "R-1042", c: "Matías González", phone: "+56 9 8123 4567", v: 0, amount: 200000, s: "Pagada", tone: "emerald" as const, date: "28 jul 2026" },
  { id: "R-1041", c: "Carla Muñoz", phone: "+56 9 9345 1122", v: 3, amount: 200000, s: "En proceso", tone: "amber" as const, date: "27 jul 2026" },
  { id: "R-1040", c: "Pedro Rivas", phone: "+56 9 7766 2211", v: 1, amount: 200000, s: "Pagada", tone: "emerald" as const, date: "26 jul 2026" },
  { id: "R-1039", c: "Ana Torres", phone: "+56 9 5555 8899", v: 8, amount: 200000, s: "Cancelada", tone: "red" as const, date: "25 jul 2026" },
  { id: "R-1038", c: "Diego Soto", phone: "+56 9 6677 3344", v: 2, amount: 200000, s: "Pagada", tone: "emerald" as const, date: "24 jul 2026" },
  { id: "R-1037", c: "Valentina Rojas", phone: "+56 9 9988 1122", v: 5, amount: 200000, s: "En proceso", tone: "amber" as const, date: "23 jul 2026" },
];

export function ReservationsSection() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <MiniKpi label="Reservas activas" value="16" />
        <MiniKpi label="Pagadas este mes" value="11" />
        <MiniKpi label="Monto retenido" value="$3.2M" />
      </div>
      <Panel title="Reservas recientes">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-white/40">
              <tr className="border-b border-white/10">
                <th className="pb-2 font-medium">ID</th>
                <th className="pb-2 font-medium">Cliente</th>
                <th className="pb-2 font-medium">Vehículo</th>
                <th className="pb-2 font-medium">Monto</th>
                <th className="pb-2 font-medium">Fecha</th>
                <th className="pb-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {RESERVAS.map((r) => {
                const v = vehicles[r.v];
                return (
                  <tr key={r.id} className="border-b border-white/5">
                    <td className="py-3 text-white/50">{r.id}</td>
                    <td className="py-3">
                      <p className="font-medium">{r.c}</p>
                      <p className="text-xs text-white/40">{r.phone}</p>
                    </td>
                    <td className="py-3 text-white/70">
                      {v.brand} {v.model}
                    </td>
                    <td className="py-3 text-white/70">{formatCLP(r.amount)}</td>
                    <td className="py-3 text-white/50">{r.date}</td>
                    <td className="py-3">
                      <Badge tone={r.tone}>{r.s}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

const CREDITOS = [
  { c: "José Pérez", v: 0, pie: 20, plazo: 48, cuota: estimateMonthly(vehicles[0].price), s: "Pre-aprobado", tone: "emerald" as const },
  { c: "Francisca Díaz", v: 1, pie: 30, plazo: 36, cuota: estimateMonthly(vehicles[1].price, 30, 36), s: "En evaluación", tone: "amber" as const },
  { c: "Andrés Vega", v: 3, pie: 20, plazo: 60, cuota: estimateMonthly(vehicles[3].price, 20, 60), s: "Pre-aprobado", tone: "emerald" as const },
  { c: "Camila Soto", v: 4, pie: 15, plazo: 48, cuota: estimateMonthly(vehicles[4].price, 15, 48), s: "Rechazado", tone: "red" as const },
  { c: "Ignacio Muñoz", v: 7, pie: 25, plazo: 36, cuota: estimateMonthly(vehicles[7].price, 25, 36), s: "En evaluación", tone: "amber" as const },
];

export function CreditsSection() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <MiniKpi label="Solicitudes del mes" value="28" />
        <MiniKpi label="Tasa de aprobación" value="74%" />
        <MiniKpi label="Ticket promedio" value="$16.2M" />
      </div>
      <Panel title="Solicitudes de crédito">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="text-left text-white/40">
              <tr className="border-b border-white/10">
                <th className="pb-2 font-medium">Cliente</th>
                <th className="pb-2 font-medium">Vehículo</th>
                <th className="pb-2 font-medium">Pie</th>
                <th className="pb-2 font-medium">Plazo</th>
                <th className="pb-2 font-medium">Cuota est.</th>
                <th className="pb-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {CREDITOS.map((c, i) => {
                const v = vehicles[c.v];
                return (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-3 font-medium">{c.c}</td>
                    <td className="py-3 text-white/70">
                      {v.brand} {v.model}
                    </td>
                    <td className="py-3 text-white/70">{c.pie}%</td>
                    <td className="py-3 text-white/70">{c.plazo} meses</td>
                    <td className="py-3 text-brand-300">{formatCLP(c.cuota)}</td>
                    <td className="py-3">
                      <Badge tone={c.tone}>{c.s}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

const CLIENTES = [
  { name: "Matías González", email: "matias.g@gmail.com", phone: "+56 9 8123 4567", segment: "Comprador premium", score: 92, last: "Hoy" },
  { name: "Carla Muñoz", email: "carla.m@outlook.com", phone: "+56 9 9345 1122", segment: "Familiar SUV", score: 78, last: "Ayer" },
  { name: "Pedro Rivas", email: "pedro.r@gmail.com", phone: "+56 9 7766 2211", segment: "Trabajo / 4x4", score: 85, last: "2 días" },
  { name: "Ana Torres", email: "ana.t@hotmail.com", phone: "+56 9 5555 8899", segment: "Primer auto", score: 41, last: "5 días" },
  { name: "Diego Soto", email: "diego.s@gmail.com", phone: "+56 9 6677 3344", segment: "Busca financiamiento", score: 67, last: "1 sem" },
  { name: "Valentina Rojas", email: "vale.r@gmail.com", phone: "+56 9 9988 1122", segment: "Familiar SUV", score: 74, last: "1 sem" },
  { name: "José Pérez", email: "jose.p@outlook.com", phone: "+56 9 4433 2211", segment: "Comprador premium", score: 88, last: "2 sem" },
  { name: "Francisca Díaz", email: "fran.d@gmail.com", phone: "+56 9 1122 3344", segment: "Indeciso", score: 33, last: "3 sem" },
];

export function ClientsSection() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <MiniKpi label="Clientes activos" value="520" />
        <MiniKpi label="Leads calientes" value="38" />
        <MiniKpi label="Nuevos (30 días)" value="86" />
      </div>
      <Panel title="Base de clientes">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-white/40">
              <tr className="border-b border-white/10">
                <th className="pb-2 font-medium">Cliente</th>
                <th className="pb-2 font-medium">Contacto</th>
                <th className="pb-2 font-medium">Segmento</th>
                <th className="pb-2 font-medium">Score</th>
                <th className="pb-2 font-medium">Última actividad</th>
              </tr>
            </thead>
            <tbody>
              {CLIENTES.map((c) => (
                <tr key={c.email} className="border-b border-white/5">
                  <td className="py-3">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-white/40">{c.email}</p>
                  </td>
                  <td className="py-3 text-white/70">{c.phone}</td>
                  <td className="py-3">
                    <span className="rounded-full bg-white/8 px-2 py-0.5 text-xs text-white/70">
                      {c.segment}
                    </span>
                  </td>
                  <td className="py-3">
                    <Badge tone={c.score >= 70 ? "emerald" : c.score >= 40 ? "amber" : "red"}>
                      {c.score}
                    </Badge>
                  </td>
                  <td className="py-3 text-white/50">{c.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

export function ConfigSection() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Datos de la empresa">
        <dl className="space-y-3 text-sm">
          <Row label="Nombre" value={COMPANY.name} />
          <Row label="Teléfono" value={COMPANY.phoneDisplay} />
          <Row label="WhatsApp" value={COMPANY.phoneDisplay} />
          <Row label="Correo" value={COMPANY.email} />
          <Row label="Dirección" value={COMPANY.address} />
          <Row label="Horario" value={COMPANY.hours} />
        </dl>
        <p className="mt-4 text-xs text-white/40">
          Estos datos se usan en contacto, footer y botón de WhatsApp de las fichas.
        </p>
      </Panel>
      <Panel title="Preferencias del sistema">
        <ul className="space-y-3 text-sm">
          <Toggle label="Mostrar tours 360° en fichas" on />
          <Toggle label="Captura de leads desde el chatbot" on />
          <Toggle label="Simulador de crédito visible" on />
          <Toggle label="Reserva online habilitada" on />
          <Toggle label="Modo estudio IA al subir videos" on />
        </ul>
        <button className="mt-5 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-400">
          Guardar cambios
        </button>
      </Panel>
    </div>
  );
}

function MiniKpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-4">
      <p className="text-xs text-white/50">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
      <dt className="text-white/40">{label}</dt>
      <dd className="text-right text-white/80">{value}</dd>
    </div>
  );
}

function Toggle({ label, on }: { label: string; on?: boolean }) {
  return (
    <li className="flex items-center justify-between rounded-lg border border-white/10 bg-ink-900/50 px-3 py-2.5">
      <span className="text-white/70">{label}</span>
      <span
        className={`relative h-5 w-9 rounded-full transition ${on ? "bg-brand-500" : "bg-white/15"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
            on ? "left-4" : "left-0.5"
          }`}
        />
      </span>
    </li>
  );
}
