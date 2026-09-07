import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { isBlobReady, isVercelProduction } from "@/lib/server/storageHealth";

export type StoredMedia = {
  /** URL pública (Blob) o path relativo (/cars/...) */
  url: string;
  /** Path lógico relativo para galería local */
  relativePath: string;
  storage: "blob" | "local";
};

/**
 * Guarda un archivo de media.
 * - Con BLOB_READ_WRITE_TOKEN → Vercel Blob (durable + CDN).
 * - Sin token en prod Vercel → error (no escribir a disco efímero).
 * - Sin token en local → public/.
 */
export async function storeMediaFile(opts: {
  bytes: Buffer;
  /** Ruta lógica ej. cars/uploads/slug/file.jpg */
  relativePath: string;
  contentType?: string;
}): Promise<StoredMedia> {
  const relativePath = opts.relativePath.replace(/^\/+/, "");
  const contentType = opts.contentType || guessContentType(relativePath);

  if (isBlobReady()) {
    const blob = await put(relativePath, opts.bytes, {
      access: "public",
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return {
      url: blob.url,
      relativePath: `/${relativePath}`,
      storage: "blob",
    };
  }

  if (isVercelProduction()) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN es obligatorio en producción para subir fotos/360.",
    );
  }

  const abs = join(/*turbopackIgnore: true*/ process.cwd(), "public", relativePath);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, opts.bytes);
  return {
    url: `/${relativePath}`,
    relativePath: `/${relativePath}`,
    storage: "local",
  };
}

function guessContentType(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "json":
      return "application/json";
    case "jpg":
    case "jpeg":
    default:
      return "image/jpeg";
  }
}
