/**
 * Matriz Autofin spider/fee → tasas efectivas invertidas.
 *
 * Uso:
 *   node scripts/scrape-autofin-rate-matrix.mjs
 *
 * Abre Chromium headed (Cloudflare). Guarda:
 *   scratch/autofin-fee-matrix.json
 *   scratch/autofin-rate-table.json
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "scratch");
fs.mkdirSync(OUT_DIR, { recursive: true });

const PRICES = [8_000_000, 10_000_000, 12_000_000, 15_000_000, 18_000_000, 22_000_000, 25_000_000];
const DOWN_PCTS = [20, 30, 40, 50];
const TERMS = [24, 36, 48];
/** Auto Plan Usados + Renuévate usados por línea de precio (cods canal RG). */
const PRODUCTS = [
  { code: 2, name: "AUTOPLAN USADOS" },
  { code: 22, name: "AUTO RENUÉVATE L.B. U" },
  { code: 16, name: "AUTO RENUÉVATE L.M. U" },
  { code: 10, name: "AUTO RENUÉVATE L.A. U" },
];

function frenchPayment(financed, i, n) {
  if (financed <= 0 || n <= 0) return 0;
  if (i <= 0) return financed / n;
  const f = (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
  return financed * f;
}

/** Invierte tasa mensual i tal que francesa(financed,i,n) ≈ cuota. */
function invertMonthlyRate(financed, cuota, n) {
  if (financed <= 0 || cuota <= 0 || n <= 0) return null;
  if (cuota * n <= financed) return 0;
  let lo = 0.0001;
  let hi = 0.15;
  for (let k = 0; k < 80; k++) {
    const mid = (lo + hi) / 2;
    const p = frenchPayment(financed, mid, n);
    if (p < cuota) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function buildCases() {
  const cases = [];
  for (const product of PRODUCTS) {
    for (const price of PRICES) {
      // Renuévate: solo bandas de precio válidas
      if (product.code === 22 && (price < 4_000_000 || price > 10_000_000)) continue;
      if (product.code === 16 && (price < 10_000_001 || price > 20_000_000)) continue;
      if (product.code === 10 && price < 20_000_001) continue;
      for (const downPct of DOWN_PCTS) {
        if (product.code !== 2 && downPct > 50) continue;
        for (const term of TERMS) {
          const pie = Math.round((price * downPct) / 100);
          cases.push({
            Precio: String(price),
            price,
            MontoPie: pie,
            downPct,
            Plazo: term,
            Producto: product.code,
            productName: product.name,
            Anno: 2020,
          });
        }
      }
    }
  }
  return cases;
}

async function main() {
  const cases = buildCases();
  console.log("Casos a consultar:", cases.length);

  const browser = await chromium.launch({
    channel: "msedge",
    headless: false,
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    locale: "es-CL",
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });
  const page = await context.newPage();

  await page.goto("https://autofin.cl/#simulation", {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });
  await page.waitForTimeout(5000);

  // Warm-up: un fetch desde el origen para pasar CF
  const warm = await page.evaluate(async () => {
    const body = {
      ConsultaCuotaReqRest: {
        Precio: "15000000",
        MontoPie: 3000000,
        Plazo: 48,
        Producto: 2,
        TipoCredito: 2,
        Seguros: {
          Desgravamen: true,
          Cesantia: true,
          DesgravamenPlus: false,
          AutoProtegido: false,
          PerdidaTotal: false,
          GPS: false,
          RDH: false,
          ReparacionesMenores: false,
          GarantiaMecanica: false,
        },
        MontoVFMG: 0,
        Marca: "TOYOTA",
        Modelo: "COROLLA",
        Anno: 2020,
        Dealer: 1,
        Sucursal: 2,
        EstadoVehiculo: "U",
      },
    };
    const r = await fetch("https://webapi.autofin.cl/v1/spider/fee", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    const text = await r.text();
    return { status: r.status, head: text.slice(0, 200) };
  });
  console.log("Warm-up", warm);
  const warmOk =
    warm.status >= 200 &&
    warm.status < 300 &&
    !String(warm.head).includes("<!DOCTYPE") &&
    String(warm.head).includes("ValorCuota");
  if (!warmOk) {
    console.error("Cloudflare/API bloqueó. Abortando scrape.");
    await browser.close();
    process.exit(2);
  }

  const results = [];
  const BATCH = 8;
  for (let i = 0; i < cases.length; i += BATCH) {
    const slice = cases.slice(i, i + BATCH);
    const batchOut = await page.evaluate(async (sliceCases) => {
      const out = [];
      for (const c of sliceCases) {
        const body = {
          ConsultaCuotaReqRest: {
            Precio: c.Precio,
            MontoPie: c.MontoPie,
            Plazo: c.Plazo,
            Producto: c.Producto,
            TipoCredito: 2,
            Seguros: {
              Desgravamen: true,
              Cesantia: true,
              DesgravamenPlus: false,
              AutoProtegido: false,
              PerdidaTotal: false,
              GPS: false,
              RDH: false,
              ReparacionesMenores: false,
              GarantiaMecanica: false,
            },
            MontoVFMG: 0,
            Marca: "TOYOTA",
            Modelo: "COROLLA",
            Anno: c.Anno,
            Dealer: 1,
            Sucursal: 2,
            EstadoVehiculo: "U",
          },
        };
        try {
          const r = await fetch("https://webapi.autofin.cl/v1/spider/fee", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(body),
          });
          const j = await r.json();
          const t = j?.body?.CuotaTrinidad || j?.body || j;
          out.push({
            ...c,
            http: r.status,
            ValorCuota: t?.ValorCuota ?? t?.valorCuota ?? null,
            CAE: t?.CAE ?? t?.Cae ?? null,
            TotalCredito: t?.TotalCredito ?? null,
            Capital: t?.Capital ?? null,
            rawKeys: t && typeof t === "object" ? Object.keys(t).slice(0, 40) : [],
          });
        } catch (e) {
          out.push({ ...c, error: String(e) });
        }
      }
      return out;
    }, slice);
    results.push(...batchOut);
    const ok = batchOut.filter((x) => x.ValorCuota).length;
    console.log(`Batch ${i / BATCH + 1}: ${ok}/${batchOut.length} OK (total ${results.length}/${cases.length})`);
    await page.waitForTimeout(400);
  }

  await browser.close();

  const enriched = results.map((r) => {
    const financed = r.price - r.MontoPie;
    const rate =
      r.ValorCuota != null ? invertMonthlyRate(financed, Number(r.ValorCuota), r.Plazo) : null;
    return {
      ...r,
      financed,
      effectiveMonthlyRate: rate,
      checkPayment: rate != null ? Math.round(frenchPayment(financed, rate, r.Plazo)) : null,
    };
  });

  fs.writeFileSync(
    path.join(OUT_DIR, "autofin-fee-matrix.json"),
    JSON.stringify({ scrapedAt: new Date().toISOString(), count: enriched.length, rows: enriched }, null, 2),
  );

  // Agregar tasas por (product, term, downPct) — mediana; y por product+term
  function median(nums) {
    const a = nums.filter((n) => Number.isFinite(n)).sort((x, y) => x - y);
    if (!a.length) return null;
    const m = Math.floor(a.length / 2);
    return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
  }
  function p90(nums) {
    const a = nums.filter((n) => Number.isFinite(n)).sort((x, y) => x - y);
    if (!a.length) return null;
    return a[Math.min(a.length - 1, Math.floor(a.length * 0.9))];
  }

  const byKey = new Map();
  for (const row of enriched) {
    if (row.effectiveMonthlyRate == null) continue;
    const key = `${row.Producto}|${row.Plazo}|${row.downPct}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(row.effectiveMonthlyRate);
  }

  const cells = [];
  for (const [key, rates] of byKey) {
    const [Producto, Plazo, downPct] = key.split("|").map(Number);
    cells.push({
      productCode: Producto,
      termMonths: Plazo,
      downPct,
      rateMedian: median(rates),
      rateP90: p90(rates),
      sampleCount: rates.length,
    });
  }

  const byProductTerm = new Map();
  for (const row of enriched) {
    if (row.effectiveMonthlyRate == null) continue;
    const key = `${row.Producto}|${row.Plazo}`;
    if (!byProductTerm.has(key)) byProductTerm.set(key, []);
    byProductTerm.get(key).push(row.effectiveMonthlyRate);
  }
  const productTerm = [];
  for (const [key, rates] of byProductTerm) {
    const [Producto, Plazo] = key.split("|").map(Number);
    productTerm.push({
      productCode: Producto,
      termMonths: Plazo,
      rateMedian: median(rates),
      rateP90: p90(rates),
      sampleCount: rates.length,
    });
  }

  const allPlan = enriched
    .filter((r) => r.Producto === 2 && r.effectiveMonthlyRate != null)
    .map((r) => r.effectiveMonthlyRate);
  const table = {
    scrapedAt: new Date().toISOString(),
    source: "webapi.autofin.cl/v1/spider/fee",
    defaultProductCode: 2,
    conservativeFloor: p90(allPlan) ?? 0.0321,
    fallbackRate: median(allPlan) ?? 0.0321,
    cells,
    productTerm,
    anchors: enriched
      .filter((r) => r.Producto === 2 && r.ValorCuota)
      .slice(0, 40)
      .map((r) => ({
        price: r.price,
        downPct: r.downPct,
        termMonths: r.Plazo,
        productCode: r.Producto,
        valorCuota: r.ValorCuota,
        effectiveMonthlyRate: r.effectiveMonthlyRate,
      })),
  };

  fs.writeFileSync(path.join(OUT_DIR, "autofin-rate-table.json"), JSON.stringify(table, null, 2));
  console.log("OK → scratch/autofin-fee-matrix.json + scratch/autofin-rate-table.json");
  console.log("fallbackRate", table.fallbackRate, "conservativeFloor", table.conservativeFloor);
  console.log("cells", cells.length, "productTerm", productTerm.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
