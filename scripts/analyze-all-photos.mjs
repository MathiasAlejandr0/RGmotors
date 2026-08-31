import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const map = JSON.parse(readFileSync("scratch/plate_photos_map.json", "utf8"));

// We have 22 plates:
// CVFF32 -> Nissan Terrano Roja 4x4
// DDLJ95 -> Mercedes ML 350 Blanca
// DXTZ99 -> Nissan Terrano Blanca 4x4
// HBDZ43 -> Renault Duster Negra
// HJCW79 -> Subaru Outback Plateada
// JGRF99 -> Mitsubishi L200 Gris Oscuro 4x4
// JSPB25 -> Peugeot 2008 Gris Plateado
// JZKB82 -> Fiat Fiorino Blanca
// KBBJ67 -> Mitsubishi L200 Roja 4x4
// KFLS48 -> Fiat Fiorino Blanca (Falabella)
// KWRG63 -> Mitsubishi L200 Roja 4x4
// KXDZ62 -> DFSK Glory 580 Café
// KXXJ56 -> Chevrolet D-Max Blanca 4x4
// KZWL56 -> Toyota Hilux Gris Grafito 4x4
// LBXC37 -> Great Wall Wingle 6 Blanca 4x4
// LFGK64 -> Toyota Hilux Roja 4x4
// LGLK16 -> Mitsubishi L200 Roja 4x4
// LJYW11 -> Hyundai Tucson Blanca
// LPBR18 -> Toyota Hilux Roja 4x4
// LPPW35 -> Peugeot Expert Blanca Furgón
// LTYF61 -> Peugeot Partner Blanca Furgón
// LXBD49 -> Chevrolet D-Max Roja 4x4

console.log("Analizando fotos de cada patente...");
for (const [plate, files] of Object.entries(map)) {
  console.log(`\n=== PATENTE: ${plate} (${files.length} fotos) ===`);
  console.log(files.join(", "));
}
