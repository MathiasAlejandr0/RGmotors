import { chromium } from "playwright";
import fs from "fs";

const cases = [
  { Precio: "15000000", MontoPie: 3000000, Plazo: 48, Anno: 2020 },
  { Precio: "15000000", MontoPie: 3000000, Plazo: 36, Anno: 2020 },
  { Precio: "12000000", MontoPie: 2400000, Plazo: 48, Anno: 2021 },
  { Precio: "10000000", MontoPie: 2000000, Plazo: 48, Anno: 2019 },
  { Precio: "18000000", MontoPie: 3600000, Plazo: 48, Anno: 2022 },
  { Precio: "15000000", MontoPie: 6000000, Plazo: 48, Anno: 2020 },
  { Precio: "20000000", MontoPie: 4000000, Plazo: 42, Anno: 2021 },
  { Precio: "9990000", MontoPie: 1998000, Plazo: 48, Anno: 2020 },
];

const browser = await chromium.launch({
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
await page.waitForTimeout(4000);

const results = await page.evaluate(async (cases) => {
  const out = [];
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
      out.push({
        ...c,
        ok: r.status,
        trinidad: j?.body?.CuotaTrinidad || j,
      });
    } catch (e) {
      out.push({ ...c, error: String(e) });
    }
  }
  return out;
}, cases);

fs.writeFileSync("tmp-autofin-samples.json", JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
await browser.close();
