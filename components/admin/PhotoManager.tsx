"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { vehicles, Vehicle } from "@/lib/vehicles";
import { asset } from "@/lib/asset";
import PhotoSpin360 from "@/components/PhotoSpin360";
import SpinUploader from "@/components/admin/SpinUploader";

type PhotoItem = {
  name: string;
  url: string;
  size: number;
  isCover?: boolean;
};

type SubTab = "gallery" | "spin" | "video" | "guide";

export default function PhotoManager({ initialSlug }: { initialSlug?: string }) {
  const [vehiclesData, setVehiclesData] = useState<Vehicle[]>(vehicles);
  const [selectedSlug, setSelectedSlug] = useState<string>(initialSlug || vehiclesData[0]?.slug || "");
  const [activeTab, setActiveTab] = useState<SubTab>("gallery");
  const [searchCar, setSearchCar] = useState("");

  useEffect(() => {
    fetch("/api/vehicles?admin=true")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.vehicles) {
          setVehiclesData(data.vehicles);
          if (!initialSlug && data.vehicles.length > 0) {
            setSelectedSlug(data.vehicles[0].slug);
          }
        }
      })
      .catch(console.error);
  }, [initialSlug]);

  // Staged files (pre-upload)
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [uploadType, setUploadType] = useState<"gallery" | "cover">("gallery");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Existing uploaded photos
  const [gallery, setGallery] = useState<PhotoItem[]>([]);
  const [spinCount, setSpinCount] = useState<number>(0);
  const [coverImage, setCoverImage] = useState<string>("");
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);

  // Preview Modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const spinInputRef = useRef<HTMLInputElement>(null);

  const selectedVehicle = vehiclesData.find((v) => v.slug === selectedSlug) || vehiclesData[0] || {
    slug: "",
    plate: "SIN PLACA",
    brand: "Vehículo",
    model: "",
    version: "",
    year: 2024,
    image: "/images/placeholder-pending-car.svg"
  };

  const fetchPhotos = useCallback(async (slug: string) => {
    if (!slug) return;
    setIsLoadingPhotos(true);
    try {
      const res = await fetch(`/api/photos?slug=${encodeURIComponent(slug)}`);
      if (res.ok) {
        const data = await res.json();
        setGallery(data.gallery || []);
        setSpinCount(data.spinCount || 0);
        setCoverImage(data.coverImage || "");
      }
    } catch {
      /* ignore */
    } finally {
      setIsLoadingPhotos(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSlug) {
      fetchPhotos(selectedSlug);
      setStagedFiles([]);
      setUploadSuccess(null);
      setUploadError(null);
    }
  }, [selectedSlug, fetchPhotos]);

  const handleFilesChosen = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const valid = Array.from(files).filter((f) =>
      /\.(jpe?g|png|webp|avif)$/i.test(f.name)
    );
    if (valid.length === 0) {
      setUploadError("Por favor selecciona imágenes válidas (JPG, PNG, WebP).");
      return;
    }
    setUploadError(null);
    setStagedFiles((prev) => [...prev, ...valid]);
  };

  const removeStagedFile = (idx: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Upload staged photos
  const handleUploadGallery = async () => {
    if (stagedFiles.length === 0 || !selectedSlug) return;
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const fd = new FormData();
    fd.append("slug", selectedSlug);
    fd.append("type", uploadType);
    for (const f of stagedFiles) {
      fd.append("files", f);
    }

    try {
      const res = await fetch("/api/photos", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Error al subir las imágenes.");
      }
      setUploadSuccess(data.message || "¡Fotos subidas con éxito!");
      setStagedFiles([]);
      await fetchPhotos(selectedSlug);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsUploading(false);
    }
  };

  // Upload 360 Spin Frames
  const handleUploadSpinFrames = async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedSlug) return;
    const valid = Array.from(files).filter((f) => /\.(jpe?g|png|webp)$/i.test(f.name));
    if (valid.length === 0) {
      setUploadError("Selecciona fotogramas JPG/PNG válidos.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const fd = new FormData();
    fd.append("slug", selectedSlug);
    fd.append("type", "spin");
    for (const f of valid) {
      fd.append("files", f);
    }

    try {
      const res = await fetch("/api/photos", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Error al subir los fotogramas 360°.");
      }
      setUploadSuccess(`¡${valid.length} fotogramas 360° guardados correctamente!`);
      await fetchPhotos(selectedSlug);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsUploading(false);
    }
  };

  // Delete an existing photo
  const handleDeletePhoto = async (filename: string, type: "gallery" | "spin" = "gallery") => {
    if (!confirm(`¿Eliminar esta foto (${filename})?`)) return;
    try {
      const res = await fetch("/api/photos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: selectedSlug, filename, type }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPhotos(selectedSlug);
      } else {
        alert(data.error || "No se pudo eliminar la foto.");
      }
    } catch {
      alert("Error al intentar eliminar.");
    }
  };

  // Set a photo as the cover image (primera foto del auto)
  const handleSetAsCover = async (url: string) => {
    try {
      const res = await fetch("/api/photos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: selectedSlug, action: "set_cover", coverUrl: url }),
      });
      const data = await res.json();
      if (data.success) {
        setUploadSuccess("¡Portada principal actualizada correctamente!");
        fetchPhotos(selectedSlug);
      } else {
        alert(data.error || "No se pudo actualizar la portada.");
      }
    } catch {
      alert("Error de conexión al actualizar la portada.");
    }
  };

  // Reorder photos in the gallery (mover hacia la izquierda o derecha)
  const handleMovePhoto = async (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= gallery.length) return;

    const newGallery = [...gallery];
    const temp = newGallery[index];
    newGallery[index] = newGallery[targetIdx];
    newGallery[targetIdx] = temp;

    setGallery(newGallery);

    try {
      const urls = newGallery.map(g => `/cars/uploads/${selectedSlug}/${g.name}`);
      const res = await fetch("/api/photos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: selectedSlug, action: "reorder", gallery: urls }),
      });
      const data = await res.json();
      if (!data.success) {
        fetchPhotos(selectedSlug); // revert on failure
      }
    } catch {
      fetchPhotos(selectedSlug);
    }
  };

  // Sincronizar fotos desde carpetas locales en Windows
  const handleSyncLocal = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await fetch("/api/photos/sync-local", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSyncStatus(data.message);
        fetchPhotos(selectedSlug);
      } else {
        setSyncStatus("Error: " + (data.error || "No se pudo sincronizar"));
      }
    } catch (e: any) {
      setSyncStatus("Error de red: " + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredVehicles = vehiclesData.filter((v) => {
    if (!searchCar) return true;
    const q = searchCar.toLowerCase();
    return (
      (v.plate || "").toLowerCase().includes(q) ||
      v.brand.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Selector de Vehículo y Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-ink-800/60 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset(coverImage || selectedVehicle.image)}
            alt={selectedVehicle.model}
            className="h-16 w-24 rounded-xl border border-white/10 object-cover shadow-md bg-ink-950"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-brand-500/20 border border-brand-500/40 px-2 py-0.5 text-xs font-extrabold tracking-wider text-brand-300">
                {selectedVehicle.plate || "SIN PLACA"}
              </span>
              <span className="text-[11px] text-white/50">{selectedVehicle.location}</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-0.5">
              {selectedVehicle.brand} {selectedVehicle.model} · {selectedVehicle.year}
            </h2>
            <p className="text-xs text-white/50">{selectedVehicle.version}</p>
          </div>
        </div>

        {/* Buscador y Selector rápido */}
        <div className="w-full md:w-80 space-y-1.5">
          <label className="block text-xs font-medium text-white/70">
            Buscar vehículo (78 en stock):
          </label>
          <input
            type="text"
            placeholder="Filtrar por patente o modelo..."
            value={searchCar}
            onChange={(e) => setSearchCar(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-ink-900 px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-brand-500"
          />
          <select
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-ink-900 px-3 py-2 text-xs font-semibold text-white outline-none transition focus:border-brand-500"
          >
            {filteredVehicles.map((v) => (
              <option key={v.slug} value={v.slug}>
                [{v.plate || "S/P"}] {v.brand} {v.model} ({v.year})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Barra de herramientas y Sincronización Local */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs">
        <div className="flex items-center gap-2 text-white/70">
          <span>📁</span>
          <span>Carpeta en Windows:</span>
          <code className="rounded bg-black/40 px-2 py-0.5 text-[11px] text-brand-300">
            public\cars\uploads\{selectedSlug}
          </code>
        </div>
        <button
          onClick={handleSyncLocal}
          disabled={isSyncing}
          className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-500 transition disabled:opacity-50"
        >
          <span>{isSyncing ? "⚙️" : "🔄"}</span>
          {isSyncing ? "Escaneando..." : "Sincronizar carpetas locales"}
        </button>
      </div>

      {syncStatus && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-300">
          ✓ {syncStatus}
        </div>
      )}

      {/* Tabs de Modo de Subida */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab("gallery")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "gallery"
              ? "bg-brand-500 text-white shadow-glow"
              : "bg-ink-800/60 text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          <span>🖼️</span> Galería y Fotos ({gallery.length})
        </button>
        <button
          onClick={() => setActiveTab("spin")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "spin"
              ? "bg-brand-500 text-white shadow-glow"
              : "bg-ink-800/60 text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          <span>🔄</span> Fotogramas 360° ({spinCount > 0 ? `${spinCount} fotos` : "Sin 360"})
        </button>
        <button
          onClick={() => setActiveTab("guide")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "guide"
              ? "bg-brand-500 text-white shadow-glow"
              : "bg-ink-800/60 text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          <span>📋</span> Guía de Tomas Recomendadas
        </button>
      </div>

      {/* TAB 1: GALERÍA DE FOTOS */}
      {activeTab === "gallery" && (
        <div className="grid gap-6 lg:grid-cols-[1.05fr_1.2fr]">
          {/* Zona de Subida y Arrastre */}
          <div className="space-y-4 rounded-2xl border border-white/10 bg-ink-800/60 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Subir fotos del vehículo</h3>
                <p className="text-xs text-white/50">
                  Arrastra las fotos aquí o selecciónalas de tu equipo.
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-ink-900 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setUploadType("gallery")}
                  className={`rounded-md px-2.5 py-1 transition ${
                    uploadType === "gallery"
                      ? "bg-brand-500 text-white font-medium"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  Galería
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType("cover")}
                  className={`rounded-md px-2.5 py-1 transition ${
                    uploadType === "cover"
                      ? "bg-brand-500 text-white font-medium"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  Portada (1ª foto)
                </button>
              </div>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFilesChosen(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
                isDragging
                  ? "border-brand-400 bg-brand-500/15"
                  : "border-white/15 bg-ink-900/50 hover:border-brand-500/50 hover:bg-ink-900"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={(e) => handleFilesChosen(e.target.files)}
              />
              <div className="mb-2 grid h-12 w-12 place-items-center rounded-full bg-brand-500/20 text-2xl text-brand-300">
                📥
              </div>
              <p className="text-sm font-medium text-white">
                Arrastra las fotos aquí o <span className="text-brand-400 underline">haz clic para explorar</span>
              </p>
              <p className="mt-1 text-xs text-white/40">
                Selección múltiple admitida · JPG, PNG o WebP (hasta 20MB cada una)
              </p>
            </div>

            {/* Mensajes de Alerta */}
            {uploadError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                ❌ {uploadError}
              </div>
            )}
            {uploadSuccess && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300">
                ✓ {uploadSuccess}
              </div>
            )}

            {/* Cola de archivos seleccionados (Staged) */}
            {stagedFiles.length > 0 && (
              <div className="space-y-3 rounded-xl border border-white/10 bg-ink-900/60 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/70">
                    {stagedFiles.length} {stagedFiles.length === 1 ? "foto lista" : "fotos listas"} para subir:
                  </span>
                  <button
                    onClick={() => setStagedFiles([])}
                    className="text-xs text-white/40 hover:text-red-400"
                  >
                    Limpiar selección
                  </button>
                </div>

                <div className="grid max-h-44 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
                  {stagedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="group relative flex items-center gap-2 rounded-lg border border-white/10 bg-ink-800 p-2 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-white/90">{file.name}</p>
                        <p className="text-[10px] text-white/40">{formatBytes(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeStagedFile(idx);
                        }}
                        className="grid h-5 w-5 place-items-center rounded bg-white/10 text-white/60 hover:bg-red-500/20 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={isUploading}
                  onClick={handleUploadGallery}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:opacity-50 shadow-glow"
                >
                  {isUploading ? (
                    <>
                      <span className="animate-spin text-lg">⚙</span> Subiendo fotos al servidor...
                    </>
                  ) : (
                    <>
                      <span>🚀</span> Guardar {stagedFiles.length} {stagedFiles.length === 1 ? "foto" : "fotos"} en el vehículo
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Galería de fotos subidas con Ordenamiento y Portada */}
          <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Fotos en el catálogo</h3>
                <p className="text-xs text-white/50">
                  {gallery.length} fotos guardadas · La primera foto o la marcada como ⭐ es la portada
                </p>
              </div>
              <button
                onClick={() => fetchPhotos(selectedSlug)}
                className="rounded-lg border border-white/10 bg-ink-900 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5 hover:text-white"
              >
                🔄 Refrescar
              </button>
            </div>

            {isLoadingPhotos ? (
              <div className="grid h-48 place-items-center rounded-xl bg-ink-900/50 text-xs text-white/40">
                Cargando fotos del vehículo...
              </div>
            ) : gallery.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-ink-900/50 p-8 text-center">
                <span className="text-4xl">📸</span>
                <p className="mt-2 text-sm font-medium text-white/70">Aún no hay fotos subidas para este vehículo</p>
                <p className="mt-1 max-w-xs text-xs text-white/40">
                  Usa el panel de la izquierda para subir las fotos reales o arrástralas a la carpeta local.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gallery.map((photo, idx) => {
                  const isCover = photo.isCover || (coverImage && coverImage.includes(photo.name)) || idx === 0;
                  return (
                    <div
                      key={photo.name}
                      className={`group relative flex flex-col overflow-hidden rounded-xl border transition ${
                        isCover
                          ? "border-brand-400 bg-brand-500/10 shadow-glow"
                          : "border-white/10 bg-ink-900"
                      }`}
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />

                        {isCover && (
                          <span className="absolute left-2 top-2 rounded-md bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white shadow z-10">
                            ⭐ PORTADA
                          </span>
                        )}

                        <span className="absolute right-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-mono text-white/80 z-10">
                          #{idx + 1}
                        </span>

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 backdrop-blur-sm transition group-hover:opacity-100 z-20">
                          <button
                            type="button"
                            onClick={() => setPreviewImage(photo.url)}
                            title="Ver en grande"
                            className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm text-white hover:bg-white/30 hover:scale-110 transition"
                          >
                            🔍
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(photo.name, "gallery")}
                            title="Eliminar foto"
                            className="grid h-8 w-8 place-items-center rounded-full bg-red-500/80 text-sm text-white hover:bg-red-500 hover:scale-110 transition"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Barra de Control de Orden y Portada */}
                      <div className="flex items-center justify-between border-t border-white/10 bg-ink-950/80 px-2 py-1.5 text-[10px]">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMovePhoto(idx, -1)}
                            title="Mover antes en la galería"
                            className="rounded bg-white/10 px-1.5 py-0.5 font-bold text-white hover:bg-brand-500 disabled:opacity-20 transition"
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            disabled={idx === gallery.length - 1}
                            onClick={() => handleMovePhoto(idx, 1)}
                            title="Mover después en la galería"
                            className="rounded bg-white/10 px-1.5 py-0.5 font-bold text-white hover:bg-brand-500 disabled:opacity-20 transition"
                          >
                            →
                          </button>
                        </div>

                        {!isCover ? (
                          <button
                            type="button"
                            onClick={() => handleSetAsCover(photo.url)}
                            className="text-brand-300 hover:text-white font-semibold underline"
                          >
                            Poner Portada
                          </button>
                        ) : (
                          <span className="text-emerald-400 font-bold">Principal</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FOTOGRAMAS 360° MANUALES */}
      {activeTab === "spin" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-4 rounded-2xl border border-white/10 bg-ink-800/60 p-5">
            <h3 className="font-semibold text-white">Subir fotogramas 360° directos</h3>
            <p className="text-xs text-white/50">
              Si tienes fotos individuales de la vuelta 360° (ej: 001.jpg, 002.jpg ... 024.jpg),
              súbelas aquí para activar el giro interactivo.
            </p>

            <div
              onClick={() => spinInputRef.current?.click()}
              className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-ink-900/50 p-6 text-center transition hover:border-brand-500 hover:bg-ink-900"
            >
              <input
                ref={spinInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleUploadSpinFrames(e.target.files)}
              />
              <span className="text-3xl">🔄</span>
              <p className="mt-2 text-sm font-medium text-white">
                Haz clic para elegir los fotogramas 360°
              </p>
              <p className="text-xs text-white/40">Se ordenarán automáticamente y crearán el giro interactivo.</p>
            </div>

            {isUploading && (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-brand-500/10 p-3 text-xs text-brand-300">
                <span className="animate-spin">⚙</span> Guardando fotogramas 360° en el servidor...
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-5">
            <h3 className="font-semibold text-white mb-2">Visor 360° en Vivo</h3>
            {spinCount > 0 ? (
              <PhotoSpin360
                frames={Array.from({ length: spinCount }, (_, i) => `/cars/spin/${selectedSlug}/${String(i + 1).padStart(3, "0")}.jpg`)}
              />
            ) : (
              <div className="grid h-64 place-items-center rounded-xl border border-white/10 bg-ink-900/50 text-xs text-white/40">
                Este vehículo aún no tiene fotogramas 360° cargados.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: GUÍA DE FOTOS RECOMENDADAS */}
      {activeTab === "guide" && (
        <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">📸 Guía Oficial de Tomas Fotográficas para RG Motors</h3>
            <p className="text-xs text-white/50 mt-1">
              Sigue esta secuencia estándar para lograr que el catálogo transmita máxima confianza y profesionalismo:
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 p-4 space-y-2">
              <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">1. PORTADA</span>
              <h4 className="font-bold text-sm text-white">3/4 Frontal Exterior</h4>
              <p className="text-xs text-white/70">
                Ángulo frontal en 45°, mostrando la parrilla, focos delanteros y el lateral completo. Con las ruedas ligeramente giradas hacia la cámara.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-ink-900 p-4 space-y-2">
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/70">2. EXTERIOR</span>
              <h4 className="font-bold text-sm text-white">Lateral & Trasera</h4>
              <p className="text-xs text-white/70">
                Foto lateral perpendicular (perfil completo) y 3/4 trasera mostrando portalón, luces traseras y escape/pick-up.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-ink-900 p-4 space-y-2">
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/70">3. INTERIOR</span>
              <h4 className="font-bold text-sm text-white">Tablero & Kilometraje</h4>
              <p className="text-xs text-white/70">
                Foto desde el asiento trasero mostrando el tablero entero, volante y consola. Foto de cerca del tacómetro con el kilometraje encendido.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-ink-900 p-4 space-y-2">
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/70">4. DETALLES</span>
              <h4 className="font-bold text-sm text-white">Motor, Ruedas & Asientos</h4>
              <p className="text-xs text-white/70">
                Vano motor limpio, estado de los neumáticos/llantas y tapicería de asientos delanteros y traseros.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewImage}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain border border-white/20"
          />
        </div>
      )}
    </div>
  );
}
