/**
 * Datos de contacto oficiales de RG Motors Chile.
 */
export const COMPANY = {
  name: "RG Motors",
  tagline: "Autos usados con experiencia 360°",
  phoneDisplay: "+56 9 8765 4321",
  /** Solo dígitos, formato internacional sin + */
  whatsapp: "56987654321",
  email: "administracion@rgmotorschile.cl",
  address: "Av. Cardonal / El Tepual (Cruce Ruta 5 Sur), Puerto Montt",
  hours: "Lun a Vie 9:00–19:00 · Sáb 10:00–14:00",
  website: "www.rgmotors.cl",
  instagram: "https://www.instagram.com/_rgmotors/",
  facebook: "https://www.facebook.com/automotoraga?locale=es_LA",
};

/** Link de WhatsApp con mensaje prearmado. */
export function whatsappLink(message: string): string {
  return `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(message)}`;
}
