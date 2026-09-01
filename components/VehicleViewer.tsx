"use client";

import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";
import PhotoSpin360 from "./PhotoSpin360";

type Tab = "exterior" | "fotos";

export default function VehicleViewer({
  image,
  gallery = [],
  name,
  slug,
  spinFrames = [],
}: {
  image: string;
  gallery?: string[];
  name: string;
  slug?: string;
  spinFrames?: string[];
}) {
  const [frames, setFrames] = useState<string[]>(spinFrames);
  const [galleryImages, setGalleryImages] = useState<string[]>(
    gallery.length > 0 ? gallery : [image]
  );
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const hasSpin = frames.length > 0;
  const [tab, setTab] = useState<Tab>(hasSpin ? "exterior" : "fotos");

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    // Cargar fotogramas 360 si existen
    fetch(asset(`/cars/spin/${slug}/manifest.json`), { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((m) => {
        if (cancelled || !m || !m.count) return;
        const bust = m.updatedAt
          ? `?v=${encodeURIComponent(m.updatedAt)}`
          : `?v=${Date.now()}`;
        const newFrames = Array.from(
          { length: m.count },
          (_, i) =>
            asset(
              `/cars/spin/${slug}/${String(i + 1).padStart(3, "0")}.jpg`
            ) + bust
        );
        setFrames(newFrames);
      })
      .catch(() => {});

    // Load more organic photos if available from API (merging with existing gallery)
    fetch(`/api/photos?slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        if (data.gallery && data.gallery.length > 0) {
          const urls = data.gallery.map((g: { url: string }) => g.url);
          const all = Array.from(new Set([...galleryImages, ...urls]));
          setGalleryImages(all);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [slug, image]);

  const currentPhoto = galleryImages[selectedPhotoIdx] || image;

  const handlePrevPhoto = () => {
    setSelectedPhotoIdx((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  const handleNextPhoto = () => {
    setSelectedPhotoIdx((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="space-y-3">
      {/* Header controls: Only show 360 tab toggle if spin exists */}
      {hasSpin ? (
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur-xl shadow-sm">
            <button
              onClick={() => setTab("fotos")}
              className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-xs font-semibold tracking-tight transition-all duration-200 ${
                tab === "fotos"
                  ? "bg-brand-500 text-white shadow-glow"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>🖼️</span>
              <span>Galería de Fotos ({galleryImages.length})</span>
            </button>
            <button
              onClick={() => setTab("exterior")}
              className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-xs font-semibold tracking-tight transition-all duration-200 ${
                tab === "exterior"
                  ? "bg-brand-500 text-white shadow-glow"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>🔄</span>
              <span>Tour 360°</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-brand-300/80 bg-brand-500/10 border border-brand-500/20 px-3 py-1.5 rounded-full">
            <span>✨</span> Interactivo disponible
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-md">
            <span className="text-sm">📸</span>
            <span className="text-xs font-semibold text-white">
              Galería de Fotos Reales · {selectedPhotoIdx + 1} de {galleryImages.length}
            </span>
          </div>

          <span className="text-xs font-medium text-white/50 hidden sm:inline-block">
            Inspección RG Motors · Puerto Montt
          </span>
        </div>
      )}

      {/* Main Image / Viewer Frame */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/15 bg-[#080b11] shadow-2xl sm:aspect-[16/10] group">
        {tab === "exterior" && hasSpin ? (
          <PhotoSpin360 frames={frames} className="h-full w-full" autoPlay={false} />
        ) : (
          <div className="relative h-full w-full select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset(currentPhoto)}
              alt={`${name} - Foto ${selectedPhotoIdx + 1}`}
              onError={(e) => {
                const fallback = asset("/cars/ford-raptor-2023.jpg");
                if (e.currentTarget.src !== fallback) {
                  e.currentTarget.src = fallback;
                }
              }}
              className="h-full w-full object-contain sm:object-cover transition-all duration-300 bg-black/40"
            />

            {/* Navigation Arrows for Gallery */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevPhoto}
                  aria-label="Foto anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/65 text-white/90 backdrop-blur-md transition-all hover:bg-black/90 hover:scale-110 active:scale-95 z-20 text-lg font-bold"
                >
                  ‹
                </button>
                <button
                  onClick={handleNextPhoto}
                  aria-label="Foto siguiente"
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/65 text-white/90 backdrop-blur-md transition-all hover:bg-black/90 hover:scale-110 active:scale-95 z-20 text-lg font-bold"
                >
                  ›
                </button>
              </>
            )}

            {/* Photo Counter Pill */}
            <div className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-black/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md z-10">
              Foto {selectedPhotoIdx + 1} / {galleryImages.length}
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {galleryImages.length > 1 && tab === "fotos" && (
        <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-white/20">
          {galleryImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPhotoIdx(idx)}
              className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl border transition-all duration-200 ${
                selectedPhotoIdx === idx
                  ? "border-brand-400 ring-2 ring-brand-400/50 scale-105"
                  : "border-white/15 opacity-60 hover:opacity-100 hover:border-white/40"
              }`}
              aria-label={`Ver foto ${idx + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset(img)}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
