import fs from "node:fs";

const plates = [
  "srcp17", "lxcy98", "rpkd45", "rzvk91", "tsgl82", "sfxy80", "scgj41", "psjj97",
  "tsxk53", "pysy84", "sfrt83", "stpz87", "ssdt39", "rygb56", "lxbc60", "rzsy35",
  "shyl53", "rdhb85"
];

let html = `<!DOCTYPE html>
<html>
<head>
  <title>Vehicle Photos Visual Check</title>
  <style>
    body { font-family: sans-serif; background: #0f172a; color: white; padding: 20px; }
    .vehicle-block { margin-bottom: 40px; border-bottom: 2px solid #334155; padding-bottom: 20px; }
    .grid { display: flex; flex-wrap: wrap; gap: 10px; }
    .card { background: #1e293b; padding: 6px; border-radius: 8px; text-align: center; }
    img { width: 220px; height: 165px; object-fit: cover; border-radius: 4px; }
    h2 { color: #38bdf8; }
  </style>
</head>
<body>
  <h1>RG Motors - Stock Photos Inspector</h1>
`;

for (const p of plates) {
  const dir = `public/cars/inventory/${p}`;
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".jpg"));
  html += `
  <div class="vehicle-block">
    <h2>${p.toUpperCase()}</h2>
    <div class="grid">
  `;
  for (const f of files) {
    html += `
      <div class="card">
        <img src="/cars/inventory/${p}/${f}" alt="${p} ${f}" />
        <p style="margin: 4px 0 0 0; font-weight: bold;">${f}</p>
      </div>
    `;
  }
  html += `
    </div>
  </div>
  `;
}

html += `
</body>
</html>
`;

fs.writeFileSync("public/inspect-photos.html", html, "utf8");
console.log("✅ Created public/inspect-photos.html");
