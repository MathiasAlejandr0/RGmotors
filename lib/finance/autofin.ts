/**
 * Motor de simulación — RG Motors × Autofin (Trinidad / spider fee).
 *
 * Estrategia comercial (vitrina):
 *   Cotizar escenario NORMAL + seguros (ValorCuota Trinidad público).
 *   No publicar tasas preferente/gold (1,9% / 1,5%): en sala esas cuotas bajan
 *   y la negociación cierra mejor; en web anclarían expectativas demasiado bajas.
 *
 * Tasas por tramo (precio · pie · plazo) calibradas a:
 *   POST https://webapi.autofin.cl/v1/spider/fee  Producto 2 = AUTOPLAN USADOS
 *   Seguros Desgravamen + Cesantía (cuota Trinidad all-in).
 *
 * Regenerar tabla:
 *   node scripts/scrape-autofin-rate-matrix.mjs
 *   node scripts/generate-autofin-rate-table.mjs
 */

/** Copy único para UI: cuota conservadora en web, mejora posible en sucursal. */
export const CREDIT_QUOTE_COPY = {
  productBadge: "Auto Plan Usados · escenario normal",
  shortDisclaimer:
    "Cuota referencial del escenario normal Autofin (incluye desgravamen y cesantía). En sucursal, según tu evaluación, la cuota puede mantenerse o mejorar.",
  longDisclaimer:
    "Simulamos el escenario normal de Autofin (Auto Plan Usados), con seguros típicos ya incluidos en la cuota. No usamos tasas preferentes de campaña: así llegas a sucursal con una referencia realista. Si tu perfil califica a una mejor condición, la cuota en sala puede bajar. No es aprobación de crédito.",
  successHint:
    "En sucursal Autofin evalúa tu caso; si calificas a una mejor tasa, la cuota puede ser menor a esta referencia.",
} as const;

import {
  AUTOFIN_RATE_ANCHORS,
  AUTOFIN_RATE_TABLE_META,
  type AutofinRateAnchor,
} from "@/lib/finance/autofin-rate-table";

/** Fallback / legacy: mediana de la matriz Autofin (no usar como tasa única). */
export const AUTOFIN_DEFAULT_MONTHLY_RATE = AUTOFIN_RATE_TABLE_META.fallbackRate;

/** Tasa legada de partners (subestimaba vs autofin.cl). */
export const AUTOFIN_LEGACY_PARTNER_RATE = 0.0185;

/** Tasa intermedia 2,5% usada brevemente. */
export const AUTOFIN_INTERMEDIATE_RATE = 0.025;

/** Piso conservador (p90 matriz) — evita cuotas más baratas que sala si falta ancla. */
export const AUTOFIN_CONSERVATIVE_FLOOR = AUTOFIN_RATE_TABLE_META.conservativeFloor;

export const AUTOFIN_PRODUCT_AUTO_PLAN_USADOS = {
  code: 2 as const,
  name: "Auto Plan Usados",
  spiderName: AUTOFIN_RATE_TABLE_META.productName,
};

export const CREDIT_RULES = {
  minDownPct: 20,
  maxDownPct: 60,
  minTermMonths: 12,
  maxTermMonths: 48,
  termStep: 6,
  deferredFirstPaymentDays: 60,
};

/** Tipos de vehículo como en autofin.cl */
export const VEHICLE_TYPES = [
  { id: "auto", label: "Auto", match: ["Sedán", "Hatchback", "Coupé", "Deportivo"] },
  { id: "suv", label: "SUV", match: ["SUV", "Crossover"] },
  { id: "camioneta", label: "Camioneta", match: ["Pickup", "Camioneta"] },
  { id: "camion", label: "Camión", match: ["Camión", "Truck"] },
  { id: "furgon", label: "Furgón", match: ["Furgón", "Van", "Comercial"] },
] as const;

export type VehicleTypeId = (typeof VEHICLE_TYPES)[number]["id"];

export function matchVehicleType(bodyType?: string): VehicleTypeId {
  const b = (bodyType || "").toLowerCase();
  for (const t of VEHICLE_TYPES) {
    if (t.match.some((m) => b.includes(m.toLowerCase()))) return t.id;
  }
  return "auto";
}

export const AUTOFIN_OPERATIONAL_FEES = {
  notaryAndPledge: 180000,
  registration: 45000,
  admin: 75000,
};

export const AUTOFIN_PUBLIC_INSURANCE_FLAGS = {
  Desgravamen: true,
  Cesantia: true,
  AutoProtegido: false,
} as const;

const DOWN_BANDS = [20, 30, 40, 50] as const;
const TERM_BANDS = [24, 36, 48] as const;

export function frenchMonthlyPayment(
  financed: number,
  monthlyRate: number,
  termMonths: number,
): number {
  if (financed <= 0 || termMonths <= 0) return 0;
  if (monthlyRate <= 0) return Math.round(financed / termMonths);
  const i = monthlyRate;
  const factor = (i * Math.pow(1 + i, termMonths)) / (Math.pow(1 + i, termMonths) - 1);
  return Math.round(financed * factor);
}

export function annualCaeFromMonthlyRate(monthlyRate: number): number {
  return (Math.pow(1 + monthlyRate, 12) - 1) * 100;
}

export function approximateCaeWithFees(
  financed: number,
  monthlyRate: number,
  termMonths: number,
  feesTotal: number,
): number {
  if (financed <= 0 || termMonths <= 0) return 0;
  const basePayment = frenchMonthlyPayment(financed, monthlyRate, termMonths);
  const feePerMonth = Math.round(feesTotal / termMonths);
  const paymentWithFees = basePayment + feePerMonth;
  let lo = 0;
  let hi = 0.2;
  for (let n = 0; n < 40; n++) {
    const mid = (lo + hi) / 2;
    const p = frenchMonthlyPayment(financed, mid, termMonths);
    if (p < paymentWithFees) lo = mid;
    else hi = mid;
  }
  return annualCaeFromMonthlyRate((lo + hi) / 2);
}

export type CreditInsuranceBreakdown = {
  vehicleDamage: number;
  life: number;
  unemployment: number;
  total: number;
  /** true = ya van dentro de la cuota Trinidad (no se suman aparte). */
  bakedIntoRate: boolean;
};

export type AutofinProductKind = "auto-plan-usados";

export type CreditSimulationInput = {
  price: number;
  downPct: number;
  termMonths: number;
  /** Override admin: solo aplica si es ≥ tasa de tabla (nunca baja la cuota). */
  monthlyRate?: number;
  vehicleYear?: number;
  vehicleType?: VehicleTypeId;
  /** Por ahora solo Auto Plan Usados (Renuévate exige cuotón VFMG). */
  productKind?: AutofinProductKind;
};

export type CreditSimulationResult = {
  downPayment: number;
  financed: number;
  monthlyPayment: number;
  capitalInstallment: number;
  insurance: CreditInsuranceBreakdown;
  termMonths: number;
  downPct: number;
  monthlyRate: number;
  caeApprox: number;
  caeWithFeesApprox: number;
  operationalFees: number;
  totalCreditCost: number;
  totalCostWithDown: number;
  deferredFirstPaymentDays: number;
  vehicleType?: VehicleTypeId;
  productCode: number;
  productName: string;
  rateSource: "table" | "table+admin-uplift" | "conservative-fallback";
  warnings: string[];
  ok: boolean;
};

export function clampDownPct(downPct: number): number {
  return Math.max(
    CREDIT_RULES.minDownPct,
    Math.min(CREDIT_RULES.maxDownPct, Math.round(downPct)),
  );
}

export function clampTermMonths(termMonths: number): number {
  const { minTermMonths, maxTermMonths, termStep } = CREDIT_RULES;
  const allowed: number[] = [];
  for (let t = minTermMonths; t <= maxTermMonths; t += termStep) allowed.push(t);
  if (allowed.includes(termMonths)) return termMonths;
  return allowed.reduce((best, t) =>
    Math.abs(t - termMonths) < Math.abs(best - termMonths) ? t : best,
  );
}

function snapDownBand(downPct: number): (typeof DOWN_BANDS)[number] {
  let best: (typeof DOWN_BANDS)[number] = DOWN_BANDS[0];
  for (const b of DOWN_BANDS) {
    if (Math.abs(b - downPct) < Math.abs(best - downPct)) best = b;
  }
  // pie >50% usa banda 50 (tabla no tiene 60)
  if (downPct >= 55) return 50;
  return best;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function rateAtPrice(
  anchors: AutofinRateAnchor[],
  price: number,
): number | null {
  if (!anchors.length) return null;
  const sorted = [...anchors].sort((x, y) => x.price - y.price);
  if (price <= sorted[0]!.price) return sorted[0]!.rate;
  if (price >= sorted[sorted.length - 1]!.price) return sorted[sorted.length - 1]!.rate;
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i]!;
    const b = sorted[i + 1]!;
    if (price >= a.price && price <= b.price) {
      const t = (price - a.price) / (b.price - a.price);
      return lerp(a.rate, b.rate, t);
    }
  }
  return sorted[sorted.length - 1]!.rate;
}

function anchorsFor(productCode: number, downPct: number, termMonths: number) {
  return AUTOFIN_RATE_ANCHORS.filter(
    (a) =>
      a.productCode === productCode &&
      a.downPct === downPct &&
      a.termMonths === termMonths,
  );
}

/**
 * Tasa mensual all-in por tramo (precio × pie × plazo) desde anclas Spider.
 * Interpola precio; interpola plazo entre 24/36/48.
 */
export function lookupTableMonthlyRate(input: {
  price: number;
  downPct: number;
  termMonths: number;
  productCode?: number;
}): { rate: number; source: "table" | "conservative-fallback" } {
  const productCode = input.productCode ?? AUTOFIN_PRODUCT_AUTO_PLAN_USADOS.code;
  const downBand = snapDownBand(input.downPct);
  const term = input.termMonths;

  const rateForTerm = (termMonths: number): number | null => {
    const exact = rateAtPrice(anchorsFor(productCode, downBand, termMonths), input.price);
    return exact;
  };

  // Plazo exacto en anclas
  if ((TERM_BANDS as readonly number[]).includes(term)) {
    const r = rateForTerm(term);
    if (r != null) return { rate: r, source: "table" };
  }

  // Interpolación / clamp entre bandas de plazo
  let loTerm: number = TERM_BANDS[0];
  let hiTerm: number = TERM_BANDS[TERM_BANDS.length - 1];
  for (let i = 0; i < TERM_BANDS.length - 1; i++) {
    if (term >= TERM_BANDS[i]! && term <= TERM_BANDS[i + 1]!) {
      loTerm = TERM_BANDS[i]!;
      hiTerm = TERM_BANDS[i + 1]!;
      break;
    }
  }
  if (term < TERM_BANDS[0]!) {
    loTerm = TERM_BANDS[0]!;
    hiTerm = TERM_BANDS[0]!;
  }
  if (term > TERM_BANDS[TERM_BANDS.length - 1]!) {
    loTerm = TERM_BANDS[TERM_BANDS.length - 1]!;
    hiTerm = TERM_BANDS[TERM_BANDS.length - 1]!;
  }

  const rLo = rateForTerm(loTerm);
  const rHi = rateForTerm(hiTerm);
  if (rLo != null && rHi != null) {
    if (loTerm === hiTerm) return { rate: rLo, source: "table" };
    const t = (term - loTerm) / (hiTerm - loTerm);
    return { rate: lerp(rLo, rHi, t), source: "table" };
  }

  return { rate: AUTOFIN_CONSERVATIVE_FLOOR, source: "conservative-fallback" };
}

export function resolveAutofinProduct(_input?: {
  productKind?: AutofinProductKind;
  price?: number;
}): { code: number; name: string } {
  // Renuévate (10/16/22) requiere MontoVFMG; Spider devolvió ValorCuota 0 sin cuotón.
  return {
    code: AUTOFIN_PRODUCT_AUTO_PLAN_USADOS.code,
    name: AUTOFIN_PRODUCT_AUTO_PLAN_USADOS.name,
  };
}

/**
 * Resuelve tasa: tabla por tramo; override admin solo al alza.
 */
export function resolveMonthlyRate(
  requested?: number,
  ctx?: { price: number; downPct: number; termMonths: number; productCode?: number },
): { rate: number; source: CreditSimulationResult["rateSource"] } {
  const table = ctx
    ? lookupTableMonthlyRate({
        price: ctx.price,
        downPct: ctx.downPct,
        termMonths: ctx.termMonths,
        productCode: ctx.productCode,
      })
    : { rate: AUTOFIN_DEFAULT_MONTHLY_RATE, source: "conservative-fallback" as const };

  if (requested == null || !Number.isFinite(requested) || requested <= 0) {
    return {
      rate: table.rate,
      source: table.source === "table" ? "table" : "conservative-fallback",
    };
  }

  if (requested > table.rate + 0.00005) {
    return { rate: requested, source: "table+admin-uplift" };
  }

  return {
    rate: table.rate,
    source: table.source === "table" ? "table" : "conservative-fallback",
  };
}

/** Simulación referencial alineada a autofin.cl / Trinidad por tramo. */
export function simulateCredit(input: CreditSimulationInput): CreditSimulationResult {
  const warnings: string[] = [];
  const product = resolveAutofinProduct({
    productKind: input.productKind,
    price: input.price,
  });
  const downPct = clampDownPct(input.downPct);
  const termMonths = clampTermMonths(input.termMonths);

  if (downPct !== input.downPct) {
    warnings.push(`Pie ajustado al mínimo ${CREDIT_RULES.minDownPct}%.`);
  }
  if (termMonths !== input.termMonths) {
    warnings.push(`Plazo ajustado a ${termMonths} meses (máx. ${CREDIT_RULES.maxTermMonths}).`);
  }

  const resolved = resolveMonthlyRate(input.monthlyRate, {
    price: input.price,
    downPct,
    termMonths,
    productCode: product.code,
  });
  const monthlyRate = resolved.rate;

  if (
    input.monthlyRate != null &&
    Number.isFinite(input.monthlyRate) &&
    input.monthlyRate + 0.00005 < monthlyRate
  ) {
    warnings.push(
      `Tasa admin ${(input.monthlyRate * 100).toFixed(2)}% ignorada (menor al tramo Autofin ${(monthlyRate * 100).toFixed(2)}%).`,
    );
  }

  const currentYear = new Date().getFullYear();
  if (input.vehicleYear) {
    const ageAtEnd = currentYear - input.vehicleYear + Math.ceil(termMonths / 12);
    if (ageAtEnd > 10) {
      warnings.push(
        `Autofin suele limitar antigüedad + plazo a ~10 años (proyección ~${ageAtEnd} años).`,
      );
    }
  }

  const downPayment = Math.round((input.price * downPct) / 100);
  const financed = Math.max(0, input.price - downPayment);
  const fees =
    AUTOFIN_OPERATIONAL_FEES.notaryAndPledge +
    AUTOFIN_OPERATIONAL_FEES.registration +
    AUTOFIN_OPERATIONAL_FEES.admin;

  const monthlyPayment = frenchMonthlyPayment(financed, monthlyRate, termMonths);
  const capitalInstallment = monthlyPayment;
  const insurance: CreditInsuranceBreakdown = {
    vehicleDamage: 0,
    life: 0,
    unemployment: 0,
    total: 0,
    bakedIntoRate: true,
  };

  const totalCreditCost = monthlyPayment * termMonths + fees;
  const caeApprox = annualCaeFromMonthlyRate(monthlyRate);

  return {
    downPayment,
    financed,
    monthlyPayment,
    capitalInstallment,
    insurance,
    termMonths,
    downPct,
    monthlyRate,
    caeApprox,
    caeWithFeesApprox: approximateCaeWithFees(financed, monthlyRate, termMonths, fees),
    operationalFees: fees,
    totalCreditCost,
    totalCostWithDown: totalCreditCost + downPayment,
    deferredFirstPaymentDays: CREDIT_RULES.deferredFirstPaymentDays,
    vehicleType: input.vehicleType,
    productCode: product.code,
    productName: product.name,
    rateSource: resolved.source,
    warnings,
    ok: financed > 0 && monthlyPayment > 0,
  };
}

/** @deprecated Usar simulateCredit */
export function simulateAutofin(
  input: CreditSimulationInput & { productId?: string },
): CreditSimulationResult & { product?: { name: string; id: string } } {
  const r = simulateCredit(input);
  return {
    ...r,
    product: { id: "autofin", name: r.productName },
  };
}

export function estimateMonthlyAutofin(
  price: number,
  termMonths = 48,
  piePercent = 0.2,
  monthlyRate?: number,
): number {
  if (!price || price <= 0) return 0;
  return simulateCredit({
    price,
    downPct: Math.round(piePercent * 100),
    termMonths,
    monthlyRate,
  }).monthlyPayment;
}

export type AutofinProductId = "auto-plan" | "auto-facil";
export const AUTOFIN_PRODUCTS = [
  {
    id: "auto-plan" as const,
    name: AUTOFIN_PRODUCT_AUTO_PLAN_USADOS.name,
    minDownPct: 20,
    maxTermMonths: 48,
    minTermMonths: 12,
    requiresIncomeProof: true,
    description: "Financiamiento Autofin vía RG Motors (Auto Plan Usados)",
    spiderCode: AUTOFIN_PRODUCT_AUTO_PLAN_USADOS.code,
  },
];
export function getAutofinProduct() {
  return AUTOFIN_PRODUCTS[0]!;
}
