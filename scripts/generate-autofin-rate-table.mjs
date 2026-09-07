/**
 * Genera lib/finance/autofin-rate-table.ts desde scratch/autofin-fee-matrix.json
 * node scripts/generate-autofin-rate-table.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const matrix = JSON.parse(
  fs.readFileSync(path.join(ROOT, "scratch", "autofin-fee-matrix.json"), "utf8"),
);

const rows = matrix.rows.filter(
  (r) =>
    r.Producto === 2 &&
    r.ValorCuota &&
    Number(r.ValorCuota) > 0 &&
    r.effectiveMonthlyRate,
);

const anchors = rows.map((r) => ({
  productCode: 2,
  price: r.price,
  downPct: r.downPct,
  termMonths: r.Plazo,
  valorCuota: Number(r.ValorCuota),
  rate: Number(Number(r.effectiveMonthlyRate).toFixed(8)),
}));

function median(a) {
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function p90(a) {
  const s = [...a].sort((x, y) => x - y);
  return s[Math.min(s.length - 1, Math.floor(s.length * 0.9))];
}

const rates = anchors.map((a) => a.rate);
const byTermDown = new Map();
for (const a of anchors) {
  const k = `${a.termMonths}|${a.downPct}`;
  if (!byTermDown.has(k)) byTermDown.set(k, []);
  byTermDown.get(k).push(a.rate);
}
const bandStats = [...byTermDown.entries()].map(([k, rs]) => {
  const [termMonths, downPct] = k.split("|").map(Number);
  return {
    termMonths,
    downPct,
    rateMedian: Number(median(rs).toFixed(8)),
    rateP90: Number(p90(rs).toFixed(8)),
    n: rs.length,
  };
});

const payload = {
  scrapedAt: matrix.scrapedAt,
  source: "webapi.autofin.cl/v1/spider/fee",
  productCode: 2,
  productName: "AUTOPLAN USADOS",
  fallbackRate: Number(median(rates).toFixed(8)),
  conservativeFloor: Number(p90(rates).toFixed(8)),
  anchors,
  bandStats,
};

fs.writeFileSync(
  path.join(ROOT, "scratch", "autofin-rate-table.json"),
  JSON.stringify(payload, null, 2),
);

const ts = `/**
 * Tasas efectivas Autofin (all-in) calibradas a spider/fee.
 * Regenerar:
 *   node scripts/scrape-autofin-rate-matrix.mjs
 *   node scripts/generate-autofin-rate-table.mjs
 *
 * scrapedAt: ${payload.scrapedAt}
 */
export type AutofinRateAnchor = {
  productCode: number;
  price: number;
  downPct: number;
  termMonths: number;
  valorCuota: number;
  rate: number;
};

export const AUTOFIN_RATE_TABLE_META = {
  scrapedAt: ${JSON.stringify(payload.scrapedAt)},
  source: ${JSON.stringify(payload.source)},
  productCode: 2 as const,
  productName: "AUTOPLAN USADOS" as const,
  fallbackRate: ${payload.fallbackRate},
  conservativeFloor: ${payload.conservativeFloor},
};

export const AUTOFIN_RATE_ANCHORS: AutofinRateAnchor[] = ${JSON.stringify(anchors, null, 2)};

export const AUTOFIN_RATE_BAND_STATS = ${JSON.stringify(bandStats, null, 2)} as const;
`;

fs.writeFileSync(path.join(ROOT, "lib", "finance", "autofin-rate-table.ts"), ts);
console.log(
  "Wrote lib/finance/autofin-rate-table.ts — anchors",
  anchors.length,
  "fallback",
  payload.fallbackRate,
  "floor",
  payload.conservativeFloor,
);
