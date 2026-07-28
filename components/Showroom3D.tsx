"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type Hotspot = {
  id: string;
  position: [number, number, number];
  label: string;
  description: string;
};

type ColorOption = { name: string; hex: string };

const DEFAULT_COLORS: ColorOption[] = [
  { name: "Rojo RG", hex: "#c81d25" },
  { name: "Negro Ónix", hex: "#15181f" },
  { name: "Blanco Perla", hex: "#eef1f6" },
  { name: "Gris Titanio", hex: "#6b7280" },
  { name: "Azul Marino", hex: "#1f3a8a" },
  { name: "Verde Bosque", hex: "#1f5d3a" },
];

const DEFAULT_HOTSPOTS: Hotspot[] = [
  {
    id: "faro",
    position: [2.3, 0.92, 0.66],
    label: "Faros LED",
    description: "Iluminación full LED con luces diurnas. Sin rayones ni humedad.",
  },
  {
    id: "llanta",
    position: [1.5, 0.5, 1.12],
    label: "Llantas de aleación",
    description: "Aro 18\" multirradio, neumáticos con 80% de vida útil.",
  },
  {
    id: "techo",
    position: [-0.4, 1.86, 0],
    label: "Techo panorámico",
    description: "Sunroof eléctrico, sin filtraciones. Tela de cielo impecable.",
  },
  {
    id: "cola",
    position: [-2.36, 1.05, -0.5],
    label: "Barra LED trasera",
    description: "Sin choques ni masilla. Pintura original en todos los paneles.",
  },
];

type Props = {
  colors?: ColorOption[];
  initialColor?: string;
  hotspots?: Hotspot[];
  className?: string;
};

export default function Showroom3D({
  colors = DEFAULT_COLORS,
  initialColor,
  hotspots = DEFAULT_HOTSPOTS,
  className = "",
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hotspotRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const bodyMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null);

  const [ready, setReady] = useState(false);
  const [color, setColor] = useState(initialColor ?? colors[0].hex);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Keep a stable ref to the current color so the render loop / init can read it.
  const colorRef = useRef(color);
  colorRef.current = color;

  const zoomRef = useRef<(factor: number) => void>(() => {});
  const resetRef = useRef<() => void>(() => {});

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let width = mount.clientWidth;
    let height = mount.clientHeight;

    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = "none";

    // Realistic reflections from a procedural studio (no external assets = free).
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(6.5, 3.2, 7.5);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 5.5;
    controls.maxDistance = 16;
    controls.minPolarAngle = 0.2;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // no ir bajo el piso
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.1;
    controls.target.set(0, 0.9, 0);

    // ---- Lighting ----
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(6, 10, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 40;
    key.shadow.camera.left = -8;
    key.shadow.camera.right = 8;
    key.shadow.camera.top = 8;
    key.shadow.camera.bottom = -8;
    key.shadow.bias = -0.0004;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x88aaff, 0.6);
    fill.position.set(-8, 5, -4);
    scene.add(fill);

    const ambient = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambient);

    // ---- Studio backdrop (cyclorama con degradado, look de showroom) ----
    const makeGradientTexture = (stops: [number, string][]) => {
      const c = document.createElement("canvas");
      c.width = 16;
      c.height = 512;
      const ctx = c.getContext("2d")!;
      const g = ctx.createLinearGradient(0, 0, 0, 512);
      for (const [o, col] of stops) g.addColorStop(o, col);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 16, 512);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };

    const backdrop = new THREE.Mesh(
      new THREE.SphereGeometry(45, 32, 24),
      new THREE.MeshBasicMaterial({
        map: makeGradientTexture([
          [0, "#04060a"],
          [0.42, "#0e1218"],
          [0.55, "#1a212b"],
          [0.7, "#0b0e13"],
          [1, "#04060a"],
        ]),
        side: THREE.BackSide,
        depthWrite: false,
      })
    );
    scene.add(backdrop);

    // ---- Floor (reflectante) + sombra de contacto + aro de luz ----
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(45, 96),
      new THREE.MeshStandardMaterial({
        color: 0x090b0f,
        roughness: 0.32,
        metalness: 0.85,
        envMapIntensity: 0.9,
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Sombra de contacto suave bajo el auto
    const shadowTex = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const ctx = c.getContext("2d")!;
      const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 128);
      g.addColorStop(0, "rgba(0,0,0,0.6)");
      g.addColorStop(0.55, "rgba(0,0,0,0.28)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);
      return new THREE.CanvasTexture(c);
    })();
    const contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(7.5, 4.2),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
      })
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.015;
    scene.add(contactShadow);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(3.5, 3.62, 128),
      new THREE.MeshBasicMaterial({
        color: 0x006cff,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    scene.add(ring);

    // ---- Materiales ----
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colorRef.current),
      metalness: 0.6,
      roughness: 0.28,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.25,
    });
    bodyMatRef.current = bodyMat;

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x090c12,
      metalness: 0.35,
      roughness: 0.06,
      transmission: 0.18,
      transparent: true,
      opacity: 0.9,
      clearcoat: 1,
      envMapIntensity: 1.8,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xd6dce6,
      metalness: 1,
      roughness: 0.12,
      envMapIntensity: 1.6,
    });

    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x181b21,
      metalness: 0.95,
      roughness: 0.32,
      envMapIntensity: 1.3,
    });

    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0c,
      metalness: 0.1,
      roughness: 0.9,
    });

    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x0b0c0f,
      metalness: 0.6,
      roughness: 0.5,
    });

    // ---- Carrocería: perfil lateral extruido (silueta tipo SUV) ----
    const car = new THREE.Group();
    const HALF_W = 0.98;

    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(2.32, 0.34);
    bodyShape.lineTo(2.4, 0.66);
    bodyShape.quadraticCurveTo(2.42, 0.92, 2.18, 0.98); // capó frontal
    bodyShape.lineTo(1.2, 1.04); // capó
    bodyShape.quadraticCurveTo(1.0, 1.06, 0.86, 1.22); // base parabrisas
    bodyShape.lineTo(0.34, 1.74); // parabrisas / pilar A
    bodyShape.quadraticCurveTo(0.22, 1.85, 0.0, 1.86); // techo frontal
    bodyShape.lineTo(-1.02, 1.85); // techo
    bodyShape.quadraticCurveTo(-1.28, 1.84, -1.4, 1.66); // pilar C
    bodyShape.lineTo(-1.86, 1.24); // luneta
    bodyShape.quadraticCurveTo(-2.02, 1.1, -2.22, 1.02); // portalón
    bodyShape.quadraticCurveTo(-2.44, 0.94, -2.42, 0.66); // parachoques trasero
    bodyShape.lineTo(-2.36, 0.34);
    bodyShape.lineTo(2.32, 0.34);

    const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
      depth: HALF_W * 2,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 4,
      steps: 1,
    });
    bodyGeo.translate(0, 0, -HALF_W);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    car.add(body);

    // Greenhouse acristalado (parabrisas + techo panorámico + luneta)
    const glassShape = new THREE.Shape();
    glassShape.moveTo(0.92, 1.2);
    glassShape.lineTo(0.4, 1.68);
    glassShape.lineTo(-1.0, 1.79);
    glassShape.lineTo(-1.34, 1.6);
    glassShape.lineTo(-1.78, 1.26);
    glassShape.lineTo(0.92, 1.2);
    const glassGeo = new THREE.ExtrudeGeometry(glassShape, {
      depth: (HALF_W - 0.03) * 2,
      bevelEnabled: false,
      steps: 1,
    });
    glassGeo.translate(0, 0, -(HALF_W - 0.03));
    const greenhouse = new THREE.Mesh(glassGeo, glassMat);
    car.add(greenhouse);

    // Línea inferior / faldón lateral
    const skirt = new THREE.Mesh(
      new RoundedBoxGeometry(4.5, 0.22, HALF_W * 2 + 0.06, 4, 0.08),
      trimMat
    );
    skirt.position.set(0, 0.44, 0);
    car.add(skirt);

    // ---- Ruedas (llanta multi-rayo) + pasos de rueda ----
    const makeWheel = () => {
      const g = new THREE.Group();
      const tire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.36, 44),
        rubberMat
      );
      tire.rotation.x = Math.PI / 2;
      tire.castShadow = true;
      g.add(tire);

      const disc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.34, 0.34, 0.34, 36),
        rimMat
      );
      disc.rotation.x = Math.PI / 2;
      g.add(disc);

      for (let i = 0; i < 5; i++) {
        const spoke = new THREE.Mesh(
          new THREE.BoxGeometry(0.09, 0.58, 0.26),
          rimMat
        );
        spoke.rotation.z = (i * Math.PI * 2) / 5;
        g.add(spoke);
      }

      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.11, 0.4, 20),
        chromeMat
      );
      hub.rotation.x = Math.PI / 2;
      g.add(hub);
      return g;
    };

    const wheelPositions: [number, number][] = [
      [1.5, HALF_W],
      [1.5, -HALF_W],
      [-1.5, HALF_W],
      [-1.5, -HALF_W],
    ];
    for (const [x, z] of wheelPositions) {
      const wheel = makeWheel();
      wheel.position.set(x, 0.5, z);
      car.add(wheel);

      // paso de rueda (arco oscuro sobre la llanta)
      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(0.64, 0.1, 12, 28, Math.PI),
        trimMat
      );
      arch.position.set(x, 0.5, z > 0 ? z + 0.02 : z - 0.02);
      car.add(arch);
    }

    // ---- Faros / pilotos / parrilla ----
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xdfefff,
      emissiveIntensity: 1.6,
    });
    for (const z of [0.66, -0.66]) {
      const hl = new THREE.Mesh(
        new RoundedBoxGeometry(0.14, 0.16, 0.42, 3, 0.05),
        headMat
      );
      hl.position.set(2.3, 0.92, z);
      car.add(hl);
    }

    const tailMat = new THREE.MeshStandardMaterial({
      color: 0xff2a2a,
      emissive: 0xff1414,
      emissiveIntensity: 1.5,
    });
    // barra LED trasera continua
    const tailBar = new THREE.Mesh(
      new RoundedBoxGeometry(0.08, 0.12, 1.5, 3, 0.04),
      tailMat
    );
    tailBar.position.set(-2.36, 1.05, 0);
    car.add(tailBar);

    const grille = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.34, 1.0),
      new THREE.MeshStandardMaterial({
        color: 0x080809,
        metalness: 0.9,
        roughness: 0.35,
      })
    );
    grille.position.set(2.34, 0.72, 0);
    car.add(grille);

    // retrovisores
    for (const z of [HALF_W, -HALF_W]) {
      const mirror = new THREE.Mesh(
        new RoundedBoxGeometry(0.24, 0.14, 0.1, 3, 0.04),
        bodyMat
      );
      mirror.position.set(0.62, 1.28, z > 0 ? z + 0.12 : z - 0.12);
      car.add(mirror);
    }

    scene.add(car);

    // ---- Interaction handling (pause autorotate) ----
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    const onStart = () => {
      controls.autoRotate = false;
      setShowHint(false);
      if (idleTimer) clearTimeout(idleTimer);
    };
    const onEnd = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        controls.autoRotate = true;
      }, 4000);
    };
    controls.addEventListener("start", onStart);
    controls.addEventListener("end", onEnd);

    // ---- Zoom / reset exposed to UI ----
    zoomRef.current = (factor: number) => {
      const dir = new THREE.Vector3().subVectors(camera.position, controls.target);
      let dist = dir.length() * factor;
      dist = Math.max(controls.minDistance, Math.min(controls.maxDistance, dist));
      dir.setLength(dist);
      camera.position.copy(controls.target).add(dir);
    };
    resetRef.current = () => {
      camera.position.set(6.5, 3.2, 7.5);
      controls.target.set(0, 0.9, 0);
      controls.autoRotate = true;
    };

    // ---- Hotspot projection ----
    const projected = new THREE.Vector3();
    const updateHotspots = () => {
      for (const h of hotspots) {
        const el = hotspotRefs.current[h.id];
        if (!el) continue;
        projected.set(h.position[0], h.position[1], h.position[2]);
        projected.project(camera);
        const behind = projected.z > 1;
        const x = (projected.x * 0.5 + 0.5) * width;
        const y = (-projected.y * 0.5 + 0.5) * height;
        el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
        el.style.opacity = behind ? "0" : "1";
        el.style.pointerEvents = behind ? "none" : "auto";
      }
    };

    // ---- Render loop ----
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      controls.update();
      updateHotspots();
      renderer.render(scene, camera);
    };
    animate();
    setReady(true);

    // ---- Resize ----
    const resize = () => {
      if (!mount) return;
      width = mount.clientWidth;
      height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // ---- Cleanup ----
    return () => {
      cancelAnimationFrame(raf);
      if (idleTimer) clearTimeout(idleTimer);
      ro.disconnect();
      controls.removeEventListener("start", onStart);
      controls.removeEventListener("end", onEnd);
      controls.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          for (const m of mats) {
            const mm = m as THREE.MeshStandardMaterial;
            mm.map?.dispose();
            mm.dispose();
          }
        }
      });
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update body color when the swatch changes.
  useEffect(() => {
    if (bodyMatRef.current) bodyMatRef.current.color.set(color);
  }, [color]);

  // Fullscreen handling
  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const active = hotspots.find((h) => h.id === activeHotspot);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-ink-800 to-ink-900 no-select ${className}`}
    >
      <div ref={mountRef} className="absolute inset-0" />

      {/* Loading */}
      {!ready && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-ink-900">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-brand-400" />
            <p className="text-sm text-white/50">Cargando showroom 3D…</p>
          </div>
        </div>
      )}

      {/* Hotspots */}
      {showHotspots &&
        hotspots.map((h) => (
          <button
            key={h.id}
            ref={(el) => {
              hotspotRefs.current[h.id] = el;
            }}
            onClick={() => setActiveHotspot((cur) => (cur === h.id ? null : h.id))}
            className="absolute left-0 top-0 z-10 grid h-7 w-7 place-items-center rounded-full border border-white/70 bg-brand-500/90 text-white shadow-glow backdrop-blur transition hover:scale-110"
            aria-label={h.label}
          >
            <span className="block h-2 w-2 rounded-full bg-white" />
            <span className="absolute inline-flex h-7 w-7 animate-ping rounded-full bg-brand-400/60" />
          </button>
        ))}

      {/* Hotspot detail card */}
      {active && (
        <div className="absolute bottom-20 left-1/2 z-20 w-[min(92%,340px)] -translate-x-1/2 animate-fade-up rounded-xl border border-white/10 bg-ink-800/95 p-4 shadow-xl backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-brand-300">{active.label}</p>
              <p className="mt-1 text-sm text-white/70">{active.description}</p>
            </div>
            <button
              onClick={() => setActiveHotspot(null)}
              className="rounded-md px-2 text-white/40 hover:text-white"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Drag hint */}
      {ready && showHint && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-xs text-white/80 backdrop-blur">
          ↔ Arrastra para girar el auto 360°
        </div>
      )}

      {/* Badge */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        Vista 360° interactiva
      </div>

      {/* Right controls */}
      <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
        <IconBtn onClick={() => zoomRef.current(0.85)} label="Acercar">+</IconBtn>
        <IconBtn onClick={() => zoomRef.current(1.18)} label="Alejar">−</IconBtn>
        <IconBtn onClick={() => resetRef.current()} label="Reiniciar vista">⟳</IconBtn>
        <IconBtn
          onClick={() => setShowHotspots((s) => !s)}
          label="Mostrar/ocultar puntos"
          active={showHotspots}
        >
          ◎
        </IconBtn>
        <IconBtn onClick={toggleFullscreen} label="Pantalla completa">
          {isFullscreen ? "⤡" : "⤢"}
        </IconBtn>
      </div>

      {/* Color picker */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-2 backdrop-blur">
        <span className="hidden pl-1 pr-1 text-xs text-white/60 sm:inline">Color:</span>
        {colors.map((c) => (
          <button
            key={c.hex}
            onClick={() => setColor(c.hex)}
            title={c.name}
            aria-label={c.name}
            className={`h-6 w-6 rounded-full border-2 transition ${
              color === c.hex
                ? "scale-110 border-white"
                : "border-white/20 hover:border-white/60"
            }`}
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  label,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 place-items-center rounded-lg border text-lg leading-none backdrop-blur transition hover:bg-white/10 ${
        active
          ? "border-brand-400 bg-brand-500/30 text-white"
          : "border-white/10 bg-black/40 text-white/80"
      }`}
    >
      {children}
    </button>
  );
}
