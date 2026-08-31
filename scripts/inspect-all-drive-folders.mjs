import https from "node:https";

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

async function inspectFolder(folderId, label) {
  console.log(`\n=== Inspeccionando ${label} (${folderId}) ===`);
  const url = `https://drive.google.com/drive/folders/${folderId}`;
  const html = await fetchPage(url);

  console.log("HTML length:", html.length);

  // Look for folder items in aria-label and ssk or window._DRIVE_data
  const folderRegex = /aria-label="([^"\n]+?)\s+(?:Shared folder|Google Drive Folder|folder)"[^>]*ssk='5:[^:]*:([a-zA-Z0-9_-]+)/gi;
  let m;
  const folders = [];
  while ((m = folderRegex.exec(html)) !== null) {
    folders.push({ name: m[1], id: m[2].split("-")[0] });
  }

  console.log(`Encontradas con regex simple: ${folders.length} carpetas`);

  // Check if there are JS data arrays with all folder items
  // Google Drive embeds initial data inside JSON-like structures in script tags
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let sm;
  let totalDataFolders = 0;
  while ((sm = scriptRegex.exec(html)) !== null) {
    const content = sm[1];
    if (content.includes("1VQ6IHTjk5sJYjJckZY1kzeRJAI5d09Od") || content.includes("application/vnd.google-apps.folder")) {
      console.log("Found relevant script tag length:", content.length);
    }
  }

  // Let's also check for subfolder names
  for (const f of folders) {
    if (f.name.toLowerCase().includes("unidades") || f.name.toLowerCase().includes("chile") || f.name.toLowerCase().includes("stock")) {
      console.log("Found special subfolder:", f);
    }
  }

  return folders;
}

async function main() {
  await inspectFolder("1VQ6IHTjk5sJYjJckZY1kzeRJAI5d09Od", "Drive 1 (Principal)");
  await inspectFolder("1zqX6z_sKWHjHyNoMlS_rtkkF6pK_FqVh", "Drive 2");
}

main();
