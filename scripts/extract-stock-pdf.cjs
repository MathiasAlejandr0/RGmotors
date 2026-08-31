const fs = require("fs");
const { PDFParse } = require("pdf-parse");

async function main() {
  const buf = fs.readFileSync("STOCK RG MOTORS_UNIDADES CHILE - UNIDADES CHILE (5).pdf");
  const parser = new PDFParse({ data: buf });
  const textResult = await parser.getText();
  console.log("=== TOTAL PAGES:", textResult.pages?.length || textResult.numpages);
  console.log("=== TEXT LENGTH:", textResult.text?.length);
  
  if (!fs.existsSync("scratch")) fs.mkdirSync("scratch");
  fs.writeFileSync("scratch/stock_pdf_raw.txt", textResult.text, "utf8");
  
  // Also try getTable
  try {
    const tables = await parser.getTable();
    fs.writeFileSync("scratch/stock_pdf_tables.json", JSON.stringify(tables, null, 2), "utf8");
    console.log("=== TABLES SAVED");
  } catch (e) {
    console.log("Table extract note:", e.message);
  }
  
  console.log("=== PREVIEW ===");
  console.log(textResult.text.slice(0, 1500));
}

main().catch(console.error);
