const fs = require("fs");

function cleanPlate(p) {
  if (!p) return "";
  return p.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function parsePrice(str) {
  if (!str) return 0;
  if (/falta|reservado|preparacion|terminar|taller|casa|consignado|rq|fotos/i.test(str)) {
    return 0;
  }
  const clean = str.replace(/[^0-9]/g, "");
  return clean ? parseInt(clean, 10) : 0;
}

function parseKm(str) {
  if (!str) return 0;
  if (/falta|consignado|ald|c\.poder/i.test(str)) return 0;
  const clean = str.replace(/[^0-9]/g, "");
  return clean ? parseInt(clean, 10) : 0;
}

function parsePdf1(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const items = [];
  
  for (const line of lines) {
    if (/^PATENTE/i.test(line) || /^--/i.test(line)) continue;
    const parts = line.split("\t").map(p => p.trim());
    if (parts.length < 5) continue;
    
    // Pattern: [idx, patente, marca, modelo, color, ano, precioLista, precioOferta, km, proveedor, rev, permiso, ubicacion]
    let [idx, patente, marca, modelo, color, ano, precioLista, precioOferta, km, proveedor, rev, permiso, ubicacion] = parts;
    
    // In case idx is missing or parts shifted
    if (!/^[0-9]+$/.test(idx) && parts[0].length >= 4) {
      patente = parts[0];
      marca = parts[1];
      modelo = parts[2];
      color = parts[3];
      ano = parts[4];
      precioLista = parts[5];
      precioOferta = parts[6];
      km = parts[7];
      proveedor = parts[8];
      rev = parts[9];
      permiso = parts[10];
      ubicacion = parts[11];
    }

    if (!patente || !marca) continue;

    items.push({
      source: "UNIDADES_CHILE_5",
      rawPatente: patente,
      plate: cleanPlate(patente),
      brand: marca,
      model: modelo || "",
      color: color || "",
      year: parseInt(ano, 10) || 2022,
      rawListPrice: precioLista || "",
      rawOfferPrice: precioOferta || "",
      rawKm: km || "",
      supplier: proveedor || "",
      techReview: rev || "",
      circPermit: permiso || "",
      location: ubicacion || "Puerto Montt (Unidades Chile)"
    });
  }
  return items;
}

function parsePdf2(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const items = [];

  for (const line of lines) {
    if (/^PATENTE/i.test(line) || /^--/i.test(line)) continue;
    const parts = line.split("\t").map(p => p.trim());
    if (parts.length < 4) continue;

    let [idx, patente, marca, modelo, color, ano, precioLista, precioOferta, km, proveedor, rev, permiso, ubicacion] = parts;

    if (!/^[0-9]+$/.test(idx) && parts[0].length >= 4) {
      patente = parts[0];
      marca = parts[1];
      modelo = parts[2];
      color = parts[3];
      ano = parts[4];
      precioLista = parts[5];
      precioOferta = parts[6];
      km = parts[7];
      proveedor = parts[8];
      rev = parts[9];
      permiso = parts[10];
      ubicacion = parts[11];
    }

    if (!patente || !marca) continue;

    items.push({
      source: "RG_MOTORS_STOCK",
      rawPatente: patente,
      plate: cleanPlate(patente),
      brand: marca,
      model: modelo || "",
      color: color || "",
      year: parseInt(ano, 10) || 2022,
      rawListPrice: precioLista || "",
      rawOfferPrice: precioOferta || "",
      rawKm: km || "",
      supplier: proveedor || "",
      techReview: rev || "",
      circPermit: permiso || "",
      location: ubicacion || "Puerto Montt (Cardonal / Salgado)"
    });
  }
  return items;
}

const txt1 = fs.readFileSync("scratch/stock_unidades_chile_5.txt", "utf8");
const txt2 = fs.readFileSync("scratch/stock_rg_motors.txt", "utf8");

const items1 = parsePdf1(txt1);
const items2 = parsePdf2(txt2);

console.log(`Parsed PDF 1: ${items1.length} vehicles`);
console.log(`Parsed PDF 2: ${items2.length} vehicles`);

fs.writeFileSync("scratch/parsed_pdf1.json", JSON.stringify(items1, null, 2), "utf8");
fs.writeFileSync("scratch/parsed_pdf2.json", JSON.stringify(items2, null, 2), "utf8");
