# RG MOTORS — SUCURSAL PUERTO MONTT
## SOLICITUD FORMAL: ACCESOS, DECISIONES Y APROBACIONES
### Insumos, Infraestructura Cloud $0 e Integraciones Requeridas para el Proyecto

| Metadato | Detalle |
| :--- | :--- |
| **Código** | `RG-PM-SOL-001` |
| **Versión** | `1.1 (Actualizada: Arquitectura Cloud Free Tier Supabase + Cloudflare R2)` |
| **Fecha** | Agosto 2026 |
| **Clasificación** | Uso interno — Confidencial |
| **Alcance** | Sucursal Puerto Montt |

---

## 1. Objetivo del Documento
Formalizar las solicitudes y decisiones técnicas que la Empresa debe adoptar para el despliegue del sitio web de **RG Motors Puerto Montt** (dominio sugerido `rgmotorchile.cl`). 

El objetivo principal de esta versión actualizada es ratificar la adopción de una arquitectura de **Costo $0 Mensual en la Nube**, capaz de soportar **más de 400 vehículos, 2.000 fotos y 400 videos** mediante la combinación de **Vercel Free**, **Supabase Free** y **Cloudflare R2 Free**.

---

## 2. Decisiones de Infraestructura Cloud ($0 CLP / mes)

Se solicita la aprobación formal de la siguiente matriz de infraestructura:

| Servicio | Proveedor | Plan | Costo Mensual | Justificación Técnica | Decisión Empresa |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **Hosting Web** | **Vercel** | Free (Hobby) | **$0 CLP** | Despliegue de Next.js, CDN global, certificado SSL automático y conexión a `rgmotorchile.cl`. | ☐ Aprobado |
| **Base de Datos & Auth** | **Supabase** | Free Tier | **$0 CLP** | Base PostgreSQL para 400+ autos (usa ~2 MB de 500 MB disponibles) + login seguro de administradores. | ☐ Aprobado |
| **Almacenamiento Fotos & Videos** | **Cloudflare R2** | Free Tier | **$0 CLP** | 10 GB de almacenamiento gratis + **$0 costo por transferencia/descarga (tráfico ilimitado)** para 2.000 fotos y 400 videos. | ☐ Aprobado |
| **Dominio `.cl`** | **NIC Chile** | Anual | **$9.990 CLP / año** | Único costo recurrente obligatorio para registrar el dominio oficial de la empresa. | ☐ Aprobado |

---

## 3. Dominio Oficial (.cl)

Se solicita definir y registrar el dominio oficial en [NIC Chile](https://www.nic.cl) a nombre del RUT de la Empresa:

* ☐ **Opción 1 (Recomendada):** `rgmotorchile.cl`
* ☐ **Opción 2:** `rgmotorspuertomontt.cl`
* ☐ **Opción 3:** `rgmotors.cl` *(si estuviera disponible o negociado)*

**Titular del Dominio:** Razón Social / RUT RG Motors  
**Correo de administración en NIC Chile:** __________________________________

---

## 4. Solicitud de Fotografías, Videos y Datos de Stock

Para poblar el catálogo inicial de 400 vehículos, se requiere la entrega de material audiovisual mediante carpeta compartida (Google Drive o OneDrive):

### Estructura sugerida por vehículo:
`MARCA_MODELO_AÑO_PATENTEINTERNA/`
* `/fotos/`: 5 a 8 fotos (frente, trasera, laterales, interior, tablero, motor). Formato JPG/PNG/WebP.
* `/video_360/`: 1 video corto (15 a 30 segundos) o fotogramas 360° dando la vuelta al auto.

### Planilla de datos (Excel / Google Sheets):
* Marca, modelo, versión, año, precio, kilometraje, tipo de combustible, transmisión, tracción, estado (Disponible / Vendido).

---

## 5. Integraciones Comerciales (WebPay y Financiamiento)

* **WebPay Plus (Transbank):**
  * ☐ Autorizamos gestionar afiliación con Transbank cuando esté listo el catálogo.
  * ☐ Por ahora iniciar en v1 con contacto directo por WhatsApp y reserva asistida.
* **Financiamiento Automotriz (Forum / Santander Consumer u otra):**
  * Financiera preferente: __________________________________
  * Canal inicial: Simulador de cuotas en la web + derivación directa a ejecutivo comercial por WhatsApp / formulario.

---

## 6. Aprobaciones Formales

| Rol | Nombre | Firma | Fecha |
| :--- | :--- | :---: | :---: |
| **Solicitante / Responsable Técnico** | Mathias Alejandro | ___________________ | _____/_____/2026 |
| **Representante RG Motors Puerto Montt** | _______________________ | ___________________ | _____/_____/2026 |
| **Gerencia General** | _______________________ | ___________________ | _____/_____/2026 |
