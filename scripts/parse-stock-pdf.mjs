import fs from "node:fs";
import pdfParse from "pdf-parse";

async function parsePdf() {
  const dataBuffer = fs.readFileSync("STOCK RG MOTORS_UNIDADES CHILE - UNIDADES CHILE (5).pdf");
  const data = await pdfParse(dataBuffer);
  console.log("=== PDF TEXT LENGTH:", data.text.length);
  console.log("=== PDF PAGES:", data.numpages);
  fs.writeFileSync("scratch/stock_pdf_raw.txt", data.text, "utf8");
  console.log("=== FIRST 2000 CHARS ===");
  console.log(data.text.slice(0, 2000));
}

parsePdf().catch(console.error);
