import https from "node:https";
import { createWriteStream } from "node:fs";

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve(data));
      res.on("error", reject);
    });
  });
}

function downloadImage(fileId, dest) {
  const url = "https://lh3.googleusercontent.com/d/" + fileId;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return https.get(res.headers.location, (res2) => {
          const s = createWriteStream(dest);
          res2.pipe(s);
          s.on("finish", () => {
            s.close();
            resolve(true);
          });
          s.on("error", reject);
        });
      }
      const s = createWriteStream(dest);
      res.pipe(s);
      s.on("finish", () => {
        s.close();
        resolve(true);
      });
      s.on("error", reject);
    }).on("error", reject);
  });
}

async function run() {
  const urls = [
    "https://drive.google.com/drive/folders/1VQ6IHTjk5sJYjJckZY1kzeRJAI5d09Od?usp=sharing",
    "https://drive.google.com/drive/folders/1zqX6z_sKWHjHyNoMlS_rtkkF6pK_FqVh",
  ];

  let lpbrFolderId = "";
  for (const u of urls) {
    const html = await fetchUrl(u);
    const regex = /aria-label="([^"\n]+?)\s+(?:Shared folder|Google Drive Folder|folder)"[^>]*ssk='5:[^:]*:([a-zA-Z0-9_-]+)/gi;
    let m;
    while ((m = regex.exec(html)) !== null) {
      if (m[1].toLowerCase().includes("lpbr")) {
        lpbrFolderId = m[2].split("-")[0];
        console.log("Found LPBR18 folder ID:", lpbrFolderId, m[1]);
        break;
      }
    }
    if (lpbrFolderId) break;
  }

  if (lpbrFolderId) {
    const fHtml = await fetchUrl("https://drive.google.com/drive/folders/" + lpbrFolderId);
    const pRegex = /aria-label="([^"\n]+?\.(?:jpg|jpeg|png|webp|heic))\s+Image\s+Shared"[^>]*ssk='5:[^:]*:([a-zA-Z0-9_-]+)/gi;
    let pm;
    let idx = 0;
    while ((pm = pRegex.exec(fHtml)) !== null) {
      const fileId = pm[2].split("-")[0];
      console.log("Downloading LPBR18 photo:", idx, pm[1], fileId);
      await downloadImage(fileId, "public/cars/real_stock/rg-lpbr18-" + idx + ".jpg");
      await downloadImage(fileId, "public/cars/real_stock/auto-lpbr18-" + idx + ".jpg");
      idx++;
    }
    console.log("✅ LPBR18 downloaded:", idx, "photos");
  }
}

run();
