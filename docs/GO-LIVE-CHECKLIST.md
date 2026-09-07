# Go-live — checklist (DNS mañana)

Dominio NIC pendiente: configurar DNS cuando tengas el código del correo.
Hasta entonces el sitio opera en `https://rg-motors.vercel.app`.

## Ya implementado en código (este deploy)

- Anti-wipe sync Google Sheets
- Ficha API `/api/vehicles/[slug]` oculta borradores/vendidos
- Credenciales admin: no “éxito falso”; write verificado
- KV obligatorio en prod; Blob obligatorio para uploads
- Rate limit distribuido vía KV
- Cron: solo `Authorization: Bearer` en producción
- Cookie de sesión alineada a 7 días
- CSP básica
- `notifyTeam` → Resend si hay `RESEND_API_KEY`
- `GET /api/health` para chequear env
- `COMPANY_RUT` / `COMPANY_LEGAL_NAME` por env

## Configurar hoy en Vercel (sin NIC)

Project → Settings → Environment Variables (Production):

| Variable | Notas |
|----------|--------|
| `ADMIN_SESSION_SECRET` | ≥32 chars aleatorios |
| `CRON_SECRET` | ≥16 chars (Vercel Cron lo usa como Bearer) |
| `KV_REST_API_URL` + `KV_REST_API_TOKEN` | Storage → KV |
| `BLOB_READ_WRITE_TOKEN` | Storage → Blob |
| `NEXT_PUBLIC_SITE_URL` | Por ahora `https://rg-motors.vercel.app` |
| `COMPANY_RUT` | RUT real de la empresa |
| `COMPANY_LEGAL_NAME` | Razón social |
| `RESEND_API_KEY` + `EMAIL_FROM` + `NOTIFY_EMAIL` | Opcional pero recomendado |

Luego: Redeploy → abrir `/admin` → cambiar usuario y password (must-change).

Verificar: `GET /api/health` → `ok: true`.

## Mañana (DNS NIC)

1. En NIC: registros A/CNAME hacia Vercel (docs Vercel domains).
2. En Vercel: Add Domain `rgmotors.cl` (+ `www`).
3. Actualizar `NEXT_PUBLIC_SITE_URL=https://rgmotors.cl` y redeploy.
4. Cloudflare (si aplica): no cachear `/admin*` ni `/api/auth*`.

## Smoke post-deploy

```bash
npm run test:all
```

Checklist ampliado: `docs/SEGURIDAD.md`.
