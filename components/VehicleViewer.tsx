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
    gallery.length > 0 ? gallery : [image],
  );
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [spinEnabled, setSpinEnabled] = useState(true);
  const hasSpin = spinEnabled && frames.length > 0;
  const [tab, setTab] = useState<Tab>(hasSpin ? "exterior" : "fotos");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const prefs = data.preferences || data.settings?.preferences;
        if (prefs && typeof prefs.showSpin360 === "boolean") {
          setSpinEnabled(prefs.showSpin360);
          if (!prefs.showSpin360) setTab("fotos");
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    // Manifest 360 (CDN-friendly)
    fetch(asset(`/cars/spin/${slug}/manifest.json`))
      .then((r) => (r.ok ? r.json() : null))
      .then((m) => {
        if (cancelled || !m || !m.count) return;
        if (Array.isArray(m.frames) && m.frames.length > 0) {
          setFrames(m.frames);
          return;
        }
        const bust = m.updatedAt
          ? `?v=${encodeURIComponent(m.updatedAt)}`
          : `?v=${Date.now()}`;
        const newFrames = Array.from(
          { length: m.count },
          (_, i) =>
            asset(`/cars/spin/${slug}/${String(i + 1).padStart(3, "0")}.jpg`) +
            bust,
        );
        setFrames(newFrames);
      })
      .catch(() => {});

    fetch(`/api/photos?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        if (data.gallery && data.gallery.length > 0) {
          const urls = data.gallery.map((g: { url: string }) => g.url);
          setGalleryImages((prev) => Array.from(new Set([...prev, ...urls])));
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [slug, image]);

  useEffect(() => {
    if (hasSpin && tab === "exterior") return;
    if (!hasSpin && tab === "exterior") setTab("fotos");
  }, [hasSpin, tab]);

  const currentPhoto = galleryImages[selectedPhotoIdx] || image;

  const handlePrevPhoto = () => {
    setSelectedPhotoIdx((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1,
    );
  };

  const handleNextPhoto = () => {
    setSelectedPhotoIdx((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <div className="space-y-3">
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
              <span>Tour 360°</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-brand-300/80 bg-brand-500/10 border border-brand-500/20 px-3 py-1.5 rounded-full">
            Interactivo disponible
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-md">
            <span className="text-xs font-semibold text-white">
              Galería · {selectedPhotoIdx + 1} de {galleryImages.length}
            </span>
          </div>

          <span className="text-xs font-medium text-white/50 hidden sm:inline-block">
            Inspección RG Motors · Puerto Montt
          </span>
        </div>
      )}

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/15 bg-[#080b11] shadow-2xl sm:aspect-[16/10] group">
        {tab === "exterior" && hasSpin ? (
          <PhotoSpin360 frames={frames} className="h-full w-full" autoPlay={false} />
        ) : (
          <div className="relative h-full w-full select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset(currentPhoto)}
              alt={`${name} - Foto ${selectedPhotoIdx + 1}`}
              loading="eager"
              decoding="async"
              onError={(e) => {
                const fallback = asset("/images/placeholder-pending-car.svg");
                if (e.currentTarget.src !== fallback) {
                  e.currentTarget.src = fallback;
                }
              }}
              className="h-full w-full object-contain sm:object-cover transition-all duration-300 bg-black/40"
            />

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
          </div>
        )}
      </div>

      {tab === "fotos" && galleryImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {galleryImages.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setSelectedPhotoIdx(i)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border transition ${
                i === selectedPhotoIdx
                  ? "border-brand-400 ring-1 ring-brand-400/40"
                  : "border-white/10 opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset(src)}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
