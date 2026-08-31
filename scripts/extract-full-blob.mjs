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

async function extractFullBlob() {
  const html = await fetchPage("https://drive.google.com/drive/folders/1VQ6IHTjk5sJYjJckZY1kzeRJAI5d09Od");
  
  // Find all items formatted as ["id", null, "Name", "application/vnd.google-apps.folder" ... ]
  // or ["id", ... "Name" ... ]
  const folderItems = [];
  const regex = /\["([a-zA-Z0-9_-]{20,})",null,"([^"\\]+)","application\/vnd\.google-apps\.folder"/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    folderItems.push({ id: m[1], name: m[2] });
  }

  console.log(`Folder items with standard signature: ${folderItems.length}`);
  for (const f of folderItems.slice(0, 10)) {
    console.log("  -", f.name, f.id);
  }

  // Also search for any subfolders or file entries
  const fileItems = [];
  const fileRegex = /\["([a-zA-Z0-9_-]{20,})",null,"([^"\\]+)","image\/(?:jpeg|png|webp|heic|jpg)"/g;
  let fm;
  while ((fm = fileRegex.exec(html)) !== null) {
    fileItems.push({ id: fm[1], name: fm[2] });
  }
  console.log(`File items in root: ${fileItems.length}`);

  // Let's check how many total unique IDs exist in the HTML
  const allIds = new Set();
  const idRegex = /"([a-zA-Z0-9_-]{28,35})"/g;
  let im;
  while ((im = idRegex.exec(html)) !== null) {
    allIds.add(im[1]);
  }
  console.log(`Total unique 28-35 char Google IDs in HTML: ${allIds.size}`);

  writeFileSync("scratch/drive1_full_html.html", html);
}

extractFullBlob();
