/**
 * Prefijo para GitHub Pages (ej. /RGmotors). Vacío en local/Vercel.
 * next/link respeta basePath solo; <img> y fetch a /public necesitan esto.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function asset(path: string): string {
  if (!path) return basePath || "/";
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalized}`;
}
