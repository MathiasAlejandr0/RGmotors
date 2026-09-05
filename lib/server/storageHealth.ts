/**
 * En Vercel Production, KV es obligatorio para no perder inventario/leads.
 * En local/preview se permite filesystem.
 */
export function isVercelProduction(): boolean {
  return process.env.VERCEL_ENV === "production";
}

export function isKvReady(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export function isBlobReady(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function assertProductionStorage(): { ok: boolean; warnings: string[] } {
  const warnings: string[] = [];
  if (!isVercelProduction()) {
    return { ok: true, warnings };
  }
  if (!isKvReady()) {
    warnings.push(
      "KV_REST_API_URL/TOKEN ausentes: inventario y leads pueden perderse entre deploys.",
    );
  }
  if (!isBlobReady()) {
    warnings.push(
      "BLOB_READ_WRITE_TOKEN ausente: fotos/360 en disco de Vercel son efímeras. Usa Blob o R2.",
    );
  }
  return { ok: isKvReady(), warnings };
}

export function logStorageHealthOnce(): void {
  const g = globalThis as typeof globalThis & { __rgStorageLogged?: boolean };
  if (g.__rgStorageLogged) return;
  g.__rgStorageLogged = true;
  const health = assertProductionStorage();
  for (const w of health.warnings) {
    console.warn(`[RG Storage] ${w}`);
  }
  if (health.ok && isVercelProduction()) {
    console.info("[RG Storage] KV OK — persistencia durable habilitada.");
  }
}
