/**
 * Pipeline de servidor: convierte un VIDEO de vuelta al auto en un giro 360°
 * profesional por fotos, listo para el visor PhotoSpin360.
 *
 * Etapas:
 *   1. ffprobe  -> duración del video.
 *   2. ffmpeg   -> extrae N fotogramas repartidos parejo, con mejora de imagen
 *                  (denoise + normalización de color + nitidez).
 *   3. "Estudio" (opcional) -> recorta el fondo con IA y compone el auto sobre
 *                  un fondo oscuro tipo showroom con sombra de contacto. Si la
 *                  IA no está disponible, hace un encuadre 16:9 con viñeta.
 *   4. Escribe public/cars/spin/<slug>/001.jpg ... y un manifest.json.
 *
 * Requiere ffmpeg/ffprobe en el PATH del proceso del servidor.
 */
import { spawn } from "node:child_process";
import { mkdir, rm, readdir, writeFile, mkdtemp, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const W = 1600;
const H = 900; // 16:9

export type ProcessOptions = {
  videoPath: string;
  slug: string;
  frames?: number;
  studio?: boolean;
  onProgress?: (p: { stage: string; pct: number; msg?: string }) => void;
};

export type ProcessResult = {
  slug: string;
  count: number;
  studio: boolean;
  aiUsed: boolean;
  dir: string;
};

function run(cmd: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { windowsHide: true });
    let out = "";
    let err = "";
    p.stdout.on("data", (d) => (out += d.toString()));
    p.stderr.on("data", (d) => (err += d.toString()));
    p.on("error", reject);
    p.on("close", (code) =>
      code === 0 ? resolve(out) : reject(new Error(`${cmd} salió con código ${code}\n${err}`))
    );
  });
}

async function hasBinary(cmd: string): Promise<boolean> {
  try {
    await run(cmd, ["-version"]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Carga perezosa del recorte de fondo con IA. Devuelve null si no está
 * disponible. Se le pasa un Blob con tipo explícito (image/png): pasar una
 * ruta absoluta de Windows falla porque la librería la interpreta como URL
 * ("Unsupported protocol: c:").
 */
async function loadBgRemover(): Promise<
  ((buf: Buffer) => Promise<Buffer>) | null
> {
  try {
    const mod: any = await import("@imgly/background-removal-node");
    const removeBackground = mod.removeBackground ?? mod.default?.removeBackground;
    if (!removeBackground) return null;
    return async (buf: Buffer) => {
      const inputBlob = new Blob([new Uint8Array(buf)], { type: "image/png" });
      const blob: Blob = await removeBackground(inputBlob, {
        output: { format: "image/png" },
      });
      return Buffer.from(await blob.arrayBuffer());
    };
  } catch {
    return null;
  }
}

export async function processVideoToSpin(
  opts: ProcessOptions
): Promise<ProcessResult> {
  const { videoPath, slug, onProgress } = opts;
  const frames = Math.max(12, Math.min(48, opts.frames ?? 32));
  const studio = opts.studio ?? true;
  const report = (stage: string, pct: number, msg?: string) =>
    onProgress?.({ stage, pct, msg });

  if (!/^[a-z0-9-]+$/i.test(slug)) throw new Error("Slug inválido.");
  if (!existsSync(videoPath)) throw new Error("No se encontró el video.");
  if (!(await hasBinary("ffmpeg")) || !(await hasBinary("ffprobe"))) {
    throw new Error(
      "ffmpeg no está disponible en el servidor. Instálalo (winget install Gyan.FFmpeg) y reinicia el servidor."
    );
  }

  report("probe", 2, "Analizando el video…");
  const durationRaw = await run("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    videoPath,
  ]);
  const duration = parseFloat(durationRaw.trim());
  if (!duration || Number.isNaN(duration)) throw new Error("Video ilegible o sin duración.");

  const rawDir = await mkdtemp(join(tmpdir(), "rgspin-"));
  const outDir = join(process.cwd(), "public", "cars", "spin", slug);

  try {
    // --- 2. Extracción + mejora de imagen con ffmpeg -----------------------
    report("extract", 10, "Extrayendo fotogramas…");
    const fps = frames / duration;
    const vf = [
      `fps=${fps}`,
      `scale=${W}:-1:flags=lanczos`,
      "hqdn3d=2:1:2:2",
      "eq=contrast=1.06:saturation=1.08:brightness=0.01",
      "unsharp=5:5:0.8:5:5:0.0",
    ].join(",");
    await run("ffmpeg", [
      "-y",
      "-i",
      videoPath,
      "-vf",
      vf,
      "-frames:v",
      String(frames + 1),
      "-q:v",
      "2",
      join(rawDir, "%03d.png"),
    ]);

    let rawFiles = (await readdir(rawDir))
      .filter((f) => f.endsWith(".png"))
      .sort();
    rawFiles = rawFiles.slice(0, frames);
    if (rawFiles.length === 0) throw new Error("ffmpeg no generó fotogramas.");

    // --- 3. Composición de estudio ----------------------------------------
    const { createCanvas, loadImage }: any = await import("@napi-rs/canvas");
    const bgRemove = studio ? await loadBgRemover() : null;
    let aiUsed = false;

    await rm(outDir, { recursive: true, force: true });
    await mkdir(outDir, { recursive: true });

    let i = 0;
    for (const file of rawFiles) {
      const rawPath = join(rawDir, file);
      const canvas = createCanvas(W, H);
      const ctx = canvas.getContext("2d");
      drawStudioBackground(ctx);

      if (bgRemove) {
        try {
          const rawBuf = await readFile(rawPath);
          const cut = await bgRemove(rawBuf);
          const img = await loadImage(cut);
          drawCentered(ctx, img, true);
          aiUsed = true;
        } catch (err) {
          console.error("[spin] bg-remove falló:", err instanceof Error ? err.message : err);
          const img = await loadImage(rawPath);
          drawCentered(ctx, img, false);
        }
      } else {
        const img = await loadImage(rawPath);
        drawCentered(ctx, img, false);
        drawVignette(ctx);
      }

      const jpg = await canvas.encode("jpeg", 86);
      await writeFile(join(outDir, `${String(i + 1).padStart(3, "0")}.jpg`), jpg);
      i += 1;
      report("compose", 20 + Math.round((i / rawFiles.length) * 75), `Procesando ${i}/${rawFiles.length}…`);
    }

    // --- 4. Manifest -------------------------------------------------------
    const manifest = {
      slug,
      count: rawFiles.length,
      studio,
      aiUsed,
      updatedAt: new Date().toISOString(),
    };
    await writeFile(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));

    report("done", 100, "Listo");
    return { slug, count: rawFiles.length, studio, aiUsed, dir: outDir };
  } finally {
    await rm(rawDir, { recursive: true, force: true }).catch(() => {});
  }
}

// ---- Helpers de dibujo (estudio) ------------------------------------------
function drawStudioBackground(ctx: any) {
  // Degradado vertical oscuro tipo showroom.
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#161a20");
  g.addColorStop(0.55, "#0e1116");
  g.addColorStop(1, "#070809");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Halo de luz suave detrás del centro.
  const r = ctx.createRadialGradient(W / 2, H * 0.42, 80, W / 2, H * 0.5, W * 0.62);
  r.addColorStop(0, "rgba(90,120,160,0.22)");
  r.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = r;
  ctx.fillRect(0, 0, W, H);
}

function drawVignette(ctx: any) {
  const r = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.75);
  r.addColorStop(0, "rgba(0,0,0,0)");
  r.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = r;
  ctx.fillRect(0, 0, W, H);
}

/**
 * Dibuja el auto centrado y "aterrizado". Con recorte (alpha) normaliza el
 * tamaño por altura y agrega sombra de contacto; sin recorte, hace "contain".
 */
function drawCentered(ctx: any, img: any, cutout: boolean) {
  const iw = img.width;
  const ih = img.height;

  if (!cutout) {
    const scale = Math.min(W / iw, H / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    return;
  }

  // Auto recortado: encuadre estable anclado al piso.
  const targetH = H * 0.52;
  let scale = targetH / ih;
  if (iw * scale > W * 0.92) scale = (W * 0.92) / iw;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (W - dw) / 2;
  const baseline = H * 0.84;
  const dy = baseline - dh;

  // Sombra de contacto elíptica.
  ctx.save();
  const shadowY = baseline - dh * 0.02;
  const grad = ctx.createRadialGradient(W / 2, shadowY, 10, W / 2, shadowY, dw * 0.55);
  grad.addColorStop(0, "rgba(0,0,0,0.55)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(W / 2, shadowY, dw * 0.48, dh * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.drawImage(img, dx, dy, dw, dh);
}
