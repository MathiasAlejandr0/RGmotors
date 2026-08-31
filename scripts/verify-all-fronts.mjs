import { readdirSync, writeFileSync } from "node:fs";

const files = readdirSync("public/cars/real_stock");
const plates = {};

for (const f of files) {
  if (!f.startsWith("rg-")) continue;
  const p = f.split("-")[1];
  if (!plates[p]) plates[p] = [];
  plates[p].push(f);
}

// Generar una página HTML local para ver todas las fotos de cada auto de un vistazo
const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verificador de Fotos Frontales RG Motors</title>
  <style>
    body { background: #111; color: #fff; font-family: sans-serif; padding: 20px; }
    .vehicle { margin-bottom: 40px; border-bottom: 1px solid #333; padding-bottom: 20px; }
    .title { font-size: 20px; font-weight: bold; margin-bottom: 10px; color: #38bdf8; }
    .grid { display: flex; flex-wrap: wrap; gap: 10px; }
    .item { text-align: center; font-size: 11px; }
    img { width: 180px; height: 135px; object-fit: cover; border-radius: 8px; border: 1px solid #444; }
  </style>
</head>
<body>
  <h1>Verificador de Fotos por Patente</h1>
  ${Object.entries(plates).map(([p, fls]) => `
    <div class="vehicle">
      <div class="title">Patente: ${p.toUpperCase()} (${fls.length} fotos)</div>
      <div class="grid">
        ${fls.map((f) => `
          <div class="item">
            <img src="/cars/real_stock/${f}" />
            <div>${f}</div>
          </div>
        `).join("")}
      </div>
    </div>
  `).join("")}
</body>
</html>`;

writeFileSync("public/inspect_photos.html", html, "utf8");
console.log("✅ public/inspect_photos.html generado para inspección.");
