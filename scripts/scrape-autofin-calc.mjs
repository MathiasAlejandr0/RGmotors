import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch({
  headless: false,
  args: ["--disable-blink-features=AutomationControlled"],
});
const context = await browser.newContext({
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  locale: "es-CL",
  viewport: { width: 1400, height: 900 },
});
await context.addInitScript(() => {
  Object.defineProperty(navigator, "webdriver", { get: () => undefined });
});
const page = await context.newPage();
const hits = [];
page.on("request", (req) => {
  const u = req.url();
  if (/spider-api|webapi|fabdigital|simul|calc|cotiz|cuota|tasa|evalua|oferta|credito|recaptcha/i.test(u)) {
    hits.push({ k: "REQ", m: req.method(), u, p: req.postData() });
  }
});
page.on("response", async (res) => {
  const u = res.url();
  if (/spider-api|webapi|fabdigital|simul|calc|cotiz|cuota|tasa|evalua|oferta|credito/i.test(u)) {
    let b = "";
    try {
      b = await res.text();
    } catch {}
    hits.push({ k: "RES", s: res.status(), u, b: b.slice(0, 50000) });
  }
});

await page.goto("https://autofin.cl/#simulation", {
  waitUntil: "domcontentloaded",
  timeout: 90000,
});
await page.waitForTimeout(4000);
await page.locator("#auto").click({ force: true });
await page.waitForTimeout(2000);

// Keep "Sí" + Usado, fill brand/model/year/price
await page.locator("button.wa-spider-btn", { hasText: "Sí" }).first().click();
await page.waitForTimeout(500);
await page.locator("button.wa-spider-btn", { hasText: "Usado" }).click();
await page.waitForTimeout(800);

await page.locator("#brand").selectOption({ label: "TOYOTA" });
await page.waitForTimeout(2000);

const models = await page.locator("#model option").allTextContents();
console.log(
  "MODELS",
  models.slice(0, 30),
  "count",
  models.length,
);
const modelOption = models.find((m) => /COROLLA|YARIS|RAV|HILUX/i.test(m)) || models[1];
if (modelOption && modelOption.trim()) {
  await page.locator("#model").selectOption({ label: modelOption.trim() });
  console.log("MODEL", modelOption.trim());
}
await page.waitForTimeout(500);

await page.locator("#year").fill("2020");
await page.locator("#priceVehicle").click();
await page.locator("#priceVehicle").fill("15000000");
await page.waitForTimeout(800);

let pie = await page.locator("#initialPayment").inputValue();
console.log("AUTO_PIE_AFTER_PRICE", pie);
if (!pie || pie === "0") {
  await page.locator("#initialPayment").fill("3000000");
  pie = "3000000";
}
await page.locator("#numberOfFees").selectOption("48");

console.log("FORM", {
  brand: await page.locator("#brand").inputValue(),
  model: await page.locator("#model").inputValue(),
  year: await page.locator("#year").inputValue(),
  price: await page.locator("#priceVehicle").inputValue(),
  pie: await page.locator("#initialPayment").inputValue(),
  fees: await page.locator("#numberOfFees").inputValue(),
});

await page.screenshot({ path: "tmp-autofin-before-calc.png" });
await page.locator("button.wa-calculate-button").click();
await page.waitForTimeout(10000);
await page.screenshot({ path: "tmp-autofin-result.png" });

const text = await page.locator("body").innerText();
console.log("RESULT_SNIP", text.slice(0, 5000));

fs.writeFileSync("tmp-autofin-calc-full.json", JSON.stringify(hits, null, 2));
console.log("HITS", hits.length);
for (const h of hits) {
  console.log("---", h.k, h.s || "", h.m || "", h.u);
  if (h.p) console.log("POST", h.p.slice(0, 4000));
  if (h.b && (h.b[0] === "{" || h.b[0] === "[")) console.log("BODY", h.b.slice(0, 6000));
}

await browser.close();
