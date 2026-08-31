"use client";

import { useState, useRef } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function DriveSyncModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [syncStats, setSyncStats] = useState<{ totalFolders?: number; syncedVehicles?: number; newPhotos?: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDriveSync = async () => {
    setLoading(true);
    setMessage("Analizando carpetas de Google Drive y sincronizando fotos...");
    setError(null);
    setSyncStats(null);

    try {
      const res = await fetch("/api/sync-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error durante la sincronización.");

      setMessage(data.message || "¡Sincronización completada con éxito!");
      setSyncStats({
        totalFolders: data.totalFolders,
        syncedVehicles: data.syncedVehicles,
        newPhotos: data.newPhotosDownloaded,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al conectar con Google Drive.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadExcel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    setMessage("Procesando archivo Excel y actualizando precios...");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/sync-drive", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al procesar el Excel.");

      setMessage(data.message || "¡Excel importado correctamente!");
      setSelectedFile(null);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al importar el archivo Excel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl border border-white/15 bg-ink-900 p-6 shadow-2xl space-y-5 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🔄</span> Sincronizador Google Drive & Excel
            </h3>
            <p className="text-xs text-white/50">
              Carga automática de fotos y catálogo de RG Motors
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Status Alerts */}
        {message && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
            <p className="font-semibold">{message}</p>
            {syncStats && (
              <div className="mt-2 flex gap-4 text-[11px] text-emerald-200">
                <span>📁 Carpetas: <b>{syncStats.totalFolders}</b></span>
                <span>🚗 Vehículos: <b>{syncStats.syncedVehicles}</b></span>
                <span>📸 Nuevas fotos: <b>{syncStats.newPhotos}</b></span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Section 1: Google Drive Folders */}
        <div className="rounded-2xl border border-white/10 bg-ink-950 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">📁</span>
              <div>
                <p className="text-xs font-bold text-white">Carpetas Google Drive Conectadas</p>
                <p className="text-[11px] text-white/40">FOTOS RG Y UNIDADES CHILE + Catálogo</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
              🟢 Auto-Sync Activo (60 min)
            </span>
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5 text-[11px] text-blue-200">
            🛡️ <b>Modo 100% Solo Lectura:</b> Tus archivos y carpetas del Google Drive nunca se modifican ni se eliminan. Quedan intactos para uso interno de la empresa.
          </div>

          <button
            onClick={handleDriveSync}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-brand-400 bg-brand-500 px-4 py-2.5 text-xs font-bold text-white shadow-glow transition hover:bg-brand-400 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="animate-spin text-sm">⚙</span> Sincronizando fotos desde Google Drive…
              </>
            ) : (
              <>
                <span>⚡</span> Sincronizar Fotos desde Google Drive Ahora
              </>
            )}
          </button>
        </div>

        {/* Section 2: Excel / Spreadsheet Uploader */}
        <div className="rounded-2xl border border-white/10 bg-ink-950 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-base">📊</span>
            <div>
              <p className="text-xs font-bold text-white">Actualizar Precios & Stock con Excel (.xlsx / .csv)</p>
              <p className="text-[11px] text-white/40">Sube la planilla para actualizar precios, kilometrajes y versiones</p>
            </div>
          </div>

          <form onSubmit={handleUploadExcel} className="space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-xl border border-dashed border-white/20 bg-ink-900/50 p-4 text-center transition hover:border-brand-400/50 hover:bg-brand-500/5"
            >
              {selectedFile ? (
                <p className="text-xs font-bold text-brand-300">📄 {selectedFile.name} (Listo para importar)</p>
              ) : (
                <p className="text-xs text-white/60">
                  Haz clic para seleccionar tu archivo Excel <span className="text-brand-300 font-semibold">(.xlsx, .csv)</span>
                </p>
              )}
            </div>

            {selectedFile && (
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-400 disabled:opacity-50"
              >
                {loading ? "Importando planilla..." : "Importar y Actualizar Precios"}
              </button>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
