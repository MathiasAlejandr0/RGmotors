const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const driveBase = "C:/Users/mathi/OneDrive/Escritorio/drive rgmotors";

function findAllPlateFolders(dir) {
  let result = {};
  if (!fs.existsSync(dir)) return result;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      const cleanName = e.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      // if matches 6-character plate like abcd12 or 4 letters 2 digits
      if (/^[a-z]{2,4}[0-9]{2,4}$/.test(cleanName)) {
        if (!result[cleanName]) result[cleanName] = [];
        result[cleanName].push(full);
      }
      const sub = findAllPlateFolders(full);
      for (const [k, v] of Object.entries(sub)) {
        if (!result[k]) result[k] = [];
        result[k] = result[k].concat(v);
      }
    }
  }
  return result;
}

const plateFolders = findAllPlateFolders(driveBase);
console.log(`Found plate folders in Drive for ${Object.keys(plateFolders).length} plates.`);

async function syncDrivePhotosToPublic() {
  for (const [plate, dirs] of Object.entries(plateFolders)) {
    const targetDir = path.join("public/cars/inventory", plate);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const existingFiles = fs.readdirSync(targetDir).filter(f => f.endsWith(".jpg") || f.endsWith(".png"));
    if (existingFiles.length >= 5) {
      // Already has photos
      continue;
    }

    // Copy photos from drive
    let count = 0;
    for (const d of dirs) {
      const files = fs.readdirSync(d).filter(f => /\.(jpe?g|png)$/i.test(f));
      for (const f of files) {
        const srcPath = path.join(d, f);
        const destPath = path.join(targetDir, `${count}.jpg`);
        try {
          // Resize and optimize
          await sharp(srcPath)
            .rotate()
            .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
            .jpeg({ quality: 90 })
            .toFile(destPath);
          count++;
          if (count >= 15) break;
        } catch (err) {
          console.warn(`Error processing ${srcPath}:`, err.message);
        }
      }
      if (count >= 15) break;
    }
    console.log(`Synced ${count} photos for plate ${plate}`);
  }
}

syncDrivePhotosToPublic().then(() => console.log("✅ Sync complete!")).catch(console.error);
