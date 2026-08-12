/**
 * Motor de analítica de RG Motors (inteligencia de negocio).
 *
 * Genera un dataset DETERMINISTA de leads/clientes (mismo resultado en servidor
 * y cliente, sin desajustes de hidratación) y expone funciones de ciencia de
 * datos: KPIs, embudo de conversión, scoring de leads, segmentación tipo RFM,
 * demanda vs. stock, apetito de financiamiento, atribución de canal, tendencia
 * de ventas con proyección y recomendaciones accionables.
 *
 * Nota: los datos son sintéticos (demo). La arquitectura está lista para
 * enchufar datos reales: basta reemplazar `generateLeads()` por la consulta a
 * la base de datos / eventos reales.
 */
import { vehicles, type Vehicle } from "@/lib/vehicles";

// Ancla temporal fija -> los "meses" del dashboard son estables y deterministas.
export const ANCHOR = new Date("2026-07-15T12:00:00Z");
const DAY = 86_400_000;

export type Source =
  | "Orgánico"
  | "Google Ads"
  | "Instagram"
  | "Facebook"
  | "Referido"
  | "Chatbot";

export type BodyType = Vehicle["bodyType"];

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  region: string;
  ageBand: string;
  source: Source;
  createdDaysAgo: number;
  lastActivityDaysAgo: number;
  interestBody: BodyType;
  interestBrand: string;
  budget: number; // CLP
  wantsFinancing: boolean;
  views: number;
  creditSims: number;
  testDrive: boolean;
  reserved: boolean;
  purchased: boolean;
  score: number; // 0-100
  segment: string;
};

// ---- PRNG determinista (mulberry32) ---------------------------------------
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = [
  "Matías", "Carla", "Pedro", "Ana", "José", "Francisca", "Diego", "Valentina",
  "Cristián", "Camila", "Rodrigo", "Javiera", "Felipe", "Antonia", "Sebastián",
  "Constanza", "Ignacio", "Daniela", "Tomás", "Fernanda", "Nicolás", "Paula",
  "Andrés", "Catalina", "Vicente", "Isidora", "Benjamín", "Josefa", "Gabriel", "Emilia",
];
const LAST = [
  "González", "Muñoz", "Rojas", "Díaz", "Pérez", "Soto", "Contreras", "Silva",
  "Martínez", "Sepúlveda", "Morales", "Rodríguez", "López", "Fuentes", "Torres",
  "Araya", "Flores", "Espinoza", "Castillo", "Tapia", "Reyes", "Gutiérrez", "Vega",
];
const REGIONS = [
  ["Región Metropolitana", 0.52],
  ["Valparaíso", 0.14],
  ["Biobío", 0.1],
  ["Maule", 0.07],
  ["La Araucanía", 0.06],
  ["O'Higgins", 0.06],
  ["Coquimbo", 0.05],
] as const;
const AGE_BANDS = [
  ["18-25", 0.14],
  ["26-35", 0.34],
  ["36-45", 0.28],
  ["46-55", 0.16],
  ["56+", 0.08],
] as const;
const SOURCES: [Source, number][] = [
  ["Orgánico", 0.26],
  ["Google Ads", 0.2],
  ["Instagram", 0.19],
  ["Chatbot", 0.15],
  ["Facebook", 0.12],
  ["Referido", 0.08],
];
const BODY_WEIGHTS: [BodyType, number][] = [
  ["SUV", 0.42],
  ["Camioneta", 0.24],
  ["Sedán", 0.2],
  ["Hatchback", 0.14],
];

function pickWeighted<T>(rnd: () => number, items: readonly (readonly [T, number])[]): T {
  const r = rnd();
  let acc = 0;
  for (const [val, w] of items) {
    acc += w as number;
    if (r <= acc) return val as T;
  }
  return items[items.length - 1][0] as T;
}

function randint(rnd: () => number, min: number, max: number) {
  return Math.floor(rnd() * (max - min + 1)) + min;
}

const BRANDS_BY_BODY: Record<BodyType, string[]> = {
  SUV: ["Toyota", "Mazda", "Hyundai", "Kia"],
  Camioneta: ["Toyota", "Ford"],
  Sedán: ["Chevrolet", "Nissan"],
  Hatchback: ["Suzuki"],
};

function budgetFor(rnd: () => number, body: BodyType): number {
  const base: Record<BodyType, [number, number]> = {
    SUV: [12, 22],
    Camioneta: [16, 28],
    Sedán: [7, 13],
    Hatchback: [8, 13],
  };
  const [lo, hi] = base[body];
  const m = lo + rnd() * (hi - lo);
  return Math.round(m * 1_000_000);
}

// ---- Generación del dataset -----------------------------------------------
let _cache: Lead[] | null = null;

export function generateLeads(): Lead[] {
  if (_cache) return _cache;
  const rnd = mulberry32(20260730);
  const N = 520;
  const leads: Lead[] = [];

  for (let i = 0; i < N; i++) {
    const source = pickWeighted(rnd, SOURCES);
    const interestBody = pickWeighted(rnd, BODY_WEIGHTS);
    const brands = BRANDS_BY_BODY[interestBody];
    const interestBrand = brands[randint(rnd, 0, brands.length - 1)];
    const budget = budgetFor(rnd, interestBody);
    const region = pickWeighted(rnd, REGIONS);
    const ageBand = pickWeighted(rnd, AGE_BANDS);

    // Recencia sesgada a los últimos días (más leads recientes).
    const createdDaysAgo = Math.floor(Math.pow(rnd(), 1.6) * 180);

    // Financiamiento: más probable en presupuestos bajos/medios.
    const wantsFinancing = rnd() < (budget < 15_000_000 ? 0.72 : 0.44);

    // Comportamiento en el sitio.
    const engaged = rnd();
    const views = randint(rnd, 1, 3) + Math.round(engaged * 10);
    const creditSims = wantsFinancing ? randint(rnd, 0, 4) : randint(rnd, 0, 1);
    const testDrive = rnd() < engaged * 0.45;
    const reserved = testDrive && rnd() < 0.5;
    const purchased = reserved && rnd() < 0.62;

    const lastActivityDaysAgo = Math.max(
      0,
      createdDaysAgo - randint(rnd, 0, Math.min(createdDaysAgo, 20))
    );

    const partial: Omit<Lead, "score" | "segment"> = {
      id: `L${String(1000 + i)}`,
      name: `${FIRST[randint(rnd, 0, FIRST.length - 1)]} ${LAST[randint(rnd, 0, LAST.length - 1)]}`,
      phone: `+56 9 ${randint(rnd, 4000, 9999)} ${randint(rnd, 1000, 9999)}`,
      email: "",
      region,
      ageBand,
      source,
      createdDaysAgo,
      lastActivityDaysAgo,
      interestBody,
      interestBrand,
      budget,
      wantsFinancing,
      views,
      creditSims,
      testDrive,
      reserved,
      purchased,
    };
    const score = leadScore(partial);
    const segment = segmentOf(partial, score);
    const email = emailFrom(partial.name, i);
    leads.push({ ...partial, email, score, segment });
  }

  _cache = leads;
  return leads;
}

function emailFrom(name: string, i: number) {
  const clean = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z ]/g, "")
    .split(" ");
  const domains = ["gmail.com", "hotmail.com", "outlook.com", "gmail.com"];
  return `${clean[0]}.${clean[1] ?? "cl"}${i % 7}@${domains[i % domains.length]}`;
}

// ---- Scoring de leads (0-100) ---------------------------------------------
export function leadScore(l: Omit<Lead, "score" | "segment">): number {
  let s = 0;
  s += Math.min(l.views, 12) * 2.2; // interés / navegación
  s += l.creditSims * 7; // intención de compra financiada
  s += l.testDrive ? 16 : 0; // paso fuerte
  s += l.reserved ? 22 : 0; // muy fuerte
  s += l.purchased ? 10 : 0;
  s += l.wantsFinancing ? 5 : 0;
  // Recencia: actividad reciente pesa más.
  s += l.lastActivityDaysAgo <= 7 ? 12 : l.lastActivityDaysAgo <= 21 ? 6 : 0;
  // Presupuesto alineado con inventario disponible.
  const affordable = vehicles.some(
    (v) => v.bodyType === l.interestBody && v.price <= l.budget
  );
  s += affordable ? 6 : -4;
  return Math.max(0, Math.min(100, Math.round(s)));
}

export function scoreBand(score: number): "hot" | "warm" | "cold" {
  return score >= 70 ? "hot" : score >= 40 ? "warm" : "cold";
}

// ---- Segmentación (RFM / reglas de negocio) --------------------------------
function segmentOf(l: Omit<Lead, "score" | "segment">, score: number): string {
  if (l.purchased) return "Cliente comprador";
  if (l.budget >= 18_000_000) return "Comprador premium";
  if (l.interestBody === "Camioneta") return "Trabajo / 4x4";
  if (l.wantsFinancing && l.budget < 14_000_000) return "Busca financiamiento";
  if (l.budget < 11_000_000) return "Primer auto";
  if (l.interestBody === "SUV") return "Familiar SUV";
  if (score < 35) return "Indeciso";
  return "Explorador";
}

export const SEGMENT_COLORS: Record<string, string> = {
  "Cliente comprador": "#22C55E",
  "Comprador premium": "#7C3AED",
  "Familiar SUV": "#006CFF",
  "Busca financiamiento": "#FACC15",
  "Trabajo / 4x4": "#F97316",
  "Primer auto": "#2DD4BF",
  Indeciso: "#8A9099",
  Explorador: "#49A7FF",
};

// ---- KPIs -----------------------------------------------------------------
export type Kpis = {
  totalLeads: number;
  leads30d: number;
  hotLeads: number;
  conversion: number; // % leads que compran
  reservationRate: number; // % que reserva
  creditRate: number; // % que simula crédito
  avgTicket: number;
  revenue: number;
  avgScore: number;
  momLeadGrowth: number; // % crecimiento de leads mes vs mes
};

export function computeKpis(leads: Lead[]): Kpis {
  const total = leads.length;
  const purchased = leads.filter((l) => l.purchased);
  const revenue = purchased.reduce((a, l) => a + estClose(l), 0);
  const leads30d = leads.filter((l) => l.createdDaysAgo <= 30).length;
  const leadsPrev30 = leads.filter(
    (l) => l.createdDaysAgo > 30 && l.createdDaysAgo <= 60
  ).length;
  return {
    totalLeads: total,
    leads30d,
    hotLeads: leads.filter((l) => scoreBand(l.score) === "hot").length,
    conversion: pct(purchased.length, total),
    reservationRate: pct(leads.filter((l) => l.reserved).length, total),
    creditRate: pct(leads.filter((l) => l.creditSims > 0).length, total),
    avgTicket: purchased.length ? Math.round(revenue / purchased.length) : 0,
    revenue,
    avgScore: Math.round(leads.reduce((a, l) => a + l.score, 0) / total),
    momLeadGrowth: leadsPrev30 ? Math.round(((leads30d - leadsPrev30) / leadsPrev30) * 100) : 0,
  };
}

/** Precio de cierre estimado según el auto más caro que calza con el lead. */
function estClose(l: Lead): number {
  const match = vehicles
    .filter((v) => v.bodyType === l.interestBody && v.price <= l.budget)
    .sort((a, b) => b.price - a.price)[0];
  return match ? match.price : Math.round(l.budget * 0.85);
}

// ---- Embudo de conversión --------------------------------------------------
export function funnel(leads: Lead[]) {
  const total = leads.length;
  const stages = [
    { label: "Visitaron fichas", value: total },
    { label: "Simularon crédito", value: leads.filter((l) => l.creditSims > 0).length },
    { label: "Agendaron prueba", value: leads.filter((l) => l.testDrive).length },
    { label: "Reservaron", value: leads.filter((l) => l.reserved).length },
    { label: "Compraron", value: leads.filter((l) => l.purchased).length },
  ];
  return stages.map((s, i) => ({
    ...s,
    pct: pct(s.value, total),
    dropFromPrev: i === 0 ? 0 : pct(stages[i].value, stages[i - 1].value),
  }));
}

// ---- Segmentos -------------------------------------------------------------
export function segments(leads: Lead[]) {
  const map = new Map<string, Lead[]>();
  for (const l of leads) {
    if (!map.has(l.segment)) map.set(l.segment, []);
    map.get(l.segment)!.push(l);
  }
  return [...map.entries()]
    .map(([name, ls]) => ({
      name,
      count: ls.length,
      pct: pct(ls.length, leads.length),
      avgScore: Math.round(ls.reduce((a, l) => a + l.score, 0) / ls.length),
      avgBudget: Math.round(ls.reduce((a, l) => a + l.budget, 0) / ls.length),
      conversion: pct(ls.filter((l) => l.purchased).length, ls.length),
      color: SEGMENT_COLORS[name] ?? "#49A7FF",
    }))
    .sort((a, b) => b.count - a.count);
}

// ---- Clientes potenciales (top leads por score) ----------------------------
export function topLeads(leads: Lead[], n = 10) {
  return [...leads]
    .filter((l) => !l.purchased)
    .sort((a, b) => b.score - a.score || a.lastActivityDaysAgo - b.lastActivityDaysAgo)
    .slice(0, n)
    .map((l) => ({ ...l, reason: reasonFor(l) }));
}

function reasonFor(l: Lead): string {
  const bits: string[] = [];
  if (l.reserved) bits.push("reservó");
  if (l.testDrive) bits.push("agendó prueba");
  if (l.creditSims > 0) bits.push(`${l.creditSims} simulación${l.creditSims > 1 ? "es" : ""} de crédito`);
  if (l.lastActivityDaysAgo <= 7) bits.push("activo esta semana");
  if (bits.length === 0) bits.push(`${l.views} vistas de fichas`);
  return bits.slice(0, 2).join(" · ");
}

// ---- Demanda vs. stock -----------------------------------------------------
export function demandVsStock(leads: Lead[]) {
  const bodies: BodyType[] = ["SUV", "Camioneta", "Sedán", "Hatchback"];
  return bodies.map((body) => {
    const demand = leads.filter((l) => l.interestBody === body).length;
    const stock = vehicles.filter((v) => v.bodyType === body).length;
    const ratio = stock ? demand / stock : demand;
    return {
      body,
      demand,
      demandPct: pct(demand, leads.length),
      stock,
      ratio: Math.round(ratio * 10) / 10,
      status: ratio > 55 ? "alta" : ratio > 35 ? "media" : "ok",
    };
  }).sort((a, b) => b.ratio - a.ratio);
}

// ---- Apetito de financiamiento ---------------------------------------------
export function financing(leads: Lead[]) {
  const wants = leads.filter((l) => l.wantsFinancing);
  const rnd = mulberry32(7); // aprobación sintética estable
  let approved = 0;
  for (const l of wants) {
    const p = l.budget < 12_000_000 ? 0.62 : l.budget < 18_000_000 ? 0.74 : 0.85;
    if (rnd() < p) approved++;
  }
  return {
    wantsPct: pct(wants.length, leads.length),
    approvalRate: pct(approved, wants.length),
    avgDown: 20,
    terms: [
      { label: "24 cuotas", pct: 14 },
      { label: "36 cuotas", pct: 27 },
      { label: "48 cuotas", pct: 38 },
      { label: "60 cuotas", pct: 21 },
    ],
  };
}

// ---- Atribución de canal ---------------------------------------------------
export function channels(leads: Lead[]) {
  const map = new Map<Source, Lead[]>();
  for (const l of leads) {
    if (!map.has(l.source)) map.set(l.source, []);
    map.get(l.source)!.push(l);
  }
  return [...map.entries()]
    .map(([name, ls]) => ({
      name,
      leads: ls.length,
      conversion: pct(ls.filter((l) => l.purchased).length, ls.length),
      revenue: ls.filter((l) => l.purchased).reduce((a, l) => a + estClose(l), 0),
      avgScore: Math.round(ls.reduce((a, l) => a + l.score, 0) / ls.length),
    }))
    .sort((a, b) => b.leads - a.leads);
}

// ---- Tendencia de ventas + proyección (regresión lineal) -------------------
export function salesTrend(leads: Lead[]) {
  const months: { key: string; label: string; leads: number; sales: number; revenue: number }[] = [];
  const MNAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  for (let back = 5; back >= 0; back--) {
    const d = new Date(ANCHOR.getTime() - back * 30 * DAY);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MNAMES[d.getMonth()], leads: 0, sales: 0, revenue: 0 });
  }
  const idxOf = (daysAgo: number) => 5 - Math.min(5, Math.floor(daysAgo / 30));
  for (const l of leads) {
    const idx = idxOf(l.createdDaysAgo);
    if (idx < 0 || idx > 5) continue;
    months[idx].leads++;
    if (l.purchased) {
      months[idx].sales++;
      months[idx].revenue += estClose(l);
    }
  }
  // Regresión lineal simple sobre ingresos para proyectar 2 meses.
  const ys = months.map((m) => m.revenue);
  const n = ys.length;
  const xs = ys.map((_, i) => i);
  const sx = xs.reduce((a, b) => a + b, 0);
  const sy = ys.reduce((a, b) => a + b, 0);
  const sxy = xs.reduce((a, x, i) => a + x * ys[i], 0);
  const sxx = xs.reduce((a, x) => a + x * x, 0);
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx || 1);
  const intercept = (sy - slope * sx) / n;
  const forecast = [1, 2].map((k) => {
    const d = new Date(ANCHOR.getTime() + k * 30 * DAY);
    return { label: MNAMES[d.getMonth()], revenue: Math.max(0, Math.round(intercept + slope * (n - 1 + k))) };
  });
  return { months, forecast, slope };
}

// ---- Recomendaciones accionables ------------------------------------------
export function recommendations(leads: Lead[]): { icon: string; title: string; detail: string; tone: "opp" | "warn" | "good" }[] {
  const recs: { icon: string; title: string; detail: string; tone: "opp" | "warn" | "good" }[] = [];
  const hot = leads.filter((l) => scoreBand(l.score) === "hot" && !l.purchased);
  const hotStale = hot.filter((l) => l.lastActivityDaysAgo > 3);
  if (hot.length) {
    recs.push({
      icon: "🔥",
      title: `${hot.length} leads calientes por contactar`,
      detail: `${hotStale.length} llevan más de 3 días sin actividad. Un llamado hoy puede cerrar ventas de alto valor.`,
      tone: "opp",
    });
  }
  const dvs = demandVsStock(leads);
  const gap = dvs.find((d) => d.status === "alta");
  if (gap) {
    recs.push({
      icon: "📦",
      title: `Alta demanda de ${gap.body} con poco stock`,
      detail: `${gap.demandPct}% del interés apunta a ${gap.body} y solo tienes ${gap.stock} en catálogo. Reponer inventario ahí aumentaría ventas.`,
      tone: "warn",
    });
  }
  const ch = channels(leads).slice().sort((a, b) => b.conversion - a.conversion)[0];
  if (ch) {
    recs.push({
      icon: "📣",
      title: `${ch.name} es tu canal con mejor conversión (${ch.conversion}%)`,
      detail: `Reasignar presupuesto de marketing hacia ${ch.name} mejora el retorno por lead.`,
      tone: "good",
    });
  }
  const fin = financing(leads);
  recs.push({
    icon: "💳",
    title: `${fin.wantsPct}% de los leads pide financiamiento`,
    detail: `La aprobación estimada es ${fin.approvalRate}%. Priorizar convenios con financieras y pre-aprobación acelera el cierre.`,
    tone: "opp",
  });
  const tr = salesTrend(leads);
  if (tr.slope > 0) {
    recs.push({
      icon: "📈",
      title: "Tendencia de ventas al alza",
      detail: `La proyección estima ${formatCLPShort(tr.forecast[0].revenue)} el próximo mes. Mantén el stock de los modelos más buscados.`,
      tone: "good",
    });
  }
  return recs;
}

// ---- Helpers ---------------------------------------------------------------
function pct(a: number, b: number) {
  return b ? Math.round((a / b) * 100) : 0;
}

export function formatCLPShort(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}MM`;
  if (v >= 1_000_000) return `$${Math.round(v / 1_000_000)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}K`;
  return `$${v}`;
}
