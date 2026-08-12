"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Props = {
  frames: string[];
  /** px de arrastre necesarios para avanzar 1 solo fotograma */
  dragSensitivity?: number;
  className?: string;
};

/**
 * Visor 360° por secuencia de fotos.
 * Usa canvas (un solo dibujo a la vez) para evitar el parpadeo típico
 * de apilar <img> con opacity. El arrastre avanza de a 1 frame.
 */
export default function PhotoSpin360({
  frames,
  dragSensitivity,
  className = "",
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgsRef = useRef<(HTMLImageElement | null)[]>([]);
  const indexRef = useRef(0);
  const dragAccRef = useRef(0);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const total = frames.length;

  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dragging, setDragging] = useState(false);

  const draw = useCallback((i: number) => {
    const canvas = canvasRef.current;
    const img = imgsRef.current[i];
    if (!canvas || !img || !img.complete || !img.naturalWidth) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const { w, h, dpr } = sizeRef.current;
    if (w < 2 || h < 2) return;

    // Fondo negro solo para letterbox; la foto va con su fondo original.
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w * dpr, h * dpr);

    const scale = Math.min(
      (w * dpr) / img.naturalWidth,
      (h * dpr) / img.naturalHeight
    );
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = (w * dpr - dw) / 2;
    const dy = (h * dpr - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  }, []);

  const setFrame = useCallback(
    (i: number) => {
      let n = i % total;
      if (n < 0) n += total;
      if (n === indexRef.current && ready) {
        // igual, pero redibuja por si cambió el tamaño
      }
      indexRef.current = n;
      setIndex(n);
      draw(n);
    },
    [total, draw, ready]
  );

  // Resize canvas
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeRef.current = { w: rect.width, h: rect.height, dpr };
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      draw(indexRef.current);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [draw]);

  // Preload
  useEffect(() => {
    let cancelled = false;
    let count = 0;
    imgsRef.current = new Array(total).fill(null);
    setReady(false);
    setLoaded(0);
    setShowHint(true);
    const start = total > 8 ? Math.floor(total * 0.18) : 0;
    indexRef.current = start;
    setIndex(start);

    frames.forEach((src, i) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (cancelled) return;
        imgsRef.current[i] = img;
        count += 1;
        setLoaded(count);
        if (count === total) {
          setReady(true);
          draw(indexRef.current);
        } else if (i === start) {
          draw(start);
        }
      };
      img.onerror = () => {
        if (cancelled) return;
        count += 1;
        setLoaded(count);
        if (count === total) setReady(true);
      };
      img.src = src;
    });

    return () => {
      cancelled = true;
    };
  }, [frames, total, draw]);

  // Hint de arrastre: 5s y desaparece (también al interactuar)
  useEffect(() => {
    if (!ready || !showHint) return;
    const t = window.setTimeout(() => setShowHint(false), 5000);
    return () => window.clearTimeout(t);
  }, [ready, showHint]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    setShowHint(false);
    draggingRef.current = true;
    setDragging(true);
    dragAccRef.current = 0;
    lastXRef.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      const dx = e.clientX - lastXRef.current;
      lastXRef.current = e.clientX;

      // ~1.4 anchos ≈ una vuelta: arrastre controlado, sin auto-giro
      const sens = Math.max(
        7,
        dragSensitivity ??
          Math.round(((sizeRef.current.w || 640) * 1.4) / Math.max(1, total))
      );

      dragAccRef.current += dx;
      while (Math.abs(dragAccRef.current) >= sens) {
        if (dragAccRef.current > 0) {
          setFrame(indexRef.current - 1);
          dragAccRef.current -= sens;
        } else {
          setFrame(indexRef.current + 1);
          dragAccRef.current += sens;
        }
      }
    },
    [dragSensitivity, setFrame, total]
  );

  const endDrag = useCallback((e: React.PointerEvent) => {
    draggingRef.current = false;
    setDragging(false);
    dragAccRef.current = 0;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = wrapRef.current;
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
  const angle = total ? Math.round((index / total) * 360) : 0;

  return (
    <div
      ref={wrapRef}
      className={`relative select-none overflow-hidden rounded-2xl border border-white/10 bg-[#07090c] no-select ${className}`}
    >
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full touch-none ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      />

      {!ready && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#07090c]">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-brand-400" />
          <p className="text-sm text-white/50">Preparando tour 360°… {pct}%</p>
          <div className="h-1 w-44 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-brand-400 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
        Tour 360°
      </div>

      {ready && showHint && (
        <div className="spin-drag-hint pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-6 py-5 backdrop-blur-md">
            <div className="relative flex h-10 w-36 items-center justify-center">
              {/* Rastro horizontal suave */}
              <div className="spin-drag-hint__trail absolute h-[2px] w-28 rounded-full bg-gradient-to-r from-transparent via-white/55 to-transparent" />
              {/* Flechas laterales */}
              <span className="absolute left-0 text-sm text-white/45">‹</span>
              <span className="absolute right-0 text-sm text-white/45">›</span>
              {/* Mano / cursor animado */}
              <div className="spin-drag-hint__hand relative z-[1] flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/15 shadow-[0_0_20px_rgba(0,108,255,0.25)]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-white/90"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12" />
                  <path d="M11 11.5V5.5a1.5 1.5 0 0 1 3 0V12" />
                  <path d="M14 12V7a1.5 1.5 0 0 1 3 0v7.5a4.5 4.5 0 0 1-4.5 4.5H12a5 5 0 0 1-5-5v-2.5a1.5 1.5 0 0 1 3 0V13" />
                </svg>
              </div>
            </div>
            <p className="text-xs font-medium tracking-wide text-white/75">
              Arrastra para girar
            </p>
          </div>
        </div>
      )}

      <div className="absolute right-4 top-4 z-10">
        <button
          onClick={toggleFullscreen}
          aria-label="Pantalla completa"
          className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-black/50 text-lg text-white/85 backdrop-blur-md transition hover:bg-white/10"
        >
          {isFullscreen ? "⤡" : "⤢"}
        </button>
      </div>

      {ready && (
        <div className="absolute bottom-4 left-1/2 z-10 flex w-[min(88%,320px)] -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-black/55 px-4 py-2.5 backdrop-blur-md">
          <span className="text-[10px] font-medium tracking-wide text-white/45">
            {String(angle).padStart(3, "0")}°
          </span>
          <div className="relative h-1 flex-1 rounded-full bg-white/12">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
              style={{ width: `${(index / Math.max(1, total)) * 100}%` }}
            />
            <div
              className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 bg-brand-400 shadow-[0_0_10px_rgba(0,108,255,0.55)]"
              style={{ left: `${(index / Math.max(1, total - 1)) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-white/40">
            {index + 1}/{total}
          </span>
        </div>
      )}
    </div>
  );
}
