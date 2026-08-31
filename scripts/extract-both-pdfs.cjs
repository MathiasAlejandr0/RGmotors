const fs = require("fs");
const { PDFParse } = require("pdf-parse");

async function parsePdf(filePath, outName) {
  const buf = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buf });
  const textResult = await parser.getText();
  console.log(`=== ${filePath} ===`);
  console.log("Pages:", textResult.pages?.length || textResult.numpages);
  console.log("Text Length:", textResult.text?.length);
  
  if (!fs.existsSync("scratch")) fs.mkdirSync("scratch");
  fs.writeFileSync(`scratch/${outName}.txt`, textResult.text, "utf8");

  try {
    const tables = await parser.getTable();
    fs.writeFileSync(`scratch/${outName}_tables.json`, JSON.stringify(tables, null, 2), "utf8");
  } catch (e) {
    console.log("Table parse note:", e.message);
  }
}

async function run() {
  await parsePdf("STOCK RG MOTORS_UNIDADES CHILE - RG MOTORS.pdf", "stock_rg_motors");
  await parsePdf("STOCK RG MOTORS_UNIDADES CHILE - UNIDADES CHILE (5).pdf", "stock_unidades_chile_5");
}

run().catch(console.error);
