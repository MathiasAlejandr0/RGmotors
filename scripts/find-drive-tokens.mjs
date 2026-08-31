import https from "node:https";
import { writeFileSync } from "node:fs";

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" } }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve(data));
      res.on("error", reject);
    });
  });
}

async function findTokens() {
  const url = "https://drive.google.com/drive/folders/1VQ6IHTjk5sJYjJckZY1kzeRJAI5d09Od";
  const html = await fetchPage(url);

  // Search for page tokens, batch keys, or next tokens
  const pageTokenMatches = html.match(/pageToken["']?\s*[:=]\s*["']([^"']+)["']/gi);
  console.log("pageTokenMatches:", pageTokenMatches);

  // Search for folder names mentioned in html
  const nameMatches = [];
  const regex = /\["([a-zA-Z0-9_-]{25,})",\["([^"\\]+)"/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    nameMatches.push({ id: m[1], name: m[2] });
  }
  console.log("nameMatches count:", nameMatches.length);

  // Search for "UNIDADES" or "Chile" in full HTML
  const lower = html.toLowerCase();
  let idx = 0;
  while ((idx = lower.indexOf("unidades", idx)) !== -1) {
    console.log("Found 'unidades' at:", idx, html.slice(Math.max(0, idx - 100), idx + 200));
    idx += 8;
  }

  // Let's dump all strings in html that look like vehicle folders: e.g. "Toyota Hilux", "HYUNDAI", "CHEVROLET", etc.
  const folderNamesFound = new Set();
  const rawMatches = html.match(/"([A-Z0-9\s\-_/]{4,50})"/g) || [];
  for (const r of rawMatches) {
    const clean = r.replace(/"/g, "").trim();
    if (/[A-Z]{2,4}[-\s]?[0-9]{2,4}/.test(clean) || clean.includes("TOYOTA") || clean.includes("MITSUBISHI") || clean.includes("NISSAN") || clean.includes("PEUGEOT") || clean.includes("HYUNDAI") || clean.includes("CHEVROLET") || clean.includes("FORD")) {
      folderNamesFound.add(clean);
    }
  }

  console.log(`Vehículos detectados por patrones en el HTML: ${folderNamesFound.size}`);
  console.log(Array.from(folderNamesFound).slice(0, 30));
}

findTokens();
