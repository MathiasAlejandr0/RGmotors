import { del, put } from "@vercel/blob";
import { mkdir, readdir, rmdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
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

function collectMediaUrls(vehicle: {
  image?: string;
  gallery?: string[];
}): string[] {
  const urls = new Set<string>();
  if (vehicle.image) urls.add(vehicle.image.split("?")[0]);
  for (const g of vehicle.gallery || []) {
    if (g) urls.add(g.split("?")[0]);
  }
  return [...urls].filter(Boolean);
}

/**
 * Borra fotos de un vehículo vendido: Vercel Blob (si aplica) + carpeta local.
 * No falla la venta si alguna foto no se pudo borrar.
 */
export async function deleteVehicleMedia(vehicle: {
  slug: string;
  image?: string;
  gallery?: string[];
}): Promise<{ deletedBlob: number; deletedLocal: number }> {
  const urls = collectMediaUrls(vehicle);
  let deletedBlob = 0;
  let deletedLocal = 0;

  const blobUrls = urls.filter((u) => /blob\.vercel-storage\.com/i.test(u));
  if (blobUrls.length && isBlobReady()) {
    try {
      await del(blobUrls);
      deletedBlob = blobUrls.length;
    } catch (err) {
      console.error(`[Media] Error borrando Blob de ${vehicle.slug}:`, err);
      for (const url of blobUrls) {
        try {
          await del(url);
          deletedBlob++;
        } catch {
          /* ignore single blob */
        }
      }
    }
  }

  const uploadDir = join(
    /*turbopackIgnore: true*/ process.cwd(),
    "public",
    "cars",
    "uploads",
    vehicle.slug,
  );
  const spinDir = join(
    /*turbopackIgnore: true*/ process.cwd(),
    "public",
    "cars",
    "spins",
    vehicle.slug,
  );

  for (const dir of [uploadDir, spinDir]) {
    try {
      if (existsSync(dir)) {
        const files = await readdir(dir);
        for (const file of files) {
          try {
            await unlink(join(dir, file));
            deletedLocal++;
          } catch {
            /* ignore */
          }
        }
        try {
          await rmdir(dir);
        } catch {
          /* ignore */
        }
      }
    } catch (err) {
      console.error(`[Media] Error borrando disco de ${vehicle.slug}:`, err);
    }
  }

  // Rutas locales sueltas fuera de uploads/<slug>
  for (const url of urls) {
    if (!url.startsWith("/") || url.includes("placeholder")) continue;
    const abs = join(/*turbopackIgnore: true*/ process.cwd(), "public", url.replace(/^\/+/, ""));
    if (!existsSync(abs)) continue;
    try {
      await unlink(abs);
      deletedLocal++;
    } catch {
      /* ignore */
    }
  }

  return { deletedBlob, deletedLocal };
}
