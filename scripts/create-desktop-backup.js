const fs = require('fs');
const path = require('path');

const targetBackupDir = 'c:\\Users\\mathi\\OneDrive\\Escritorio\\RESPALDO_FOTOS_DRIVE';
const uploadsDir = path.join(__dirname, '../public/cars/uploads');
const vehicles = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/vehicles.json'), 'utf8'));

console.log('Creating backup folder at:', targetBackupDir);
if (!fs.existsSync(targetBackupDir)) {
  fs.mkdirSync(targetBackupDir, { recursive: true });
}

const plateToVehicle = new Map();
vehicles.forEach(v => {
  const cleanP = (v.plate || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (cleanP) plateToVehicle.set(cleanP, v);
});

// Load all 243 drive folders from scratch if available
let allDriveFolders = [];
if (fs.existsSync(path.join(__dirname, '../scratch/all_drive_folders.json'))) {
  allDriveFolders = JSON.parse(fs.readFileSync(path.join(__dirname, '../scratch/all_drive_folders.json'), 'utf8'));
}

let copiedFolders = 0;
let copiedPhotos = 0;

const uploadFolders = fs.readdirSync(uploadsDir);

uploadFolders.forEach(slug => {
  const srcSlugDir = path.join(uploadsDir, slug);
  if (!fs.statSync(srcSlugDir).isDirectory()) return;

  const files = fs.readdirSync(srcSlugDir).filter(f => /\.(jpg|jpeg|png|webp|heic)$/i.test(f));
  if (files.length === 0) return;

  // Extract plate from slug (last part after last hyphen) or find vehicle
  const parts = slug.split('-');
  const rawPlate = parts[parts.length - 1].toUpperCase();
  const v = plateToVehicle.get(rawPlate);

  let folderName = slug;
  if (v) {
    const cleanPlateStr = v.plate.replace(/\s+/g, '');
    folderName = `[${cleanPlateStr}] ${v.brand} ${v.model} (${v.year})`;
  }

  // Clean folder name for Windows
  folderName = folderName.replace(/[<>:"/\\|?*]/g, '_');

  const destDir = path.join(targetBackupDir, folderName);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  files.forEach(file => {
    const srcFile = path.join(srcSlugDir, file);
    const destFile = path.join(destDir, file);
    fs.copyFileSync(srcFile, destFile);
    copiedPhotos++;
  });

  copiedFolders++;
});

// Create registry text file with all 243 Google Drive folder IDs
let registryText = '===================================================================\n';
registryText += 'REGISTRO HISTÓRICO DE CARPETAS GOOGLE DRIVE - RG MOTORS & UNIDADES CHILE\n';
registryText += 'Total de carpetas rastreadas originalmente: ' + allDriveFolders.length + '\n';
registryText += 'Total de vehículos con fotos respaldadas localmente: ' + copiedFolders + ' (' + copiedPhotos + ' fotos)\n';
registryText += 'Fecha de respaldo: ' + new Date().toLocaleString('es-CL') + '\n';
registryText += '===================================================================\n\n';

registryText += 'LISTADO DE CARPETAS ORIGINALES DE GOOGLE DRIVE:\n';
allDriveFolders.forEach((f, i) => {
  registryText += `${i + 1}. [${f.name}] ID: ${f.id} -> https://drive.google.com/drive/folders/${f.id}\n`;
});

fs.writeFileSync(path.join(targetBackupDir, 'REGISTRO_CARPETAS_DRIVE.txt'), registryText, 'utf8');

console.log(`\nBackup completed successfully!`);
console.log(`Folders copied: ${copiedFolders}`);
console.log(`Photos copied: ${copiedPhotos}`);
console.log(`Backup location: ${targetBackupDir}`);
