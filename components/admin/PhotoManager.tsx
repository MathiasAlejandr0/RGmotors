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

type SubTab = "gallery" | "spin" | "video";

export default function PhotoManager({ initialSlug }: { initialSlug?: string }) {
  const [vehiclesData, setVehiclesData] = useState<Vehicle[]>(vehicles);
  const [selectedSlug, setSelectedSlug] = useState<string>(initialSlug || vehiclesData[0]?.slug || "");
  const [activeTab, setActiveTab] = useState<SubTab>("gallery");

  useEffect(() => {
    fetch("/api/vehicles")
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

  // Existing uploaded photos
  const [gallery, setGallery] = useState<PhotoItem[]>([]);
  const [spinCount, setSpinCount] = useState<number>(0);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);

  // Preview Modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const spinInputRef = useRef<HTMLInputElement>(null);

  const selectedVehicle = vehiclesData.find((v) => v.slug === selectedSlug) || vehiclesData[0];

  const fetchPhotos = useCallback(async (slug: string) => {
    setIsLoadingPhotos(true);
    try {
      const res = await fetch(`/api/photos?slug=${encodeURIComponent(slug)}`);
      if (res.ok) {
        const data = await res.json();
        setGallery(data.gallery || []);
        setSpinCount(data.spinCount || 0);
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

  // Handle files selected via input or dropzone
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

  // Set a photo as the cover image
  const handleSetAsCover = async (url: string) => {
    try {
      const res = await fetch(`/api/vehicles/${selectedSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      });
      const data = await res.json();
      if (data.success) {
        // Optimistically update the UI
        fetchPhotos(selectedSlug);
      } else {
        alert(data.error || "No se pudo actualizar la portada.");
      }
    } catch {
      alert("Error de conexión al actualizar la portada.");
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const previewSpinFrames = spinCount > 0
    ? Array.from(
        { length: spinCount },
        (_, i) => `/cars/spin/${selectedSlug}/${String(i + 1).padStart(3, "0")}.jpg?v=${Date.now()}`
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Selector de Vehículo y Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-ink-800/60 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset(selectedVehicle.image)}
            alt={selectedVehicle.model}
            className="h-16 w-24 rounded-xl border border-white/10 object-cover shadow-md"
          />
          <div>
            <span className="text-xs uppercase tracking-wider text-brand-300">
              Vehículo Seleccionado
            </span>
            <h2 className="text-xl font-bold text-white">
              {selectedVehicle.brand} {selectedVehicle.model} · {selectedVehicle.year}
            </h2>
            <p className="text-xs text-white/50">{selectedVehicle.version}</p>
          </div>
        </div>

        <div className="w-full md:w-72">
          <label className="mb-1 block text-xs font-medium text-white/60">
            Cambiar vehículo para editar:
          </label>
          <select
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-ink-900 px-3.5 py-2.5 text-sm font-medium text-white outline-none transition focus:border-brand-500"
          >
            {vehiclesData.map((v) => (
              <option key={v.slug} value={v.slug}>
                {v.brand} {v.model} ({v.year})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs de Modo de Subida */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab("gallery")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            activeTab === "gallery"
              ? "bg-brand-500 text-white shadow-glow"
              : "bg-ink-800/60 text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          <span>🖼️</span> Galería y Fotos ({gallery.length})
        </button>
        <button
          onClick={() => setActiveTab("spin")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            activeTab === "spin"
              ? "bg-brand-500 text-white shadow-glow"
              : "bg-ink-800/60 text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          <span>🔄</span> Fotogramas 360° ({spinCount > 0 ? `${spinCount} fotos` : "Sin 360"})
        </button>
        <button
          onClick={() => setActiveTab("video")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            activeTab === "video"
              ? "bg-brand-500 text-white shadow-glow"
              : "bg-ink-800/60 text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          <span>🎥</span> Generar 360° desde Video (IA)
        </button>
      </div>

      {/* TAB 1: GALERÍA DE FOTOS */}
      {activeTab === "gallery" && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* Zona de Subida y Arrastre */}
          <div className="space-y-4 rounded-2xl border border-white/10 bg-ink-800/60 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Subir fotos del vehículo</h3>
                <p className="text-xs text-white/50">
                  Arrastra fotos aquí o haz clic para seleccionarlas de tu equipo.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-ink-900 p-1 text-xs">
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
                  Portada
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
                Admite selección múltiple · JPG, PNG o WebP (hasta 20MB cada una)
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
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <span className="animate-spin text-lg">⚙</span> Subiendo fotos al servidor...
                    </>
                  ) : (
                    <>
                      <span>🚀</span> Subir {stagedFiles.length} {stagedFiles.length === 1 ? "foto" : "fotos"} ahora
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Galería de fotos subidas */}
          <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Fotos en el catálogo</h3>
                <p className="text-xs text-white/50">
                  Imágenes guardadas para este vehículo ({gallery.length})
                </p>
              </div>
              <button
                onClick={() => fetchPhotos(selectedSlug)}
                className="rounded-lg border border-white/10 bg-ink-900 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5 hover:text-white"
              >
                🔄 Actualizar
              </button>
            </div>

            {isLoadingPhotos ? (
              <div className="grid h-48 place-items-center rounded-xl bg-ink-900/50 text-xs text-white/40">
                Cargando fotos del vehículo...
              </div>
            ) : gallery.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-ink-900/50 p-8 text-center">
                <span className="text-3xl">📷</span>
                <p className="mt-2 text-sm font-medium text-white/70">Aún no hay fotos subidas</p>
                <p className="mt-1 max-w-xs text-xs text-white/40">
                  Usa el recuadro de la izquierda para arrastrar y subir las fotos oficiales de este vehículo.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gallery.map((photo) => (
                  <div
                    key={photo.name}
                    className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-ink-900"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />

                    {photo.isCover && (
                      <span className="absolute left-2 top-2 rounded-md bg-brand-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
                        ⭐ Portada
                      </span>
                    )}

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
                      <button
                        onClick={() => handleSetAsCover(photo.url)}
                        title="Establecer como Portada"
                        className={`grid h-8 w-8 place-items-center rounded-full text-sm hover:scale-110 transition ${photo.isCover ? 'bg-brand-500 text-white' : 'bg-white/20 text-white hover:bg-brand-500/80'}`}
                      >
                        ⭐
                      </button>
                      <button
                        onClick={() => setPreviewImage(photo.url)}
                        title="Ver en grande"
                        className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm text-white hover:bg-white/30 hover:scale-110 transition"
                      >
                        🔍
                      </button>
                      <button
                        onClick={() => handleDeletePhoto(photo.name, "gallery")}
                        title="Eliminar foto"
                        className="grid h-8 w-8 place-items-center rounded-full bg-red-500/80 text-sm text-white hover:bg-red-500 hover:scale-110 transition"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
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
              Si ya tienes las fotos individuales de la vuelta 360° (ej: 001.jpg, 002.jpg ... 032.jpg),
              puedes subirlas todas juntas aquí.
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
            {uploadSuccess && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                ✓ {uploadSuccess}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-white">Visor interactivo de prueba</h3>
              <span className="rounded-full bg-brand-500/20 px-2.5 py-0.5 text-xs text-brand-300">
                {spinCount > 0 ? `${spinCount} fotogramas` : "Sin fotos 360"}
              </span>
            </div>

            {previewSpinFrames.length > 0 ? (
              <div className="aspect-[4/3] overflow-hidden rounded-xl border border-white/10">
                <PhotoSpin360 frames={previewSpinFrames} className="h-full w-full" />
              </div>
            ) : (
              <div className="grid aspect-[4/3] place-items-center rounded-xl border border-white/10 bg-ink-900 text-xs text-white/40">
                Sube los fotogramas para interactuar con el 360 aquí
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: GENERAR DESDE VIDEO */}
      {activeTab === "video" && (
        <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-5">
          <SpinUploader />
        </div>
      )}

      {/* Modal para ver foto en grande */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl border border-white/20 bg-ink-900 p-2">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-ink-950/80 text-lg text-white hover:bg-brand-500"
            >
              ✕
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage}
              alt="Vista previa"
              className="max-h-[80vh] w-auto rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
