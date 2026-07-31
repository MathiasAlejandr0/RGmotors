/**
 * Datos de contacto de RG Motors (demo de presentación).
 * Cambia estos valores cuando tengas los datos reales de la empresa.
 */
export const COMPANY = {
  name: "RG Motors",
  tagline: "Autos usados con experiencia 360°",
  phoneDisplay: "+56 9 8765 4321",
  /** Solo dígitos, formato internacional sin + */
  whatsapp: "56987654321",
  email: "contacto@rgmotors.cl",
  address: "Av. Apoquindo 4775, Las Condes, Santiago",
  hours: "Lun a Vie 9:00–19:00 · Sáb 10:00–14:00",
  website: "www.rgmotors.cl",
};

/** Link de WhatsApp con mensaje prearmado. */
export function whatsappLink(message: string): string {
  return `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(message)}`;
}
