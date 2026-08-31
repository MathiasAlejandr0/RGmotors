import { syncCatalogFromDriveFolders } from "./driveSyncService";

const DEFAULT_DRIVE_URLS = [
  "https://drive.google.com/drive/folders/1zqX6z_sKWHjHyNoMlS_rtkkF6pK_FqVh?usp=sharing",
  "https://drive.google.com/drive/folders/1VQ6IHTjk5sJYjJckZY1kzeRJAI5d09Od?usp=sharing",
];

// Intervalo de sincronización automática: cada 60 minutos
const SYNC_INTERVAL_MS = 60 * 60 * 1000;

let isSyncing = false;
let lastSyncTime: Date | null = null;
let timerStarted = false;

export async function runAutoSync(): Promise<{ success: boolean; message: string }> {
  if (isSyncing) {
    return { success: false, message: "Una sincronización ya está en curso." };
  }

  isSyncing = true;
  console.log(`[AutoSync] [${new Date().toISOString()}] Iniciando sincronización automática con Google Drive (Modo Solo Lectura)...`);

  try {
    const result = await syncCatalogFromDriveFolders(DEFAULT_DRIVE_URLS);
    lastSyncTime = new Date();
    console.log(`[AutoSync] Sincronización exitosa: ${result.syncedVehicles} vehículos verificados, ${result.newPhotosDownloaded} fotos nuevas.`);
    return {
      success: true,
      message: `Sincronización completada. ${result.syncedVehicles} vehículos al día.`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    console.error("[AutoSync] Error durante la sincronización automática:", msg);
    return { success: false, message: msg };
  } finally {
    isSyncing = false;
  }
}

export function startAutoSyncScheduler() {
  console.log("[AutoSync] El programador local ha sido desactivado a favor de Vercel Cron Jobs.");
}

export function getAutoSyncStatus() {
  return {
    isSyncing,
    lastSyncTime: lastSyncTime ? lastSyncTime.toISOString() : null,
    intervalMinutes: SYNC_INTERVAL_MS / 60000,
    foldersConfigured: DEFAULT_DRIVE_URLS.length,
    mode: "Read-Only (Seguro / No modifica el Drive)",
  };
}
