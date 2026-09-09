/**
 * Helpers de subida de fotos en el admin (cliente).
 * Al elegir archivos se convierten siempre a WebP (o JPEG de respaldo),
 * redimensionadas y comprimidas para no chocar con el límite ~4.5 MB de Vercel.
 */

export const VERCEL_SAFE_UPLOAD_BYTES = 3_200_000;
/** Objetivo por foto tras conversión (lotes seguros). */
export const TARGET_PHOTO_BYTES = 550_000;
export const MAX_IMAGE_EDGE = 1600;
export const WEBP_QUALITY_START = 0.78;
export const JPEG_QUALITY_START = 0.8;

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

/**
 * Convierte SIEMPRE a WebP (o JPEG si el navegador no exporta WebP),
 * redimensiona a máx. 1600px y comprime hasta ~550 KB.
 */
export async function convertImageToWebp(file: File): Promise<File> {
  const isImage =
    /^image\/(jpeg|jpg|png|webp|avif|heic|heif)$/i.test(file.type) ||
    /\.(jpe?g|png|webp|avif|heic)$/i.test(file.name);
  if (!isImage) return file;

  // Ya es WebP chico: no reprocesar
  if (
    (file.type === "image/webp" || /\.webp$/i.test(file.name)) &&
    file.size <= TARGET_PHOTO_BYTES
  ) {
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
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const useWebp = supportsWebpExport();
  const mime = useWebp ? "image/webp" : "image/jpeg";
  const ext = useWebp ? "webp" : "jpg";
  let quality = useWebp ? WEBP_QUALITY_START : JPEG_QUALITY_START;
  let blob = await canvasToBlob(canvas, mime, quality);

  while (blob && blob.size > TARGET_PHOTO_BYTES && quality > 0.4) {
    quality -= 0.08;
    blob = await canvasToBlob(canvas, mime, quality);
  }

  // Si aún es enorme, reducir más el lienzo
  if (blob && blob.size > VERCEL_SAFE_UPLOAD_BYTES) {
    const scale2 = 0.75;
    const c2 = document.createElement("canvas");
    c2.width = Math.max(1, Math.round(canvas.width * scale2));
    c2.height = Math.max(1, Math.round(canvas.height * scale2));
    const ctx2 = c2.getContext("2d");
    if (ctx2) {
      ctx2.drawImage(canvas, 0, 0, c2.width, c2.height);
      quality = 0.7;
      blob = await canvasToBlob(c2, mime, quality);
      while (blob && blob.size > TARGET_PHOTO_BYTES && quality > 0.35) {
        quality -= 0.08;
        blob = await canvasToBlob(c2, mime, quality);
      }
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

/** Sube fotos de a una (ya deberían venir en WebP liviano). */
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
      errors.push(`${original.name}: sigue pesando demasiado tras convertir a WebP.`);
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
      ? `Se subieron ${uploaded} foto${uploaded === 1 ? "" : "s"} en WebP.`
      : `Se subieron ${uploaded} de ${files.length}. ${errors.slice(0, 2).join(" · ")}`;

  return { count: uploaded, message: msg };
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
