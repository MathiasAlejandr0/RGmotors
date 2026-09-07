import { describe, expect, it } from "vitest";
import {
  AUTOFIN_DEFAULT_MONTHLY_RATE,
  AUTOFIN_LEGACY_PARTNER_RATE,
  frenchMonthlyPayment,
  resolveMonthlyRate,
  simulateCredit,
} from "@/lib/finance/autofin";

describe("simulateCredit (alineación Autofin.cl)", () => {
  it("capital+interés con tasa legada forzada: $9.990.000 · 20% · 48m · 1.85%", () => {
    const r = simulateCredit({
      price: 9_990_000,
      downPct: 20,
      termMonths: 48,
      monthlyRate: 0.0185,
      includeInsurance: false,
    });
    // resolveMonthlyRate sube 1.85→2.5; forzar capital con francesa directa
    expect(frenchMonthlyPayment(7_992_000, 0.0185, 48)).toBe(252665);
    expect(r.monthlyRate).toBe(AUTOFIN_DEFAULT_MONTHLY_RATE);
  });

  it("cuota total ~$500k para $15M · 20% · 48m (caso típico vs autofin.cl)", () => {
    const r = simulateCredit({
      price: 15_000_000,
      downPct: 20,
      termMonths: 48,
    });
    // Antes (solo 1.85% sin seguros) ≈ 379k; Autofin oficial ≈ 500k+
    expect(r.capitalInstallment).toBe(432072);
    expect(r.insurance.total).toBeGreaterThan(50_000);
    expect(r.monthlyPayment).toBeGreaterThanOrEqual(490_000);
    expect(r.monthlyPayment).toBeLessThanOrEqual(520_000);
  });

  it("incluye desglose de seguros en la cuota", () => {
    const r = simulateCredit({ price: 15_000_000, downPct: 20, termMonths: 48 });
    expect(r.monthlyPayment).toBe(r.capitalInstallment + r.insurance.total);
    expect(r.insurance.vehicleDamage).toBeGreaterThan(0);
  });

  it("sube tasa legada 1.85% a la referencial de usados", () => {
    expect(resolveMonthlyRate(AUTOFIN_LEGACY_PARTNER_RATE)).toBe(
      AUTOFIN_DEFAULT_MONTHLY_RATE,
    );
  });

  it("respeta pie mínimo 20%", () => {
    const r = simulateCredit({ price: 10_000_000, downPct: 10, termMonths: 48 });
    expect(r.downPct).toBe(20);
  });

  it("limita plazo a 48", () => {
    const r = simulateCredit({ price: 10_000_000, downPct: 20, termMonths: 60 });
    expect(r.termMonths).toBeLessThanOrEqual(48);
  });
});
