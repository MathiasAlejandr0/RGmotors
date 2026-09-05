# Operación de rendimiento — RG Motors

Guía para volumen ~70–100 vehículos × 6–10 fotos (+ 360 futuro)
con experiencia fluida detrás de Cloudflare + Vercel.

## Arquitectura de datos (óptima)

| Dato | Dónde | Notas |
|------|--------|------|
| Inventario / leads / settings | **Vercel KV** | Obligatorio en `VERCEL_ENV=production` |
| Fotos galería / frames 360 | **Vercel Blob** (`BLOB_READ_WRITE_TOKEN`) | Durable + CDN; fallback local solo en dev |
| Edge cache | **Cloudflare** delante del dominio | Cachea `/cars/*`, `/_next/static/*`, APIs con SWR |

Sin Blob en producción: las subidas a `public/` en Vercel **no son confiables**.

## Variables mínimas (producción)

```bash
ADMIN_SESSION_SECRET=...
CRON_SECRET=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
BLOB_READ_WRITE_TOKEN=...
NEXT_PUBLIC_SITE_URL=https://tudominio.cl
```

Ver `.env.example`.

## Qué ya hace el código

1. **Caché en memoria** del listado de vehículos (30s) + invalidación al guardar.
2. **API liviana** `GET /api/vehicles?fields=card` (sin galerías completas).
3. **Cache-Control** en catálogo/fotos (`s-maxage` + `stale-while-revalidate`) para Cloudflare.
4. **Headers** en `vercel.json` para `/cars/*` y estáticos.
5. **Uploads** vía `lib/server/mediaStorage.ts` → Blob si hay token.
6. **360 progresivo**: `PhotoSpin360` carga primero el frame activo + vecinos, luego el resto.
7. **`showSpin360`** del admin se respeta en `VehicleViewer`.
8. Imágenes de cards con `loading="lazy"`.

## Checklist Cloudflare

1. Proxy naranja (proxied) al dominio de Vercel.
2. Cache Level: Standard; respetar `Cache-Control` del origen.
3. Opcional: Cache Rule para `/cars/*` y `*.public.blob.vercel-storage.com`.
4. Polish / WebP opcional en Cloudflare (Images) si el plan lo permite.
5. No cachear `/admin*` ni `/api/auth*`.

## Recomendaciones de captura (fluidez real)

| Uso | Frames / fotos | Peso objetivo |
|-----|----------------|---------------|
| Galería | 6–10 | 150–400 KB WebP/JPEG c/u |
| Tour 360 | 24–36 (ideal) o máx. 72 | 80–150 KB WebP c/u |

Más de ~100 frames full-res = primera interacción más lenta aunque el preload sea progresivo.

## Health en runtime

Al arrancar, el server loguea avisos si faltan KV/Blob en producción
(`lib/server/storageHealth.ts`). En prod **sin KV**, las escrituras JSON se rechazan.

## Pruebas rápidas

```bash
npm run test
npm run test:e2e
curl -I https://tudominio.cl/api/vehicles?fields=card
# Esperar Cache-Control: s-maxage=60...
```
