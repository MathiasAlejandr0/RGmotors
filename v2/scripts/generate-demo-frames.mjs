/**
 * Genera frames de DEMO para el visor de giro 360° (PhotoSpin360).
 *
 * Renderiza un auto low-poly en 3D "por software" (sin GPU ni assets externos)
 * con silueta tipo SUV, llantas, piso reflectante y fondo de estudio, y exporta
 * N imágenes girando alrededor del vehículo.
 *
 * ⚠️ En PRODUCCIÓN estos JPG se reemplazan por las fotos reales que el equipo de
 * RG Motors toma dando una vuelta al auto. Basta con dejarlas en:
 *     public/cars/spin/<slug>/001.jpg, 002.jpg, ... (mismo número que "count")
 *
 * Uso:
 *   npm run demo:frames                      -> toyota-rav4-2022 (blanco perla)
 *   node scripts/generate-demo-frames.mjs <slug> <#RRGGBB> <frames>
 */
import { createCanvas } from "@napi-rs/canvas";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SLUG = process.argv[2] || "toyota-rav4-2022";
const BODY = process.argv[3] || "#e8ebf0"; // blanco perla
const FRAMES = Number(process.argv[4]) || 36;

const OUT_DIR = join(__dirname, "..", "public", "cars", "spin", SLUG);
const W = 1280;
const H = 800;

const GLASS = "#0c1017";
const TIRE = "#0b0b0d";
const RIM = "#c6cedb";
const CHROME = "#e2e7ef";
const TRIM = "#111318";
const HEAD = "#eaf3ff";
const TAIL = "#ff2f2f";

// ---------- Construcción de la malla (Y arriba, X largo, Z ancho) ----------
const faces = [];
const HALF_W = 0.98;

function addFace(verts, color) {
  faces.push({ verts, color });
}

// Perfil lateral (silueta SUV) en el plano X-Y
const profile = [
  [2.32, 0.34],
  [2.4, 0.66],
  [2.3, 0.95],
  [1.2, 1.04],
  [0.86, 1.22],
  [0.34, 1.74],
  [0.0, 1.86],
  [-1.02, 1.85],
  [-1.4, 1.66],
  [-1.86, 1.24],
  [-2.22, 1.02],
  [-2.42, 0.66],
  [-2.36, 0.34],
];

function centroid(pts) {
  const c = pts.reduce((a, p) => [a[0] + p[0], a[1] + p[1]], [0, 0]);
  return [c[0] / pts.length, c[1] / pts.length];
}

// Tapas laterales (los costados visibles del auto)
function addCap(pts, z, color) {
  const c = centroid(pts);
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    addFace(
      [
        [c[0], c[1], z],
        [a[0], a[1], z],
        [b[0], b[1], z],
      ],
      color
    );
  }
}
addCap(profile, HALF_W, BODY);
addCap(profile, -HALF_W, BODY);

// Banda perimetral que une ambos costados (da volumen)
for (let i = 0; i < profile.length; i++) {
  const a = profile[i];
  const b = profile[(i + 1) % profile.length];
  addFace(
    [
      [a[0], a[1], HALF_W],
      [b[0], b[1], HALF_W],
      [b[0], b[1], -HALF_W],
      [a[0], a[1], -HALF_W],
    ],
    BODY
  );
}

// Greenhouse (parabrisas + techo + luneta) acristalado, sobre cada costado
const glass = [
  [0.9, 1.22],
  [0.4, 1.68],
  [-1.0, 1.79],
  [-1.34, 1.6],
  [-1.78, 1.26],
];
addCap(glass, HALF_W + 0.012, GLASS);
addCap(glass, -HALF_W - 0.012, GLASS);

// ---------- Cilindros / discos para las ruedas ----------
function addCylinderZ(cx, cy, cz, radius, halfW, color, seg = 24) {
  for (let i = 0; i < seg; i++) {
    const a0 = (i / seg) * Math.PI * 2;
    const a1 = ((i + 1) / seg) * Math.PI * 2;
    const x0 = cx + Math.cos(a0) * radius;
    const y0 = cy + Math.sin(a0) * radius;
    const x1 = cx + Math.cos(a1) * radius;
    const y1 = cy + Math.sin(a1) * radius;
    addFace(
      [
        [x0, y0, cz + halfW],
        [x1, y1, cz + halfW],
        [x1, y1, cz - halfW],
        [x0, y0, cz - halfW],
      ],
      color
    );
  }
}
function addDiscZ(cx, cy, z, radius, color, seg = 24) {
  for (let i = 0; i < seg; i++) {
    const a0 = (i / seg) * Math.PI * 2;
    const a1 = ((i + 1) / seg) * Math.PI * 2;
    addFace(
      [
        [cx, cy, z],
        [cx + Math.cos(a0) * radius, cy + Math.sin(a0) * radius, z],
        [cx + Math.cos(a1) * radius, cy + Math.sin(a1) * radius, z],
      ],
      color
    );
  }
}

const wheelPos = [
  [1.5, HALF_W],
  [1.5, -HALF_W],
  [-1.5, HALF_W],
  [-1.5, -HALF_W],
];
for (const [x, z] of wheelPos) {
  const outer = z > 0 ? z + 0.18 : z - 0.18;
  addCylinderZ(x, 0.5, z, 0.5, 0.18, TIRE); // neumático
  addDiscZ(x, 0.5, outer + (z > 0 ? 0.001 : -0.001), 0.5, TIRE); // pared exterior
  addDiscZ(x, 0.5, outer + (z > 0 ? 0.02 : -0.02), 0.34, RIM); // llanta
  // rayos
  for (let s = 0; s < 5; s++) {
    const ang = (s / 5) * Math.PI * 2;
    const rz = outer + (z > 0 ? 0.03 : -0.03);
    const w = 0.05;
    const nx = Math.cos(ang + Math.PI / 2) * w;
    const ny = Math.sin(ang + Math.PI / 2) * w;
    const ex = x + Math.cos(ang) * 0.32;
    const ey = 0.5 + Math.sin(ang) * 0.32;
    addFace(
      [
        [x + nx, 0.5 + ny, rz],
        [x - nx, 0.5 - ny, rz],
        [ex - nx, ey - ny, rz],
        [ex + nx, ey + ny, rz],
      ],
      TRIM
    );
  }
  addDiscZ(x, 0.5, outer + (z > 0 ? 0.04 : -0.04), 0.1, CHROME); // tapa central
}

// ---------- Faros / pilotos / parrilla ----------
function addBox(cx, cy, cz, sx, sy, sz, color) {
  const x0 = cx - sx / 2,
    x1 = cx + sx / 2;
  const y0 = cy - sy / 2,
    y1 = cy + sy / 2;
  const z0 = cz - sz / 2,
    z1 = cz + sz / 2;
  const v = [
    [x0, y0, z0],
    [x1, y0, z0],
    [x1, y1, z0],
    [x0, y1, z0],
    [x0, y0, z1],
    [x1, y0, z1],
    [x1, y1, z1],
    [x0, y1, z1],
  ];
  const quads = [
    [0, 1, 2, 3],
    [5, 4, 7, 6],
    [4, 0, 3, 7],
    [1, 5, 6, 2],
    [3, 2, 6, 7],
    [4, 5, 1, 0],
  ];
  for (const q of quads) addFace(q.map((i) => v[i]), color);
}
for (const z of [0.66, -0.66]) addBox(2.28, 0.92, z, 0.14, 0.16, 0.44, HEAD);
addBox(-2.34, 1.05, 0, 0.08, 0.12, 1.5, TAIL); // barra LED trasera
addBox(2.34, 0.72, 0, 0.06, 0.34, 1.0, "#0a0a0c"); // parrilla
for (const z of [HALF_W, -HALF_W])
  addBox(0.62, 1.28, z > 0 ? z + 0.12 : z - 0.12, 0.24, 0.14, 0.1, BODY); // espejos

// ---------- Utilidades 3D ----------
const L = norm([0.45, 0.85, 0.4]);
function norm(v) {
  const m = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / m, v[1] / m, v[2] / m];
}
function sub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function rotY(p, a) {
  const c = Math.cos(a),
    s = Math.sin(a);
  return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
}
function rotX(p, a) {
  const c = Math.cos(a),
    s = Math.sin(a);
  return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
}
function shade(hex, k) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c * k)));
  return [f(r), f(g), f(b)];
}

const PITCH = -0.28;
const CAM_Z = 9.2;
const FOCAL = 1080;
const GROUND = 0.34;

function project(p) {
  const z = p[2] + CAM_Z;
  const s = FOCAL / z;
  return [W / 2 + p[0] * s, H * 0.52 - (p[1] - 0.8) * s, z];
}

function buildFaces(angle, reflect) {
  return faces.map((f) => {
    const world = f.verts.map((p) => {
      const q = reflect ? [p[0], 2 * GROUND - p[1], p[2]] : p;
      return rotX(rotY(q, angle), PITCH);
    });
    const n = norm(cross(sub(world[1], world[0]), sub(world[2], world[0])));
    const depth =
      world.reduce((a, v) => a + v[2], 0) / world.length;
    let light = 0.32 + 0.8 * Math.abs(dot(n, L));
    // realce especular sutil en la carrocería
    if (f.color === BODY) light += 0.12 * Math.pow(Math.max(0, n[1]), 2);
    return { pts: world.map(project), rgb: shade(f.color, light), depth };
  });
}

function paint(ctx, list, alpha) {
  list.sort((a, b) => b.depth - a.depth);
  for (const f of list) {
    ctx.beginPath();
    ctx.moveTo(f.pts[0][0], f.pts[0][1]);
    for (let i = 1; i < f.pts.length; i++) ctx.lineTo(f.pts[i][0], f.pts[i][1]);
    ctx.closePath();
    ctx.fillStyle = `rgba(${f.rgb[0]},${f.rgb[1]},${f.rgb[2]},${alpha})`;
    ctx.fill();
  }
}

async function renderFrame(angle) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Fondo estudio
  const grad = ctx.createRadialGradient(W / 2, H * 0.32, 80, W / 2, H * 0.5, W * 0.8);
  grad.addColorStop(0, "#1b2432");
  grad.addColorStop(0.55, "#0e131c");
  grad.addColorStop(1, "#05070c");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Aro/turntable en el piso
  const baseY = project([0, GROUND, 0])[1];
  ctx.save();
  ctx.strokeStyle = "rgba(0,108,255,0.35)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(W / 2, baseY + 24, 430, 88, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Reflejo del auto en el piso
  ctx.save();
  paint(ctx, buildFaces(angle, true), 0.18);
  // desvanecer el reflejo hacia abajo
  const fade = ctx.createLinearGradient(0, baseY, 0, H);
  fade.addColorStop(0, "rgba(8,11,18,0)");
  fade.addColorStop(0.7, "rgba(8,11,18,0.85)");
  fade.addColorStop(1, "rgba(8,11,18,1)");
  ctx.fillStyle = fade;
  ctx.fillRect(0, baseY, W, H - baseY);
  ctx.restore();

  // Sombra de contacto
  ctx.save();
  ctx.globalAlpha = 0.4;
  const sh = ctx.createRadialGradient(W / 2, baseY + 14, 20, W / 2, baseY + 14, 380);
  sh.addColorStop(0, "rgba(0,0,0,0.65)");
  sh.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sh;
  ctx.beginPath();
  ctx.ellipse(W / 2, baseY + 14, 380, 70, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Auto
  paint(ctx, buildFaces(angle, false), 1);

  return canvas.encode("jpeg", 88);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  for (let i = 0; i < FRAMES; i++) {
    const angle = (i / FRAMES) * Math.PI * 2;
    const jpg = await renderFrame(angle);
    const name = `${String(i + 1).padStart(3, "0")}.jpg`;
    await writeFile(join(OUT_DIR, name), jpg);
    process.stdout.write(`\r  Renderizando 360°... ${i + 1}/${FRAMES}`);
  }
  console.log(`\n✓ ${FRAMES} frames en public/cars/spin/${SLUG}/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
