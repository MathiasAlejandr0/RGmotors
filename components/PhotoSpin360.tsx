"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Props = {
  /** URLs de los frames en orden (ej: 36 fotos alrededor del auto). */
  frames: string[];
  /** Sensibilidad del arrastre: px de movimiento por cambio de frame. */
  dragSensitivity?: number;
  /** Auto-girar hasta la primera interacción. */
  autoRotate?: boolean;
  className?: string;
};

export default function PhotoSpin360({
  frames,
  dragSensitivity = 6,
  autoRotate = true,
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgsRef = useRef<HTMLImageElement[]>([]);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const total = frames.length;

  // Preload frames.
  useEffect(() => {
    let cancelled = false;
    let count = 0;
    imgsRef.current = [];
    setReady(false);
    setLoaded(0);

    frames.forEach((src, i) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        if (cancelled) return;
        count += 1;
        setLoaded(count);
        if (count === total) setReady(true);
      };
      img.src = src;
      imgsRef.current[i] = img;
    });

    return () => {
      cancelled = true;
    };
  }, [frames, total]);

  // Auto-rotate until first interaction.
  const interactedRef = useRef(false);
  useEffect(() => {
    if (!ready || !autoRotate) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      if (interactedRef.current) return;
      if (now - last > 70) {
        last = now;
        setIndex((i) => (i + 1) % total);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [ready, autoRotate, total]);

  // Drag handling (mouse + touch via pointer events).
  const dragState = useRef({ startX: 0, startIndex: 0, moved: false });

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      interactedRef.current = true;
      setShowHint(false);
      setDragging(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragState.current = { startX: e.clientX, startIndex: index, moved: false };
    },
    [index]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - dragState.current.startX;
      const steps = Math.round(dx / dragSensitivity);
      // Arrastrar a la derecha gira el auto en sentido natural.
      let next = (dragState.current.startIndex - steps) % total;
      if (next < 0) next += total;
      setIndex(next);
    },
    [dragging, dragSensitivity, total]
  );

  const endDrag = useCallback((e: React.PointerEvent) => {
    setDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  }, []);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const pct = total ? Math.round((loaded / total) * 100) : 0;

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-2xl border border-white/10 bg-ink-900 no-select ${className}`}
    >
      {/* Frames */}
      <div
        className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        {frames.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt={`Vista ${i + 1} de ${total}`}
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full object-contain"
            style={{ opacity: i === index ? 1 : 0 }}
          />
        ))}
      </div>

      {/* Loading */}
      {!ready && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-ink-900">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-brand-400" />
          <p className="text-sm text-white/50">Cargando fotos 360°… {pct}%</p>
          <div className="h-1 w-40 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-brand-400 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Badge */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        360° del auto real
      </div>

      {/* Hint */}
      {ready && showHint && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-xs text-white/80 backdrop-blur">
          ↔ Arrastra para girar
        </div>
      )}

      {/* Fullscreen */}
      <button
        onClick={toggleFullscreen}
        aria-label="Pantalla completa"
        className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-black/40 text-lg text-white/80 backdrop-blur transition hover:bg-white/10"
      >
        {isFullscreen ? "⤡" : "⤢"}
      </button>

      {/* Progress bar (frame position) */}
      {ready && (
        <div className="absolute bottom-4 left-1/2 z-10 flex w-[min(80%,260px)] -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-2 backdrop-blur">
          <span className="text-xs text-white/50">360°</span>
          <div className="relative h-1 flex-1 rounded-full bg-white/15">
            <div
              className="absolute -top-1 h-3 w-3 -translate-x-1/2 rounded-full bg-brand-400 shadow"
              style={{ left: `${(index / Math.max(1, total - 1)) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
