import { resolve } from "node:path";
import { processVideoToSpin } from "../lib/server/spinProcessor";

async function main() {
  const videoPath = resolve("fotos y videos/IMG_7478.MOV");
  const slug = "toyota-rav4-hibrido";
  const frames = 36;

  console.log(`🚀 Iniciando procesamiento de estudio con IA para: ${slug}`);
  console.log(`📹 Video fuente: ${videoPath}`);

  const startTime = Date.now();

  const result = await processVideoToSpin({
    videoPath,
    slug,
    frames,
    studio: true,
    onProgress: (p) => {
      console.log(`[${p.pct}%] ${p.stage}: ${p.msg ?? ""}`);
    },
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ ¡Procesamiento completado con éxito en ${elapsed}s!`);
  console.log(`📂 Fotogramas guardados en: ${result.dir}`);
  console.log(`✨ IA utilizada: ${result.aiUsed ? "Sí" : "No"}`);
}

main().catch((err) => {
  console.error("❌ Error en el procesamiento:", err);
  process.exit(1);
});
