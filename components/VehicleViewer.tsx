"use client";

import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";
import PhotoSpin360 from "./PhotoSpin360";

type Tab = "fotos" | "exterior";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "fotos", label: "Fotos HD", icon: "🖼️" },
  { id: "exterior", label: "Vista 360°", icon: "🔄" },
];

export default function VehicleViewer({
  image,
  name,
  slug,
  spinFrames = [],
}: {
  image: string;
  name: string;
  slug?: string;
  spinFrames?: string[];
}) {
  const [tab, setTab] = useState<Tab>("fotos");
  const [frames, setFrames] = useState<string[]>(spinFrames);
  const [galleryImages, setGalleryImages] = useState<string[]>([image]);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const hasSpin = frames.length > 0;

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    // Cargar fotogramas 360 y galería de fotos
    fetch(asset(`/cars/spin/${slug}/manifest.json`), { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((m) => {
        if (cancelled || !m || !m.count) return;
        const bust = m.updatedAt
          ? `?v=${encodeURIComponent(m.updatedAt)}`
          : `?v=${Date.now()}`;
        setFrames(
          Array.from(
            { length: m.count },
            (_, i) =>
              asset(
                `/cars/spin/${slug}/${String(i + 1).padStart(3, "0")}.jpg`
              ) + bust
          )
        );
      })
      .catch(() => {});

    fetch(`/api/photos?slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        if (data.gallery && data.gallery.length > 0) {
          const urls = data.gallery.map((g: { url: string }) => g.url);
          setGalleryImages([image, ...urls]);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [slug, image]);

  const currentPhoto = galleryImages[selectedPhotoIdx] || image;

  return (
    <div className="space-y-4">
      {/* Media Segmented Controls */}
      <div className="inline-flex items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur-xl shadow-sm">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-xs font-semibold tracking-tight transition-all duration-200 ${
                active
                  ? "bg-brand-500 text-white shadow-glow"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-ink-900 to-ink-950 shadow-apple-card sm:aspect-[16/10]">
        {tab === "fotos" && (
          <div className="relative h-full w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentPhoto}
              alt={name}
              className="h-full w-full object-cover transition-opacity duration-300"
            />
            {galleryImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhotoIdx(idx)}
                    className={`h-2.5 rounded-full transition-all ${
                      selectedPhotoIdx === idx ? "w-6 bg-brand-400" : "w-2.5 bg-white/40 hover:bg-white/70"
                    }`}
                    aria-label={`Foto ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        {tab === "exterior" &&
          (hasSpin ? (
            <PhotoSpin360 frames={frames} className="h-full w-full" />
          ) : (
            <div className="relative flex h-full w-full items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={name}
                className="h-full w-full object-cover opacity-40"
              />
              <p className="absolute rounded-full border border-white/15 bg-black/60 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-md">
                Vista 360° no disponible para este vehículo
              </p>
            </div>
          ))}
      </div>

      <p className="text-center text-xs font-medium text-white/45">
        {tab === "exterior"
          ? hasSpin
            ? "Vista 360° interactiva: arrastra lateralmente para girar el vehículo."
            : "Este vehículo aún no cuenta con secuencia 360°."
          : "Fotografías oficiales del vehículo."}
      </p>
    </div>
  );
}


