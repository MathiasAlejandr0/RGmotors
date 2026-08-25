import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import os from "node:os";

// Usamos data local si es escribible, o tmpdir en entornos serverless/Vercel
const LOCAL_DIR = join(process.cwd(), "data");
const TMP_DIR = join(os.tmpdir(), "rgmotors_data");

const memoryCache = new Map<string, unknown>();

function getPossiblePaths(filename: string) {
  return [join(LOCAL_DIR, filename), join(TMP_DIR, filename)];
}

/**
 * Lee un archivo JSON de forma segura.
 * Si el archivo no existe, devuelve `fallback` y lo almacena.
 */
export async function readJson<T>(filename: string, fallback: T): Promise<T> {
  if (memoryCache.has(filename)) {
    return memoryCache.get(filename) as T;
  }

  const paths = getPossiblePaths(filename);

  for (const p of paths) {
    try {
      if (existsSync(p)) {
        const content = await readFile(p, "utf8");
        const parsed = JSON.parse(content) as T;
        memoryCache.set(filename, parsed);
        return parsed;
      }
    } catch {
      // Intenta la siguiente ruta
    }
  }

  // Si no existe en ningún lado, guardamos en memoria y tratamos de escribir
  memoryCache.set(filename, fallback);
  await writeJson(filename, fallback).catch(() => {});
  return fallback;
}

/**
 * Escribe un archivo JSON de forma segura y actualiza el caché en memoria.
 */
export async function writeJson<T>(filename: string, data: T): Promise<boolean> {
  memoryCache.set(filename, data);

  const paths = getPossiblePaths(filename);

  for (const p of paths) {
    try {
      const dir = p.endsWith(filename) ? p.slice(0, -filename.length) : LOCAL_DIR;
      await mkdir(dir, { recursive: true });
      await writeFile(p, JSON.stringify(data, null, 2), "utf8");
      return true;
    } catch {
      // Continúa intentando con tmp si el primero falla
    }
  }

  return true;
}
