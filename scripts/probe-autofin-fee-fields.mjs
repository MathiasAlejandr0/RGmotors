/**
 * Dump full Trinidad fee response fields (tasa, seguros, etc.)
 * node scripts/probe-autofin-fee-fields.mjs
 */
import { chromium } from "playwright";

const cases = [
  { Precio: "15000000", MontoPie: 3000000, Plazo: 48, label: "15M-20%-48 fin12M" },
  { Precio: "8000000", MontoPie: 2000000, Plazo: 48, label: "8M-25%-48 fin6M" },
  { Precio: "8000000", MontoPie: 1600000, Plazo: 48, label: "8M-20%-48 fin6.4M" },
  { Precio: "10000000", MontoPie: 4000000, Plazo: 48, label: "10M-40%-48 fin6M" },
  { Precio: "12000000", MontoPie: 6000000, Plazo: 48, label: "12M-50%-48 fin6M" },
  { Precio: "9000000", MontoPie: 3000000, Plazo: 48, label: "9M-33%-48 fin6M" },
];

const browser = await chromium.launch({
  channel: "msedge",
  headless: false,
  args: ["--disable-blink-features=AutomationControlled"],
});
const page = await (await browser.newContext({ locale: "es-CL" })).newPage();
await page.goto("https://autofin.cl/#simulation", { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(4000);

const out = await page.evaluate(async (cases) => {
  const results = [];
  for (const c of cases) {
    const body = {
      ConsultaCuotaReqRest: {
        Precio: c.Precio,
        MontoPie: c.MontoPie,
        Plazo: c.Plazo,
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
    const j = await r.json();
    results.push({ label: c.label, http: r.status, json: j });
  }
  return results;
}, cases);

import fs from "fs";
fs.mkdirSync("scratch", { recursive: true });
fs.writeFileSync("scratch/autofin-fee-probe.json", JSON.stringify(out, null, 2));
for (const row of out) {
  console.log("\n===", row.label, "http", row.http);
  console.log(JSON.stringify(row.json, null, 2).slice(0, 2500));
}
await browser.close();
