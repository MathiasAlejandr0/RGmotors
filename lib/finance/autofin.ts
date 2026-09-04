/**
 * Motor de simulación de crédito automotriz — RG Motors × Autofin.
 *
 * Misma lógica que usan concesionarios Autofin en web (ej. pie ≥20%, plazo ≤48,
 * tasa referencial de mercado 1,85% mensual, cuota francesa fija).
 * No es cotización oficial de Autofin; la evaluación en sucursal puede variar.
 */

/** Tasa mensual referencial (mercado Autofin / partners). Editable vía settings. */
export const AUTOFIN_DEFAULT_MONTHLY_RATE = 0.0185;

export const CREDIT_RULES = {
  minDownPct: 20,
  maxDownPct: 60,
  minTermMonths: 12,
  maxTermMonths: 48,
  termStep: 6,
  /** Primera cuota diferida típica Autofin (~60 días). */
  deferredFirstPaymentDays: 60,
};

/** Tipos de vehículo como en autofin.cl (adaptados al stock RG). */
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

/** Gastos operacionales referenciales (CLP) para CTC/CAE aproximado. */
export const AUTOFIN_OPERATIONAL_FEES = {
  notaryAndPledge: 180000,
  registration: 45000,
  admin: 75000,
};

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

export type CreditSimulationInput = {
  price: number;
  downPct: number;
  termMonths: number;
  monthlyRate?: number;
  vehicleYear?: number;
  vehicleType?: VehicleTypeId;
};

export type CreditSimulationResult = {
  downPayment: number;
  financed: number;
  monthlyPayment: number;
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

/** Simulación referencial estilo Autofin (cuota fija francesa). */
export function simulateCredit(input: CreditSimulationInput): CreditSimulationResult {
  const warnings: string[] = [];
  const monthlyRate = input.monthlyRate ?? AUTOFIN_DEFAULT_MONTHLY_RATE;
  const downPct = clampDownPct(input.downPct);
  const termMonths = clampTermMonths(input.termMonths);

  if (downPct !== input.downPct) {
    warnings.push(`Pie ajustado al mínimo ${CREDIT_RULES.minDownPct}%.`);
  }
  if (termMonths !== input.termMonths) {
    warnings.push(`Plazo ajustado a ${termMonths} meses (máx. ${CREDIT_RULES.maxTermMonths}).`);
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
  const totalCreditCost = monthlyPayment * termMonths + fees;

  return {
    downPayment,
    financed,
    monthlyPayment,
    termMonths,
    downPct,
    monthlyRate,
    caeApprox: annualCaeFromMonthlyRate(monthlyRate),
    caeWithFeesApprox: approximateCaeWithFees(financed, monthlyRate, termMonths, fees),
    operationalFees: fees,
    totalCreditCost,
    totalCostWithDown: totalCreditCost + downPayment,
    deferredFirstPaymentDays: CREDIT_RULES.deferredFirstPaymentDays,
    vehicleType: input.vehicleType,
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
    product: { id: "autofin", name: "Crédito Autofin" },
  };
}

export function estimateMonthlyAutofin(
  price: number,
  termMonths = 48,
  piePercent = 0.2,
  monthlyRate = AUTOFIN_DEFAULT_MONTHLY_RATE,
): number {
  if (!price || price <= 0) return 0;
  const financed = price * (1 - piePercent);
  return frenchMonthlyPayment(financed, monthlyRate, termMonths);
}

/** Compat: productos ya no se muestran en UI. */
export type AutofinProductId = "auto-plan" | "auto-facil";
export const AUTOFIN_PRODUCTS = [
  {
    id: "auto-plan" as const,
    name: "Crédito Autofin",
    minDownPct: 20,
    maxTermMonths: 48,
    minTermMonths: 12,
    requiresIncomeProof: true,
    description: "Financiamiento Autofin vía RG Motors",
  },
];
export function getAutofinProduct() {
  return AUTOFIN_PRODUCTS[0]!;
}
