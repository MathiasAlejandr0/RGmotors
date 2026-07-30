/**
 * Convierte un VIDEO de vuelta al auto en el giro 360° por fotos.
 *
 * Graba un video dando una vuelta completa al vehículo (o el auto girando
 * sobre una plataforma con la cámara fija), y este script extrae N fotogramas
 * repartidos de forma pareja y los deja listos para el visor PhotoSpin360:
 *   public/cars/spin/<slug>/001.jpg ... NNN.jpg
 *
 * Requisito: tener ffmpeg instalado (incluye ffprobe).
 *   Windows:  winget install Gyan.FFmpeg
 *   Mac:      brew install ffmpeg
 *
 * Uso:
 *   node scripts/video-to-spin.mjs --slug toyota-hilux-2020 --video ./mi-video.mp4 --frames 32
 *
 * Luego, en lib/vehicles.ts agrega  spin: { count: 32 }  a ese vehículo.
 */
import { spawnSync } from "node:child_process";
import { mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---- Parseo simple de argumentos ------------------------------------------
function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

const slug = arg("slug");
const video = arg("video");
const frames = parseInt(arg("frames", "32"), 10);
const width = parseInt(arg("width", "1280"), 10);

if (!slug || !video) {
  console.error(
    "Uso: node scripts/video-to-spin.mjs --slug <slug> --video <archivo> [--frames 32] [--width 1280]"
  );
  process.exit(1);
}

// ---- Verifica ffmpeg / ffprobe --------------------------------------------
function has(cmd) {
  const r = spawnSync(cmd, ["-version"], { encoding: "utf8" });
  return r.status === 0;
}
if (!has("ffmpeg") || !has("ffprobe")) {
  console.error(
    "\n✗ No se encontró ffmpeg/ffprobe.\n" +
      "  Instálalo:  Windows -> winget install Gyan.FFmpeg   |   Mac -> brew install ffmpeg\n"
  );
  process.exit(1);
}

const OUT_DIR = join(__dirname, "..", "public", "cars", "spin", slug);

async function main() {
  const videoPath = resolve(video);

  // Duración del video (segundos) con ffprobe.
  const probe = spawnSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      videoPath,
    ],
    { encoding: "utf8" }
  );
  const duration = parseFloat(probe.stdout.trim());
  if (!duration || Number.isNaN(duration)) {
    console.error(`✗ No se pudo leer la duración de: ${videoPath}`);
    process.exit(1);
  }

  // Limpia y recrea la carpeta destino.
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  // fps para obtener ~N fotogramas repartidos parejo en toda la duración.
  const fps = frames / duration;

  console.log(
    `→ Video: ${videoPath}\n→ Duración: ${duration.toFixed(1)}s  |  Frames: ${frames}  |  fps=${fps.toFixed(3)}`
  );

  const res = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      videoPath,
      "-vf",
      `fps=${fps},scale=${width}:-1:flags=lanczos`,
      "-q:v",
      "3",
      join(OUT_DIR, "%03d.jpg"),
    ],
    { stdio: "inherit" }
  );

  if (res.status !== 0) {
    console.error("✗ ffmpeg falló al extraer fotogramas.");
    process.exit(1);
  }

  // ffmpeg a veces genera 1 frame de más; recorta el sobrante.
  const files = (await readdir(OUT_DIR)).filter((f) => f.endsWith(".jpg")).sort();
  for (const extra of files.slice(frames)) {
    await rm(join(OUT_DIR, extra));
  }

  const finalCount = Math.min(files.length, frames);
  console.log(
    `\n✓ ${finalCount} fotogramas en public/cars/spin/${slug}/` +
      `\n  Ahora agrega en lib/vehicles.ts:  spin: { count: ${finalCount} }`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
