/**
 * Helpers de subida de fotos en el admin (cliente).
 * Prioriza calidad: solo redimensiona/comprime lo mínimo para no superar
 * el límite ~4.5 MB de Vercel (subida de a una).
 */

export const VERCEL_SAFE_UPLOAD_BYTES = 3_200_000;
/** Techo blando: preferible no bajar de esta calidad salvo necesidad. */
export const SOFT_TARGET_BYTES = 2_400_000;
export const MAX_IMAGE_EDGE = 3200;
export const WEBP_QUALITY_START = 0.92;
export const JPEG_QUALITY_START = 0.92;
/** No bajar de esto salvo que el archivo aún exceda el límite de Vercel. */
export const MIN_QUALITY_FOR_SIZE = 0.82;
export const MIN_QUALITY_HARD = 0.72;

/** Lee el cuerpo aunque no sea JSON (ej. "Request Entity Too Large"). */
export async function readApiError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const j = JSON.parse(text) as { error?: string; message?: string };
    if (j.error) return j.error;
    if (j.message) return j.message;
  } catch {
    /* texto plano */
  }
  const t = text.trim();
  if (/request entity too large/i.test(t) || res.status === 413) {
    return "El archivo sigue siendo demasiado grande para Vercel. Prueba con otra foto o baja la resolución.";
  }
  if (t.startsWith("<!") || t.toLowerCase().includes("<html")) {
    return `Error del servidor (HTTP ${res.status}). Intenta de nuevo.`;
  }
  if (t.length > 0 && t.length < 200) return t;
  return `Error al subir (HTTP ${res.status}).`;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen"));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function supportsWebpExport(): boolean {
  try {
    const c = document.createElement("canvas");
    c.width = 1;
    c.height = 1;
    return c.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
}

function isAlreadyWebSafe(file: File): boolean {
  const webSafe =
    file.type === "image/webp" ||
    file.type === "image/jpeg" ||
    /\.(webp|jpe?g)$/i.test(file.name);
  return webSafe && file.size <= VERCEL_SAFE_UPLOAD_BYTES;
}

/**
 * Prepara la imagen para subir priorizando calidad.
 * - Si ya es JPEG/WebP y cabe en Vercel, no se reprocesa.
 * - Si no, exporta WebP (o JPEG) a calidad alta; solo baja calidad/tamaño
 *   si hace falta para el límite de subida.
 */
export async function convertImageToWebp(file: File): Promise<File> {
  const isImage =
    /^image\/(jpeg|jpg|png|webp|avif|heic|heif)$/i.test(file.type) ||
    /\.(jpe?g|png|webp|avif|heic)$/i.test(file.name);
  if (!isImage) return file;

  // Ya apta para web y dentro del límite: no re-encode (evita pérdida de calidad)
  if (isAlreadyWebSafe(file)) {
    return file;
  }

  const img = await loadImage(file);
  let { width, height } = img;
  const maxEdge = Math.max(width, height);
  if (maxEdge > MAX_IMAGE_EDGE) {
    const scale = MAX_IMAGE_EDGE / maxEdge;
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const useWebp = supportsWebpExport();
  const mime = useWebp ? "image/webp" : "image/jpeg";
  const ext = useWebp ? "webp" : "jpg";
  let quality = useWebp ? WEBP_QUALITY_START : JPEG_QUALITY_START;
  let working: HTMLCanvasElement = canvas;
  let blob = await canvasToBlob(working, mime, quality);

  // Solo bajar calidad si supera el techo blando / seguro
  while (
    blob &&
    blob.size > SOFT_TARGET_BYTES &&
    quality > MIN_QUALITY_FOR_SIZE
  ) {
    quality = Math.max(MIN_QUALITY_FOR_SIZE, quality - 0.03);
    blob = await canvasToBlob(working, mime, quality);
  }

  // Si aún no cabe en Vercel, bajar un poco más (último recurso)
  while (blob && blob.size > VERCEL_SAFE_UPLOAD_BYTES && quality > MIN_QUALITY_HARD) {
    quality = Math.max(MIN_QUALITY_HARD, quality - 0.04);
    blob = await canvasToBlob(working, mime, quality);
  }

  // Último recurso: reducir resolución manteniendo calidad alta
  let scalePass = 0;
  while (blob && blob.size > VERCEL_SAFE_UPLOAD_BYTES && scalePass < 3) {
    scalePass++;
    const scale = 0.85;
    const c2 = document.createElement("canvas");
    c2.width = Math.max(1, Math.round(working.width * scale));
    c2.height = Math.max(1, Math.round(working.height * scale));
    const ctx2 = c2.getContext("2d");
    if (!ctx2) break;
    ctx2.imageSmoothingEnabled = true;
    ctx2.imageSmoothingQuality = "high";
    ctx2.drawImage(working, 0, 0, c2.width, c2.height);
    working = c2;
    quality = Math.max(quality, 0.88);
    blob = await canvasToBlob(working, mime, quality);
    while (blob && blob.size > VERCEL_SAFE_UPLOAD_BYTES && quality > MIN_QUALITY_HARD) {
      quality = Math.max(MIN_QUALITY_HARD, quality - 0.04);
      blob = await canvasToBlob(working, mime, quality);
    }
  }

  if (!blob) return file;

  const base = file.name.replace(/\.[^/.]+$/, "") || "photo";
  return new File([blob], `${base}.${ext}`, {
    type: mime,
    lastModified: Date.now(),
  });
}

/** @deprecated usar convertImageToWebp */
export async function prepareImageForUpload(file: File): Promise<File> {
  return convertImageToWebp(file);
}

/** Convierte un lote al seleccionar (muestra progreso). */
export async function convertFilesToWebpBatch(
  files: File[],
  onProgress?: (done: number, total: number, name: string) => void,
): Promise<File[]> {
  const out: File[] = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i]!;
    onProgress?.(i, files.length, f.name);
    try {
      out.push(await convertImageToWebp(f));
    } catch {
      out.push(f);
    }
  }
  onProgress?.(files.length, files.length, "");
  return out;
}

export type UploadProgress = {
  done: number;
  total: number;
  currentName: string;
};

/** Sube fotos de a una (ya deberían venir preparadas). */
export async function uploadPhotosSequentially(opts: {
  slug: string;
  type: "gallery" | "cover" | "spin";
  files: File[];
  onProgress?: (p: UploadProgress) => void;
}): Promise<{ count: number; message: string }> {
  const { slug, type, files, onProgress } = opts;
  let uploaded = 0;
  const errors: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const original = files[i]!;
    onProgress?.({ done: i, total: files.length, currentName: original.name });

    // Por si llegó sin convertir (spin / arrastre)
    const prepared = await convertImageToWebp(original);

    if (prepared.size > VERCEL_SAFE_UPLOAD_BYTES) {
      errors.push(`${original.name}: sigue pesando demasiado tras preparar la imagen.`);
      continue;
    }

    const fd = new FormData();
    fd.append("slug", slug);
    let uploadType: string = type;
    if (type === "cover") {
      uploadType = i === 0 ? "cover" : "gallery";
    }
    fd.append("type", uploadType);
    fd.append("files", prepared);

    const res = await fetch("/api/photos", { method: "POST", body: fd });
    if (!res.ok) {
      errors.push(`${original.name}: ${await readApiError(res)}`);
      continue;
    }
    try {
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!data.success) {
        errors.push(`${original.name}: ${data.error || "falló"}`);
        continue;
      }
    } catch {
      errors.push(`${original.name}: respuesta inválida del servidor`);
      continue;
    }
    uploaded++;
  }

  onProgress?.({ done: files.length, total: files.length, currentName: "" });

  if (uploaded === 0) {
    throw new Error(errors[0] || "No se pudo subir ninguna foto.");
  }

  const msg =
    uploaded === files.length
      ? `Se subieron ${uploaded} foto${uploaded === 1 ? "" : "s"} en alta calidad.`
      : `Se subieron ${uploaded} de ${files.length}. ${errors.slice(0, 2).join(" · ")}`;

  return { count: uploaded, message: msg };
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
