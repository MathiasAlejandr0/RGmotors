"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { asset } from "@/lib/asset";

type Hotspot = {
  id: string;
  lon: number; // 0 = centro de la vista, - izquierda, + derecha, 180 = atrás
  lat: number; // + arriba, - abajo
  label: string;
  description: string;
};

type Viewpoint = {
  id: string;
  label: string;
  image: string;
  lon: number;
  hotspots: Hotspot[];
};

const FRONT: Hotspot[] = [
  { id: "pantalla", lon: 0, lat: -7, label: 'Pantalla central 12.3"', description: "Apple CarPlay y Android Auto inalámbrico, navegación GPS y cámara 360°." },
  { id: "volante", lon: -13, lat: -13, label: "Volante multifunción", description: "Cuero perforado con levas de cambio y control de crucero adaptativo." },
  { id: "consola", lon: 0, lat: -33, label: "Consola central", description: "Selector de marcha, controles del clima y cargador inalámbrico." },
  { id: "vent", lon: 16, lat: -9, label: "Climatizador bizona", description: "Aire acondicionado digital de doble zona con salidas traseras." },
  { id: "techo", lon: 0, lat: 42, label: "Luz ambiental", description: "Iluminación ambiental configurable en varios colores." },
];

const REAR: Hotspot[] = [
  { id: "screens", lon: 0, lat: -6, label: "Pantallas traseras", description: "Sistema de entretenimiento para los pasajeros de atrás." },
  { id: "sunroof", lon: 0, lat: 46, label: "Techo panorámico", description: "Sunroof panorámico con cortinilla eléctrica." },
  { id: "seats", lon: 0, lat: -36, label: "Asientos de cuero", description: "Butacas traseras de cuero con costuras diamante, sin desgaste." },
  { id: "door", lon: -38, lat: -8, label: "Confort trasero", description: "Apoyabrazos central, salidas de aire y puertos USB-C." },
];

const VIEWPOINTS: Viewpoint[] = [
  { id: "conductor", label: "Conductor", image: asset("/cars/pano-front.png"), lon: 0, hotspots: FRONT },
  { id: "trasera", label: "Trasera", image: asset("/cars/pano-rear.png"), lon: 0, hotspots: REAR },
];

const D2R = Math.PI / 180;

export default function InteriorTour({ className = "" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hotspotEls = useRef<Record<string, HTMLButtonElement | null>>({});

  const [ready, setReady] = useState(false);
  const [vpIndex, setVpIndex] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(true);
  const [isFs, setIsFs] = useState(false);
  const [fading, setFading] = useState(false);

  // refs mutables para el loop
  const state = useRef({
    lon: 0,
    lat: 0,
    fov: 72,
    autoRotate: true,
    dragging: false,
    lastX: 0,
    lastY: 0,
  });
  const apiRef = useRef<{
    setViewpoint: (v: Viewpoint) => void;
    zoom: (d: number) => void;
  }>({ setViewpoint: () => {}, zoom: () => {} });

  const vp = VIEWPOINTS[vpIndex];

  // dirección (unidad) para una lon/lat dada; alineada con la textura equirectangular
  // (lon=0 mira al centro del panorama; +lat arriba). Compatible con esfera BackSide + scale.x=-1
  const dir = (lon: number, lat: number, r = 1) => {
    const lo = lon * D2R;
    const la = lat * D2R;
    const x = -Math.cos(lo) * Math.cos(la);
    const y = Math.sin(la);
    const z = -Math.sin(lo) * Math.cos(la);
    return new THREE.Vector3(x, y, z).multiplyScalar(r);
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let width = mount.clientWidth;
    let height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(72, width / height, 0.1, 1100);
    camera.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = "none";

    // Esfera panorámica (se ve desde adentro, sin espejar)
    const geometry = new THREE.SphereGeometry(500, 64, 40);
    const material = new THREE.MeshBasicMaterial({ side: THREE.BackSide });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.scale.set(-1, 1, 1);
    scene.add(sphere);

    const loader = new THREE.TextureLoader();
    const loadTexture = (url: string, first = false) => {
      loader.load(url, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        const old = material.map;
        material.map = tex;
        material.needsUpdate = true;
        if (old) old.dispose();
        if (first) setReady(true);
      });
    };
    loadTexture(VIEWPOINTS[0].image, true);

    // API expuesta a la UI
    apiRef.current.setViewpoint = (v: Viewpoint) => {
      state.current.lon = v.lon;
      state.current.lat = 0;
      state.current.autoRotate = true;
      loadTexture(v.image);
    };
    apiRef.current.zoom = (delta: number) => {
      state.current.fov = Math.max(35, Math.min(85, state.current.fov + delta));
      camera.fov = state.current.fov;
      camera.updateProjectionMatrix();
    };

    // Interacción
    const dom = renderer.domElement;
    const onDown = (e: PointerEvent) => {
      state.current.dragging = true;
      state.current.autoRotate = false;
      state.current.lastX = e.clientX;
      state.current.lastY = e.clientY;
      setShowHint(false);
      dom.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!state.current.dragging) return;
      const dx = e.clientX - state.current.lastX;
      const dy = e.clientY - state.current.lastY;
      state.current.lastX = e.clientX;
      state.current.lastY = e.clientY;
      const k = state.current.fov / 720;
      state.current.lon -= dx * k * 2;
      state.current.lat = Math.max(-72, Math.min(72, state.current.lat + dy * k * 2));
    };
    const onUp = (e: PointerEvent) => {
      state.current.dragging = false;
      try { dom.releasePointerCapture(e.pointerId); } catch {}
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      apiRef.current.zoom(e.deltaY * 0.05);
    };
    dom.addEventListener("pointerdown", onDown);
    dom.addEventListener("pointermove", onMove);
    dom.addEventListener("pointerup", onUp);
    dom.addEventListener("pointercancel", onUp);
    dom.addEventListener("wheel", onWheel, { passive: false });

    // Pinch (2 dedos) para zoom
    let pinchDist = 0;
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const d = Math.hypot(dx, dy);
        if (pinchDist) apiRef.current.zoom((pinchDist - d) * 0.1);
        pinchDist = d;
      }
    };
    const onTouchEnd = () => { pinchDist = 0; };
    dom.addEventListener("touchmove", onTouchMove, { passive: true });
    dom.addEventListener("touchend", onTouchEnd);

    // Loop
    const target = new THREE.Vector3();
    const proj = new THREE.Vector3();
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const s = state.current;
      if (s.autoRotate) s.lon += 0.04;

      target.copy(dir(s.lon, s.lat));
      camera.lookAt(target);

      // hotspots del viewpoint actual
      const current = VIEWPOINTS[vpIndexRef.current];
      for (const h of current.hotspots) {
        const el = hotspotEls.current[h.id];
        if (!el) continue;
        proj.copy(dir(h.lon, h.lat, 100)).project(camera);
        const behind = proj.z > 1;
        const x = (proj.x * 0.5 + 0.5) * width;
        const y = (-proj.y * 0.5 + 0.5) * height;
        el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
        el.style.opacity = behind ? "0" : "1";
        el.style.pointerEvents = behind ? "none" : "auto";
      }

      renderer.render(scene, camera);
    };
    animate();

    const resize = () => {
      width = mount.clientWidth;
      height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      dom.removeEventListener("pointerdown", onDown);
      dom.removeEventListener("pointermove", onMove);
      dom.removeEventListener("pointerup", onUp);
      dom.removeEventListener("pointercancel", onUp);
      dom.removeEventListener("wheel", onWheel);
      dom.removeEventListener("touchmove", onTouchMove);
      dom.removeEventListener("touchend", onTouchEnd);
      geometry.dispose();
      material.map?.dispose();
      material.dispose();
      renderer.dispose();
      if (dom.parentNode === mount) mount.removeChild(dom);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // mantener el índice actual accesible dentro del loop
  const vpIndexRef = useRef(0);
  vpIndexRef.current = vpIndex;

  const changeViewpoint = (i: number) => {
    if (i === vpIndex) return;
    setFading(true);
    setActive(null);
    setTimeout(() => {
      setVpIndex(i);
      apiRef.current.setViewpoint(VIEWPOINTS[i]);
      setFading(false);
    }, 250);
  };

  const toggleFs = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  }, []);

  useEffect(() => {
    const onFs = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const activeSpot = vp.hotspots.find((h) => h.id === active);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-ink-950 no-select ${className}`}
    >
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Fade al cambiar de vista */}
      <div
        className={`pointer-events-none absolute inset-0 z-20 bg-black transition-opacity duration-300 ${
          fading ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Loading */}
      {!ready && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-ink-950">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-brand-500" />
          <p className="text-sm text-white/50">Cargando tour interior 360°…</p>
        </div>
      )}

      {/* Hotspots */}
      {ready &&
        vp.hotspots.map((h) => (
          <button
            key={h.id}
            ref={(el) => {
              hotspotEls.current[h.id] = el;
            }}
            onClick={() => setActive((a) => (a === h.id ? null : h.id))}
            className="absolute left-0 top-0 z-10 grid h-8 w-8 place-items-center rounded-full border border-white/70 bg-brand-500/90 shadow-glow backdrop-blur transition hover:scale-110"
            aria-label={h.label}
          >
            <span className="h-2 w-2 rounded-full bg-white" />
            <span className="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-brand-400/50" />
          </button>
        ))}

      {/* Badge */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        Tour interior 360°
      </div>

      {/* Hint */}
      {ready && showHint && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-xs text-white/80 backdrop-blur">
          ↔ Arrastra para mirar alrededor · rueda para zoom
        </div>
      )}

      {/* Controles derecha */}
      <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
        <IconBtn onClick={() => apiRef.current.zoom(-8)} label="Acercar">+</IconBtn>
        <IconBtn onClick={() => apiRef.current.zoom(8)} label="Alejar">−</IconBtn>
        <IconBtn onClick={toggleFs} label="Pantalla completa">{isFs ? "⤡" : "⤢"}</IconBtn>
      </div>

      {/* Tarjeta de hotspot */}
      {activeSpot && (
        <div className="absolute bottom-20 left-1/2 z-20 w-[min(92%,360px)] -translate-x-1/2 animate-fade-up rounded-xl border border-white/10 bg-ink-800/95 p-4 shadow-modal backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-brand-300">{activeSpot.label}</p>
              <p className="mt-1 text-sm text-white/70">{activeSpot.description}</p>
            </div>
            <button onClick={() => setActive(null)} className="rounded-md px-2 text-white/40 hover:text-white" aria-label="Cerrar">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Selector de puntos de vista */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-full border border-white/10 bg-black/50 p-1 backdrop-blur">
        {VIEWPOINTS.map((v, i) => (
          <button
            key={v.id}
            onClick={() => changeViewpoint(i)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition sm:px-4 ${
              i === vpIndex ? "bg-brand-500 text-white" : "text-white/60 hover:text-white"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-black/40 text-lg leading-none text-white/80 backdrop-blur transition hover:bg-white/10"
    >
      {children}
    </button>
  );
}
