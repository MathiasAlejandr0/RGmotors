import { describe, expect, it } from "vitest";
import {
  AUTOFIN_DEFAULT_MONTHLY_RATE,
  CREDIT_RULES,
  approximateCaeWithFees,
  annualCaeFromMonthlyRate,
  matchVehicleType,
  simulateCredit,
} from "@/lib/finance/autofin";

describe("autofin — reglas de negocio", () => {
  it("expone pie mínimo 20% y plazo máximo 48", () => {
    expect(CREDIT_RULES.minDownPct).toBe(20);
    expect(CREDIT_RULES.maxTermMonths).toBe(48);
  });

  it("clasifica tipos de carrocería", () => {
    expect(matchVehicleType("SUV")).toBe("suv");
    expect(matchVehicleType("Pickup")).toBe("camioneta");
    expect(matchVehicleType("Sedán")).toBe("auto");
    expect(matchVehicleType(undefined)).toBe("auto");
  });

  it("CAE anual desde tasa mensual es coherente", () => {
    const cae = annualCaeFromMonthlyRate(AUTOFIN_DEFAULT_MONTHLY_RATE);
    expect(cae).toBeGreaterThan(35);
    expect(cae).toBeLessThan(55);
  });

  it("approximateCaeWithFees sube el CAE vs tasa base", () => {
    const financed = 8_000_000;
    const rate = 0.033;
    const base = annualCaeFromMonthlyRate(rate);
    const withFees = approximateCaeWithFees(financed, rate, 36, 300_000);
    expect(withFees).toBeGreaterThan(base);
  });

  it("simulación completa incluye producto Auto Plan Usados", () => {
    const r = simulateCredit({
      price: 15_000_000,
      downPct: 25,
      termMonths: 36,
    });
    expect(r.financed).toBe(Math.round(15_000_000 * 0.75));
    expect(r.monthlyPayment).toBeGreaterThan(0);
    expect(r.monthlyPayment).toBe(r.capitalInstallment);
    expect(r.productCode).toBe(2);
    expect(r.productName).toContain("Auto Plan");
  });

  it("pie 0 o negativo se corrige al mínimo", () => {
    const r = simulateCredit({ price: 10_000_000, downPct: 0, termMonths: 24 });
    expect(r.downPct).toBe(CREDIT_RULES.minDownPct);
  });
});
