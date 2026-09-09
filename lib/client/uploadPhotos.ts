/**
 * Helpers de subida de fotos en el admin (cliente).
 * Vercel limita el body de serverless ~4.5 MB: hay que subir de a una y comprimir.
 */

export const VERCEL_SAFE_UPLOAD_BYTES = 3_500_000; // margen bajo 4.5 MB
export const MAX_IMAGE_EDGE = 1920;
export const JPEG_QUALITY = 0.82;

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
    return "Las fotos pesan demasiado para subirlas juntas. Se subirán de una en una (máx. ~3,5 MB por archivo).";
  }
  if (t.startsWith("<!") || t.toLowerCase().includes("<html")) {
    return `Error del servidor (HTTP ${res.status}). Intenta de nuevo o sube menos fotos.`;
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

/** Comprime a JPEG si supera el límite o es muy grande en píxeles. */
export async function prepareImageForUpload(file: File): Promise<File> {
  if (!/^image\/(jpeg|jpg|png|webp|avif)$/i.test(file.type) && !/\.(jpe?g|png|webp|avif)$/i.test(file.name)) {
    return file;
  }

  const needsCompress =
    file.size > 1_200_000 || /\.png$/i.test(file.name) || file.type === "image/png";

  if (!needsCompress && file.size <= VERCEL_SAFE_UPLOAD_BYTES) {
    return file;
  }

  try {
    const img = await loadImage(file);
    let { width, height } = img;
    const maxEdge = Math.max(width, height);
    if (maxEdge > MAX_IMAGE_EDGE) {
      const scale = MAX_IMAGE_EDGE / maxEdge;
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    let quality = JPEG_QUALITY;
    let blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/jpeg", quality));

    while (blob && blob.size > VERCEL_SAFE_UPLOAD_BYTES && quality > 0.45) {
      quality -= 0.1;
      blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", quality));
    }

    if (!blob) return file;

    const base = file.name.replace(/\.[^/.]+$/, "") || "photo";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file;
  }
}

export type UploadProgress = {
  done: number;
  total: number;
  currentName: string;
};

/** Sube fotos de a una a /api/photos. */
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

    const prepared = type === "spin" ? original : await prepareImageForUpload(original);

    if (prepared.size > VERCEL_SAFE_UPLOAD_BYTES) {
      errors.push(`${original.name}: sigue pesando demasiado tras comprimir.`);
      continue;
    }

    const fd = new FormData();
    fd.append("slug", slug);
    fd.append("type", i === 0 && type === "cover" ? "cover" : type === "cover" ? "gallery" : type);
    // Primera de “cover” como cover; el resto de esa selección como gallery
    if (type === "cover" && i > 0) {
      fd.set("type", "gallery");
    }
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
      ? `Se subieron ${uploaded} foto${uploaded === 1 ? "" : "s"} con éxito.`
      : `Se subieron ${uploaded} de ${files.length}. ${errors.slice(0, 2).join(" · ")}`;

  return { count: uploaded, message: msg };
}
