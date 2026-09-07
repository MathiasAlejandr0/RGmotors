import { describe, expect, it } from "vitest";
import {
  AUTOFIN_DEFAULT_MONTHLY_RATE,
  AUTOFIN_LEGACY_PARTNER_RATE,
  frenchMonthlyPayment,
  resolveMonthlyRate,
  simulateCredit,
} from "@/lib/finance/autofin";

describe("simulateCredit — paridad Trinidad autofin.cl", () => {
  it("scraped: $15M · pie $3M · 48m → ~$493.197", () => {
    const r = simulateCredit({
      price: 15_000_000,
      downPct: 20,
      termMonths: 48,
    });
    // Autofin API ValorCuota = 493197; tolerancia ±0.5%
    expect(r.monthlyPayment).toBeGreaterThanOrEqual(490_000);
    expect(r.monthlyPayment).toBeLessThanOrEqual(496_000);
    expect(Math.abs(r.monthlyPayment - 493197) / 493197).toBeLessThan(0.01);
  });

  it("scraped: $12M · 20% · 48m → ~$395.764", () => {
    const r = simulateCredit({ price: 12_000_000, downPct: 20, termMonths: 48 });
    expect(Math.abs(r.monthlyPayment - 395764) / 395764).toBeLessThan(0.01);
  });

  it("scraped: $10M · 20% · 48m → ~$330.809", () => {
    const r = simulateCredit({ price: 10_000_000, downPct: 20, termMonths: 48 });
    expect(Math.abs(r.monthlyPayment - 330809) / 330809).toBeLessThan(0.01);
  });

  it("CAE referencial cerca del 38% público Autofin", () => {
    const r = simulateCredit({ price: 15_000_000, downPct: 20, termMonths: 48 });
    expect(r.caeApprox).toBeGreaterThan(35);
    expect(r.caeApprox).toBeLessThan(45);
  });

  it("sube tasas legadas al all-in Trinidad", () => {
    expect(resolveMonthlyRate(AUTOFIN_LEGACY_PARTNER_RATE)).toBe(
      AUTOFIN_DEFAULT_MONTHLY_RATE,
    );
    expect(resolveMonthlyRate(0.025)).toBe(AUTOFIN_DEFAULT_MONTHLY_RATE);
  });

  it("respeta pie mínimo 20%", () => {
    const r = simulateCredit({ price: 10_000_000, downPct: 10, termMonths: 48 });
    expect(r.downPct).toBe(20);
  });

  it("fórmula francesa básica", () => {
    expect(frenchMonthlyPayment(8_000_000, 0.0321, 36)).toBeGreaterThan(0);
  });
});
