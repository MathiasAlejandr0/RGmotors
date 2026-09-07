import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import os from "node:os";
import { kv } from "@vercel/kv";
import { isKvReady, isVercelProduction, logStorageHealthOnce } from "@/lib/server/storageHealth";

// Usamos data local si es escribible, o tmpdir en entornos serverless/Vercel
const LOCAL_DIR = join(process.cwd(), "data");
const TMP_DIR = os.tmpdir() + "/rgmotors_data";

function getPossiblePaths(filename: string) {
  return [join(LOCAL_DIR, filename), join(TMP_DIR, filename)];
}

const isKvConfigured = () => isKvReady();

/**
 * Lee un archivo JSON de forma segura.
 * En desarrollo prioriza data/ local para no pisar el stock nuevo con KV viejo.
 * Si el archivo no existe, devuelve `fallback` y lo almacena.
 */
export async function readJson<T>(filename: string, fallback: T): Promise<T> {
  logStorageHealthOnce();

  const preferLocal =
    process.env.NODE_ENV !== "production" || process.env.RG_PREFER_LOCAL_DATA === "1";

  // 1. En local/dev: leer primero el archivo del proyecto
  if (preferLocal) {
    const localPath = join(LOCAL_DIR, filename);
    try {
      if (existsSync(localPath)) {
        const content = await readFile(localPath, "utf8");
        return JSON.parse(content) as T;
      }
    } catch (error) {
      console.warn(`Error leyendo local ${filename}:`, error);
    }
  }

  // 2. Vercel KV
  if (isKvConfigured()) {
    try {
      const data = await kv.get<T>(filename);
      if (data !== null) {
        return data;
      }
    } catch (error) {
      console.warn(`Error leyendo ${filename} de Vercel KV:`, error);
    }
  } else if (isVercelProduction()) {
    console.error(
      `[RG Storage] Lectura de ${filename} sin KV en producción — datos pueden ser inconsistentes.`,
    );
  }

  // 3. Fallback a archivos locales (tmp / data)
  const paths = getPossiblePaths(filename);

  for (const p of paths) {
    try {
      if (existsSync(p)) {
        const content = await readFile(p, "utf8");
        const parsed = JSON.parse(content) as T;

        // Sincronizar hacia KV solo si no había dato remoto
        if (isKvConfigured() && !preferLocal) {
          await kv.set(filename, parsed).catch(() => console.warn("Error migrando a KV"));
        }

        return parsed;
      }
    } catch {
      // Intenta la siguiente ruta
    }
  }

  // Si no existe en ningún lado, guardamos en memoria y tratamos de escribir
  await writeJson(filename, fallback);
  return fallback;
}

/**
 * Escribe un archivo JSON de forma segura.
 */
export async function writeJson<T>(filename: string, data: T): Promise<boolean> {
  logStorageHealthOnce();

  if (isVercelProduction() && !isKvConfigured()) {
    console.error(
      `[RG Storage] Rechazando escritura de ${filename}: KV obligatorio en Vercel Production.`,
    );
    return false;
  }

  let kvSuccess = false;
  if (isKvConfigured()) {
    try {
      await kv.set(filename, data);
      kvSuccess = true;
    } catch (error) {
      console.warn(`Error escribiendo ${filename} en Vercel KV:`, error);
    }
  }

  const paths = getPossiblePaths(filename);
  for (const p of paths) {
    try {
      const dir = p.endsWith(filename) ? p.slice(0, -filename.length) : LOCAL_DIR;
      await mkdir(dir, { recursive: true });
      await writeFile(p, JSON.stringify(data, null, 2), "utf8");
      return true; // Éxito local
    } catch {
      // Si falla, intenta en la siguiente ruta (ej. tmpdir)
    }
  }

  return kvSuccess;
}
