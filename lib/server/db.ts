import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import os from "node:os";
import { kv } from "@vercel/kv";

// Usamos data local si es escribible, o tmpdir en entornos serverless/Vercel
const LOCAL_DIR = join(process.cwd(), "data");
const TMP_DIR = os.tmpdir() + "/rgmotors_data";



function getPossiblePaths(filename: string) {
  return [join(LOCAL_DIR, filename), join(TMP_DIR, filename)];
}

const useKV = () => Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

/**
 * Lee un archivo JSON de forma segura.
 * Si el archivo no existe, devuelve `fallback` y lo almacena.
 */
export async function readJson<T>(filename: string, fallback: T): Promise<T> {

  // 1. Intentar leer desde Vercel KV primero si está habilitado
  if (useKV()) {
    try {
      const data = await kv.get<T>(filename);
      if (data !== null) {
        return data;
      }
    } catch (error) {
      console.warn(`Error leyendo ${filename} de Vercel KV:`, error);
    }
  }

  // 2. Fallback a archivos locales
  const paths = getPossiblePaths(filename);

  for (const p of paths) {
    try {
      if (existsSync(p)) {
        const content = await readFile(p, "utf8");
        const parsed = JSON.parse(content) as T;
        memoryCache.set(filename, parsed);
        
        // Sincronizar hacia KV si está habilitado pero no lo tenía
        if (useKV()) {
           await kv.set(filename, parsed).catch(()=>console.warn("Error migrando a KV"));
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

  let kvSuccess = false;
  if (useKV()) {
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
