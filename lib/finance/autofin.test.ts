import { describe, expect, it } from "vitest";
import {
  AUTOFIN_DEFAULT_MONTHLY_RATE,
  AUTOFIN_LEGACY_PARTNER_RATE,
  AUTOFIN_PRODUCT_AUTO_PLAN_USADOS,
  frenchMonthlyPayment,
  lookupTableMonthlyRate,
  resolveMonthlyRate,
  simulateCredit,
} from "@/lib/finance/autofin";
import { AUTOFIN_RATE_ANCHORS } from "@/lib/finance/autofin-rate-table";

describe("simulateCredit — paridad Trinidad por tramo", () => {
  it("scraped: $15M · pie $3M · 48m → ~$493.197", () => {
    const r = simulateCredit({
      price: 15_000_000,
      downPct: 20,
      termMonths: 48,
    });
    expect(Math.abs(r.monthlyPayment - 493197) / 493197).toBeLessThan(0.01);
    expect(r.productCode).toBe(AUTOFIN_PRODUCT_AUTO_PLAN_USADOS.code);
    expect(r.productName).toBe(AUTOFIN_PRODUCT_AUTO_PLAN_USADOS.name);
    expect(r.rateSource).toBe("table");
  });

  it("scraped: $12M · 20% · 48m → ~$395.764", () => {
    const r = simulateCredit({ price: 12_000_000, downPct: 20, termMonths: 48 });
    expect(Math.abs(r.monthlyPayment - 395764) / 395764).toBeLessThan(0.01);
  });

  it("scraped: $10M · 20% · 48m → ~$330.809", () => {
    const r = simulateCredit({ price: 10_000_000, downPct: 20, termMonths: 48 });
    expect(Math.abs(r.monthlyPayment - 330809) / 330809).toBeLessThan(0.01);
  });

  it("scraped: $8M · 20% · 48m usa tasa más alta que $15M", () => {
    const low = simulateCredit({ price: 8_000_000, downPct: 20, termMonths: 48 });
    const mid = simulateCredit({ price: 15_000_000, downPct: 20, termMonths: 48 });
    expect(low.monthlyRate).toBeGreaterThan(mid.monthlyRate);
    expect(Math.abs(low.monthlyPayment - 282208) / 282208).toBeLessThan(0.01);
  });

  it("anclas de la matriz (±1% cuota)", () => {
    const sample = AUTOFIN_RATE_ANCHORS.filter(
      (a) => a.downPct === 20 && a.termMonths === 48,
    );
    expect(sample.length).toBeGreaterThanOrEqual(5);
    for (const a of sample) {
      const r = simulateCredit({
        price: a.price,
        downPct: a.downPct,
        termMonths: a.termMonths,
      });
      expect(Math.abs(r.monthlyPayment - a.valorCuota) / a.valorCuota).toBeLessThan(0.01);
    }
  });

  it("CAE referencial coherente con tasa all-in del tramo", () => {
    const r = simulateCredit({ price: 15_000_000, downPct: 20, termMonths: 48 });
    expect(r.caeApprox).toBeGreaterThan(40);
    expect(r.caeApprox).toBeLessThan(55);
  });

  it("tasas legadas no bajan el tramo de tabla", () => {
    const ctx = { price: 15_000_000, downPct: 20, termMonths: 48 };
    const table = lookupTableMonthlyRate(ctx).rate;
    expect(resolveMonthlyRate(AUTOFIN_LEGACY_PARTNER_RATE, ctx).rate).toBe(table);
    expect(resolveMonthlyRate(0.025, ctx).rate).toBe(table);
    expect(resolveMonthlyRate(0.019, ctx).rate).toBe(table);
  });

  it("admin solo puede subir la tasa (uplift)", () => {
    const ctx = { price: 15_000_000, downPct: 20, termMonths: 48 };
    const table = lookupTableMonthlyRate(ctx).rate;
    const up = resolveMonthlyRate(table + 0.005, ctx);
    expect(up.rate).toBeCloseTo(table + 0.005, 5);
    expect(up.source).toBe("table+admin-uplift");
  });

  it("Katana case: $14.99M · 30% · 48m no usa 1.9%", () => {
    const r = simulateCredit({
      price: 14_990_000,
      downPct: 30,
      termMonths: 48,
      monthlyRate: 0.019,
    });
    expect(r.financed).toBe(10_493_000);
    expect(r.monthlyRate).toBeGreaterThan(0.03);
    expect(r.monthlyPayment).toBeGreaterThan(400_000);
    expect(r.monthlyPayment).toBeLessThan(460_000);
  });

  it("respeta pie mínimo 20%", () => {
    const r = simulateCredit({ price: 10_000_000, downPct: 10, termMonths: 48 });
    expect(r.downPct).toBe(20);
  });

  it("fórmula francesa básica", () => {
    expect(frenchMonthlyPayment(8_000_000, AUTOFIN_DEFAULT_MONTHLY_RATE, 36)).toBeGreaterThan(0);
  });
});
