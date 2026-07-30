"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCLP } from "@/lib/vehicles";
import {
  generateLeads,
  computeKpis,
  funnel,
  segments,
  topLeads,
  demandVsStock,
  financing,
  channels,
  salesTrend,
  recommendations,
  scoreBand,
  formatCLPShort,
} from "@/lib/analytics";
import { HBarChart, Donut, LineForecast, Funnel, Gauge, KpiCard } from "./charts";

type CapturedLead = {
  id: string;
  createdAt: string;
  budget?: number;
  bodyType?: string;
  financing?: boolean;
  intents?: string[];
  models?: string[];
  name?: string;
  contact?: string;
  messages?: number;
};

export default function AnalyticsDashboard() {
  const leads = useMemo(() => generateLeads(), []);
  const kpis = useMemo(() => computeKpis(leads), [leads]);
  const fun = useMemo(() => funnel(leads), [leads]);
  const segs = useMemo(() => segments(leads), [leads]);
  const tops = useMemo(() => topLeads(leads, 10), [leads]);
  const dvs = useMemo(() => demandVsStock(leads), [leads]);
  const fin = useMemo(() => financing(leads), [leads]);
  const chs = useMemo(() => channels(leads), [leads]);
  const trend = useMemo(() => salesTrend(leads), [leads]);
  const recs = useMemo(() => recommendations(leads), [leads]);

  const [captured, setCaptured] = useState<CapturedLead[]>([]);
  useEffect(() => {
    fetch("/api/track")
      .then((r) => (r.ok ? r.json() : { leads: [] }))
      .then((j) => setCaptured(j.leads ?? []))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* Aviso demo */}
      <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 px-4 py-2.5 text-xs text-white/60">
        📊 Inteligencia de negocio con ciencia de datos. Los datos históricos son
        una simulación de demostración; los <strong>leads del chatbot son reales</strong> y
        se capturan en vivo. Listo para conectar la base de datos real.
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon="👥" value={kpis.totalLeads.toLocaleString("es-CL")} label="Leads totales (6 meses)" trend={`+${kpis.momLeadGrowth}% MoM`} />
        <KpiCard icon="🔥" value={String(kpis.hotLeads)} label="Leads calientes por contactar" accent="#F97316" />
        <KpiCard icon="🎯" value={`${kpis.conversion}%`} label="Conversión a venta" accent="#22C55E" />
        <KpiCard icon="💰" value={formatCLPShort(kpis.revenue)} label="Ingresos atribuidos" accent="#7C3AED" />
        <KpiCard icon="📅" value={String(kpis.leads30d)} label="Leads últimos 30 días" />
        <KpiCard icon="🏷️" value={formatCLPShort(kpis.avgTicket)} label="Ticket promedio" accent="#2DD4BF" />
        <KpiCard icon="💳" value={`${kpis.creditRate}%`} label="Simula crédito" accent="#FACC15" />
        <KpiCard icon="⭐" value={String(kpis.avgScore)} label="Score promedio de lead" accent="#49A7FF" />
      </div>

      {/* Tendencia + Segmentos */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card title="Ventas e ingresos — tendencia y proyección" hint="* meses proyectados con regresión lineal">
          <LineForecast months={trend.months} forecast={trend.forecast} />
          <div className="mt-2 flex gap-4 text-xs text-white/50">
            <span><span className="mr-1 inline-block h-2 w-4 rounded bg-brand-500 align-middle" />Histórico</span>
            <span><span className="mr-1 inline-block h-2 w-4 rounded align-middle" style={{ background: "#49A7FF" }} />Proyección</span>
          </div>
        </Card>
        <Card title="Segmentos de clientes (RFM)">
          <Donut data={segs.map((s) => ({ name: s.name, count: s.count, color: s.color }))} />
        </Card>
      </div>

      {/* Embudo + Demanda + Financiamiento */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Embudo de conversión">
          <Funnel stages={fun} />
        </Card>
        <Card title="Demanda vs. stock por tipo" hint="ratio alto = oportunidad de reponer">
          <HBarChart
            data={dvs.map((d) => ({
              label: `${d.body}`,
              value: d.demand,
              sub: `stock ${d.stock} · ratio ${d.ratio}`,
              color: d.status === "alta" ? "#F97316" : d.status === "media" ? "#FACC15" : "#006CFF",
            }))}
          />
        </Card>
        <Card title="Apetito de financiamiento">
          <div className="flex items-center justify-around">
            <Gauge value={fin.wantsPct} label="Pide crédito" suffix="%" color="#FACC15" />
            <Gauge value={fin.approvalRate} label="Aprobación est." suffix="%" color="#22C55E" />
          </div>
          <div className="mt-3">
            <HBarChart data={fin.terms.map((t) => ({ label: t.label, value: t.pct }))} unit="%" color="#2D8CFF" />
          </div>
        </Card>
      </div>

      {/* Canales + Recomendaciones */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card title="Atribución por canal">
          <HBarChart
            data={chs.map((c) => ({
              label: c.name,
              value: c.leads,
              sub: `conv. ${c.conversion}%`,
            }))}
          />
        </Card>
        <Card title="Recomendaciones accionables">
          <ul className="space-y-2.5">
            {recs.map((r, i) => (
              <li
                key={i}
                className={`flex gap-3 rounded-xl border px-3 py-2.5 ${
                  r.tone === "opp"
                    ? "border-brand-500/30 bg-brand-500/5"
                    : r.tone === "warn"
                      ? "border-amber-400/30 bg-amber-400/5"
                      : "border-emerald-400/30 bg-emerald-400/5"
                }`}
              >
                <span className="text-lg">{r.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{r.title}</p>
                  <p className="text-xs text-white/60">{r.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Clientes potenciales */}
      <Card title="Clientes potenciales priorizados" hint="ordenados por score de intención de compra">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-white/40">
              <tr className="border-b border-white/10">
                <th className="pb-2 font-medium">Cliente</th>
                <th className="pb-2 font-medium">Contacto</th>
                <th className="pb-2 font-medium">Segmento</th>
                <th className="pb-2 font-medium">Interés</th>
                <th className="pb-2 font-medium">Presupuesto</th>
                <th className="pb-2 font-medium">Señales</th>
                <th className="pb-2 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {tops.map((l) => {
                const band = scoreBand(l.score);
                return (
                  <tr key={l.id} className="border-b border-white/5">
                    <td className="py-2.5">
                      <p className="font-medium text-white">{l.name}</p>
                      <p className="text-xs text-white/40">{l.region} · {l.ageBand}</p>
                    </td>
                    <td className="py-2.5 text-white/60">{l.phone}</td>
                    <td className="py-2.5">
                      <span className="rounded-full bg-white/8 px-2 py-0.5 text-xs text-white/70">{l.segment}</span>
                    </td>
                    <td className="py-2.5 text-white/70">{l.interestBrand} · {l.interestBody}</td>
                    <td className="py-2.5 text-white/70">{formatCLP(l.budget)}</td>
                    <td className="py-2.5 text-xs text-white/50">{l.reason}</td>
                    <td className="py-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          band === "hot"
                            ? "bg-orange-500/15 text-orange-300"
                            : band === "warm"
                              ? "bg-amber-400/15 text-amber-300"
                              : "bg-white/10 text-white/50"
                        }`}
                      >
                        {band === "hot" ? "🔥" : band === "warm" ? "🌡️" : "❄️"} {l.score}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Leads capturados por el chatbot (en vivo) */}
      <Card
        title="Leads capturados por el chatbot (en vivo)"
        hint="datos inferidos de la conversación, sin fricción para el cliente"
      >
        {captured.length === 0 ? (
          <p className="text-sm text-white/40">
            Aún no hay leads capturados. Abre el chat del sitio, conversa sobre un
            auto (tipo y presupuesto) y aparecerán aquí automáticamente.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-left text-white/40">
                <tr className="border-b border-white/10">
                  <th className="pb-2 font-medium">Fecha</th>
                  <th className="pb-2 font-medium">Interés</th>
                  <th className="pb-2 font-medium">Presupuesto</th>
                  <th className="pb-2 font-medium">Financiamiento</th>
                  <th className="pb-2 font-medium">Intenciones</th>
                  <th className="pb-2 font-medium">Contacto</th>
                </tr>
              </thead>
              <tbody>
                {captured.slice(0, 20).map((c) => (
                  <tr key={c.id} className="border-b border-white/5">
                    <td className="py-2.5 text-white/50">
                      {new Date(c.createdAt).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="py-2.5 text-white/70">{c.bodyType ?? "—"}</td>
                    <td className="py-2.5 text-white/70">{c.budget ? formatCLP(c.budget) : "—"}</td>
                    <td className="py-2.5">
                      {c.financing ? (
                        <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs text-amber-300">Sí</span>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                    </td>
                    <td className="py-2.5 text-xs text-white/50">{(c.intents ?? []).join(", ") || "—"}</td>
                    <td className="py-2.5 text-white/70">{c.contact ?? <span className="text-white/30">anónimo</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-semibold">{title}</h2>
        {hint && <span className="text-xs text-white/35">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
