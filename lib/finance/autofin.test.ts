import { describe, expect, it } from "vitest";
import { frenchMonthlyPayment, simulateCredit } from "@/lib/finance/autofin";

describe("simulateCredit (paridad Autofin/partners)", () => {
  it("cuota Auto360/Autofin: $9.990.000 · 20% pie · 48m · 1.85%", () => {
    const r = simulateCredit({
      price: 9_990_000,
      downPct: 20,
      termMonths: 48,
      monthlyRate: 0.0185,
    });
    expect(r.monthlyPayment).toBe(252665);
  });

  it("respeta pie mínimo 20%", () => {
    const r = simulateCredit({ price: 10_000_000, downPct: 10, termMonths: 48 });
    expect(r.downPct).toBe(20);
  });

  it("limita plazo a 48", () => {
    const r = simulateCredit({ price: 10_000_000, downPct: 20, termMonths: 60 });
    expect(r.termMonths).toBeLessThanOrEqual(48);
  });

  it("fórmula francesa básica", () => {
    expect(frenchMonthlyPayment(8_000_000, 0.0185, 36)).toBeGreaterThan(0);
  });
});
