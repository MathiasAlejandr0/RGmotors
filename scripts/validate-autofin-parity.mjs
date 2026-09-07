/**
 * Validación rápida de paridad Autofin (sin vitest).
 *   npx tsx scripts/validate-autofin-parity.mjs
 */
import {
  simulateCredit,
  lookupTableMonthlyRate,
  resolveMonthlyRate,
  AUTOFIN_LEGACY_PARTNER_RATE,
} from "../lib/finance/autofin.ts";
import { AUTOFIN_RATE_ANCHORS } from "../lib/finance/autofin-rate-table.ts";

function near(a, b, tol = 0.01) {
  const d = Math.abs(a - b) / b;
  if (d >= tol) throw new Error(`expected ${a} near ${b} (diff ${d})`);
}

const r15 = simulateCredit({ price: 15_000_000, downPct: 20, termMonths: 48 });
near(r15.monthlyPayment, 493197);
if (r15.productCode !== 2) throw new Error("product");
if (r15.rateSource !== "table") throw new Error("source");

near(simulateCredit({ price: 12_000_000, downPct: 20, termMonths: 48 }).monthlyPayment, 395764);
near(simulateCredit({ price: 10_000_000, downPct: 20, termMonths: 48 }).monthlyPayment, 330809);
near(simulateCredit({ price: 8_000_000, downPct: 20, termMonths: 48 }).monthlyPayment, 282208);

const low = simulateCredit({ price: 8_000_000, downPct: 20, termMonths: 48 });
const mid = simulateCredit({ price: 15_000_000, downPct: 20, termMonths: 48 });
if (!(low.monthlyRate > mid.monthlyRate)) throw new Error("rate by price");

for (const a of AUTOFIN_RATE_ANCHORS.filter((x) => x.downPct === 20 && x.termMonths === 48)) {
  const r = simulateCredit({
    price: a.price,
    downPct: a.downPct,
    termMonths: a.termMonths,
  });
  near(r.monthlyPayment, a.valorCuota);
}

const ctx = { price: 15_000_000, downPct: 20, termMonths: 48 };
const table = lookupTableMonthlyRate(ctx).rate;
if (resolveMonthlyRate(AUTOFIN_LEGACY_PARTNER_RATE, ctx).rate !== table) {
  throw new Error("legacy");
}
if (resolveMonthlyRate(table + 0.005, ctx).source !== "table+admin-uplift") {
  throw new Error("uplift");
}

const katana = simulateCredit({
  price: 14_990_000,
  downPct: 30,
  termMonths: 48,
  monthlyRate: 0.019,
});
if (katana.monthlyPayment < 400_000 || katana.monthlyPayment > 460_000) {
  throw new Error("katana " + katana.monthlyPayment);
}

console.log("ALL OK", {
  cuota15: r15.monthlyPayment,
  rate: r15.monthlyRate,
  anchors: AUTOFIN_RATE_ANCHORS.length,
});
