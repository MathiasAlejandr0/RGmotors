# Estado real del proyecto RG Motors

Documento de alcance para práctica profesional y operación.
Última actualización: 2026-09.

## Resumen ejecutivo

| Pregunta | Respuesta |
|----------|-----------|
| ¿Hay contrato WebPay / Transbank? | **No.** No hay cobro online. |
| ¿La reserva web cobra? | **No.** Es solicitud (`Pendiente`); abono por WhatsApp/tienda. |
| ¿Hay Supabase / SQL? | **No.** JSON local y/o Vercel KV. |
| ¿360° es promesa comercial? | **No en este release** (código existe, flag apagado). |
| ¿Email al equipo? | **Stub** (`notifyTeam` → log + `notifications.json`). |
| ¿Listo para producción comercial dura? | **MVP + hardening en curso** — ver `docs/ROADMAP.md`. |

## Qué está implementado y usable

### Sitio público
- Home, catálogo con filtros, ficha de vehículo, comparador.
- Simulador de crédito **referencial** (lógica Autofin-like: pie ≥20%, plazo ≤48, cuota francesa).
- Disclaimers SERNAC / aviso de crédito (`/aviso-credito`).
- Páginas legales: `/privacidad`, `/terminos`.
- Formularios: contacto, solicitud de crédito, reserva, prueba de manejo, trade-in, alertas de precio.
- WhatsApp y datos de sucursal (`lib/company.ts`).

### Admin
- Login con cookie firmada (HMAC) + middleware.
- Obliga cambio de credenciales por defecto en el primer ingreso.
- CRM de leads, inventario, settings, sync Google Sheets / Drive (según env y permisos de planillas).

### Persistencia
- `lib/server/db.ts`: Vercel KV si hay `KV_REST_API_*`; si no, `data/` o `os.tmpdir()` en serverless.
- **En producción Vercel se requiere KV** (o equivalente) para no perder leads e inventario.

## Qué NO está (y no se debe vender como hecho)

| Ítem | Estado | Nota |
|------|--------|------|
| **WebPay Plus / Transbank** | Bloqueado por contrato comercial | Roadmap fase pagos |
| Mercado Pago / Flow / OnePay | No | Idem |
| Portal cliente `/cuenta` | Stub “próximamente” | Roadmap |
| Tours 360° comerciales | Código técnico, no release | Roadmap |
| Email/SMS transaccional | Stub | Conectar Resend/SMTP |
| Base SQL (Postgres) | No | Opcional futuro |
| App móvil nativa | No | Fuera de alcance |

## Pagos y WebPay (posición oficial del proyecto)

1. **No hay integración WebPay** en el código de producción actual.
2. La reserva online es una **solicitud de interés**, no un contrato de compraventa ni un cobro.
3. Cuando exista contrato Transbank (commerce code + llaves), se implementará según `docs/ROADMAP.md` fase “Pagos”.
4. Hasta entonces, cualquier copy de UI debe decir “solicitud / coordinar abono”, nunca “pagar ahora” con pasarela.

## Seguridad (baseline documentado)

- Middleware protege `/admin/*` (salvo login) y APIs mutadoras / listados con PII.
- POST de leads puede ser público; **GET de listados de leads exige sesión admin** (`lib/auth/apiAccess.ts`).
- Rate limit en memoria en varios endpoints (limitación conocida en serverless multi-instancia).
- Secretos: ver `.env.example`. No publicar contraseñas en README de producción.

## Cómo correr tests

```bash
npm install
npm run lint
npm run test          # Vitest (unit)
npm run test:e2e      # Playwright (smoke + APIs)
npm run test:all      # lint + unit + e2e
```

## Documentos relacionados

- `docs/ROADMAP.md` — prioridades para nota máxima / hardening / WebPay futuro
- `.env.example` — variables de entorno
- `README.md` — overview del repo
