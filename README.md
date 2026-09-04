<div align="center">

<img src="public/logo.png" alt="RG Motors" width="220" />

# RG Motors — Plataforma de Autos Usados

**Plataforma web de automotora para Chile.**
Catálogo, simulación de crédito referencial Autofin, solicitud de reserva,
comparador y panel admin — estética *dark, premium*.

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-0.185-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)

</div>

---

## 📊 Estado real del stack

- **App**: Next.js (App Router) + React + TypeScript + Tailwind.
- **Persistencia**: archivos JSON locales y/o **Vercel KV** (`lib/server/db.ts`). **No** usa Supabase en esta versión.
- **Pagos**: **sin pasarelas** (WebPay / Mercado Pago / etc.). La reserva web es una **solicitud** (`Pendiente`); el abono se coordina en tienda o WhatsApp.
- **360°**: componentes existentes, pero **no forman parte del alcance de este release** comercial.
- **Admin**: autenticación por middleware + cookie firmada (`/admin/login`). Usuario/clave por defecto: `admin` / `rgmotors2026`. En el **primer ingreso** obliga a cambiar usuario y contraseña por unos más fuertes. Variables útiles: `ADMIN_SESSION_SECRET`, `CRON_SECRET`, `KV_REST_API_*`.
- **Leads**: contacto, crédito, reserva, trade-in, etc. se persisten y notifican al equipo (`lib/server/notify.ts` → log + bandeja interna; conectar SMTP/Resend después).
- **Legales**: `/privacidad`, `/terminos`, `/aviso-credito`.

---

## ✨ Sobre el proyecto

RG Motors es una automotora de vehículos de segunda mano en Puerto Montt.
Esta plataforma ofrece catálogo, simulación de crédito referencial, solicitud de
reserva, comparador y panel de administración — con estética dark premium.

> Los tours 360° (Three.js / fotos) existen en el código como capacidad técnica,
> pero **no están habilitados como promesa comercial** en este release.

---

## 🚀 Características principales

| | Función | Descripción |
|---|---------|-------------|
| 💳 | **Crédito referencial** | Simulador Autofin (pie/plazo/CAE) + envío de simulación al equipo. |
| 📅 | **Solicitud de reserva** | Formulario web sin pago online; el abono se coordina después. |
| 🚗 | **Prueba de manejo** | Agenda por sucursal, día, hora y ejecutivo. |
| 🔍 | **Catálogo con filtros** | Marca, tipo, precio, año, combustible, transmisión y orden. |
| ⚖️ | **Comparador** | Compara hasta 3 vehículos lado a lado. |
| 🤖 | **Asistente** | Widget de ayuda que recomienda autos del catálogo. |
| 📊 | **Admin** | Inventario, CRM y analítica sobre datos reales (sin KPIs inventados). |

---

## 🎨 Sistema de diseño

Paleta inspirada en marcas premium — regla **80 / 15 / 5** (oscuros / blancos / azul de marca):

| Color | Hex | Uso |
|-------|-----|-----|
| ⬛ Negro absoluto | `#090909` | Fondo principal |
| ⬛ Negro carbón | `#111315` | Header y footer |
| ⬛ Gris grafito | `#181A1F` | Tarjetas |
| 🟦 Azul premium | `#006CFF` | Botones, links, foco, CTA |
| 🟩 Verde | `#22C55E` | Crédito aprobado / disponible |
| 🟨 Amarillo | `#FACC15` | Reserva pendiente |
| 🟥 Rojo | `#EF4444` | Error / vendido |
| ⬜ Blanco | `#F8F9FB` | Texto principal |

> El objetivo: que **el vehículo sea el protagonista** y la interfaz pase desapercibida,
> con el azul eléctrico guiando la atención hacia las acciones importantes.

---

## 🛠️ Stack tecnológico

- **Frontend**: **Next.js** (App Router) · **React** · **TypeScript** · **Tailwind CSS**
- **Persistencia**: JSON + **Vercel KV** (opcional). Sin Supabase en este release.
- **Hosting**: **Vercel**

---

## ⚡ Cómo ejecutarlo

```bash
# 1. Instalar dependencias
npm install

# 2. Entorno de desarrollo  ->  http://localhost:3000
npm run dev

# 3. Build de producción
npm run build
npm start
```

### Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run lint` | Linter |
| `npm run demo:frames` | Genera frames 360° de demostración (opcional) |
| `node scripts/build-cx5-spin.mjs` | Monta el giro 360° del Mazda CX-5 (opcional) |
| `node scripts/process-logo.mjs` | Procesa el logo (fondo transparente) |

---

## 📂 Estructura del proyecto

```
app/
  (site)/                    # Páginas públicas (header, footer)
    page.tsx                 # Home
    catalogo/  comparador/  simulador/  contacto/
    privacidad/  terminos/  aviso-credito/
    vehiculo/[slug]/         # Ficha del auto
    reserva/[slug]/          # Solicitud de reserva (sin pago)
    prueba-manejo/[slug]/    # Agenda de prueba de manejo
  cuenta/                    # Portal cliente (próximamente)
  admin/                     # Panel administrador
components/
  SiteHeader · SiteFooter · ChatWidget · Logo
  VehicleCard · ReserveFlow · TestDriveForm
lib/
  company.ts · vehicles.ts · analytics.ts
  finance/autofin.ts
  server/db.ts · notify · rateLimit · *Store
```

---

## 🗺️ Roadmap

- [x] Persistencia JSON / Vercel KV y admin con auth middleware.
- [x] Solicitud de reserva sin pasarela de pago.
- [ ] Pasarela real (Transbank WebPay Plus u otra).
- [ ] Portal de cliente activo.
- [ ] Tours 360° habilitados comercialmente para el inventario.
- [ ] Notificaciones email (Resend/SMTP) sobre `notifyTeam`.

---

## 👤 Autor

Proyecto desarrollado para **RG Motors** por [**MathiasAlejandr0**](https://github.com/MathiasAlejandr0).

<div align="center">
<sub>Hecho con ❤️ y mucho ☕ en Chile.</sub>
</div>
