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
    <div className="w-full min-w-0 max-w-full space-y-3 overflow-hidden">
      {hasSpin ? (
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur-xl shadow-sm">
            <button
              onClick={() => setTab("fotos")}
              className={`flex shrink-0 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold tracking-tight transition-all duration-200 sm:px-5 ${
                tab === "fotos"
                  ? "bg-brand-500 text-white shadow-glow"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>Galería ({galleryImages.length})</span>
            </button>
            <button
              onClick={() => setTab("exterior")}
              className={`flex shrink-0 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold tracking-tight transition-all duration-200 sm:px-5 ${
                tab === "exterior"
                  ? "bg-brand-500 text-white shadow-glow"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>Tour 360°</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 backdrop-blur-md sm:px-4">
            <span className="text-xs font-semibold text-white">
              Galería · {selectedPhotoIdx + 1} de {galleryImages.length}
            </span>
          </div>
          <span className="hidden text-xs font-medium text-white/50 sm:inline-block">
            Patio · Puerto Montt
          </span>
        </div>
      )}

      {/* Altura acotada: evita “zoom” y desborde por fotos 4K en CSS grid */}
      <div className="relative h-[min(42vh,280px)] w-full overflow-hidden rounded-2xl border border-white/15 bg-[#080b11] shadow-2xl sm:h-[min(48vh,380px)] sm:rounded-3xl group">
        {tab === "exterior" && hasSpin ? (
          <div className="absolute inset-0">
            <PhotoSpin360 frames={frames} className="h-full w-full" autoPlay={false} />
          </div>
        ) : (
          <div className="absolute inset-0 select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset(currentPhoto)}
              alt={`${name} - Foto ${selectedPhotoIdx + 1}`}
              loading="eager"
              decoding="async"
              sizes="(max-width: 1024px) 100vw, 60vw"
              onError={(e) => {
                const fallback = asset("/images/placeholder-pending-car.svg");
                if (e.currentTarget.src !== fallback) {
                  e.currentTarget.src = fallback;
                }
              }}
              className="h-full w-full max-w-full object-cover object-center"
            />

            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevPhoto}
                  aria-label="Foto anterior"
                  className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/65 text-lg font-bold text-white/90 backdrop-blur-md transition-all hover:bg-black/90 sm:left-3 sm:h-10 sm:w-10"
                >
                  ‹
                </button>
                <button
                  onClick={handleNextPhoto}
                  aria-label="Foto siguiente"
                  className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/65 text-lg font-bold text-white/90 backdrop-blur-md transition-all hover:bg-black/90 sm:right-3 sm:h-10 sm:w-10"
                >
                  ›
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {tab === "fotos" && galleryImages.length > 1 && (
        <div className="flex max-w-full gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:thin]">
          {galleryImages.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setSelectedPhotoIdx(i)}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border transition sm:h-16 sm:w-24 ${
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
