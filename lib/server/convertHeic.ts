import decode from "heic-decode";
import { createCanvas } from "@napi-rs/canvas";

export function isHeicFile(name: string, mime?: string): boolean {
  if (mime && /image\/(heic|heif)/i.test(mime)) return true;
  return /\.(heic|heif)$/i.test(name);
}

/**
 * Convierte HEIC/HEIF (iPhone) a JPEG para Blob/web.
 * Usa heic-decode + @napi-rs/canvas (ya en el proyecto).
 */
export async function convertHeicToJpegBuffer(
  input: Buffer,
  quality = 90,
): Promise<{ buffer: Buffer; contentType: "image/jpeg"; ext: "jpg" }> {
  const { data, width, height } = await decode({ buffer: input });
  if (!width || !height || !data) {
    throw new Error("HEIC inválido o vacío.");
  }

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(width, height);
  imageData.data.set(data as Uint8ClampedArray);
  ctx.putImageData(imageData, 0, 0);

  const jpeg = await canvas.encode("jpeg", quality);
  return {
    buffer: Buffer.from(jpeg),
    contentType: "image/jpeg",
    ext: "jpg",
  };
}
