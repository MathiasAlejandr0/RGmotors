import https from "node:https";

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
      res.on("error", reject);
    });
  });
}

async function inspectSubfolder(folderId, plateName) {
  const url = `https://drive.google.com/drive/folders/${folderId}`;
  console.log(`Fetching subfolder for ${plateName} (${url})...`);
  const html = await fetchUrl(url);
  console.log(`HTML length: ${html.length}`);

  // Look for image files
  // Pattern: aria-label="([^"]+\.(?:jpg|png|jpeg|webp))"[^>]*ssk='5:[^:]*:([a-zA-Z0-9_-]+)
  const regex = /aria-label="([^"]+?\.(?:jpg|png|jpeg|webp|mov|mp4))"[^>]*ssk='5:[^:]*:([a-zA-Z0-9_-]+)/gi;
  const files = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    files.push({
      name: match[1],
      id: match[2].split("-")[0],
    });
  }

  // Also search for file IDs associated with thumbnail URLs
  const thumbRe = /https:\/\/lh3\.googleusercontent\.com\/drive-storage\/[a-zA-Z0-9_-]+/g;
  const thumbs = html.match(thumbRe) || [];

  console.log(`Archivos encontrados en ${plateName}:`, files);
  console.log(`Thumbnails encontrados:`, thumbs.length);
  return { files, thumbs };
}

async function main() {
  // Test with CVFF32
  await inspectSubfolder("13ERKtA23SKUJbjy7neMt2VL17aBNG4jZ", "CVFF32");
}

main().catch(console.error);
