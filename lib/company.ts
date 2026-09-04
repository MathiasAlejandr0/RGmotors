/**
 * Datos de contacto oficiales de RG Motors Chile.
 */
export const COMPANY = {
  name: "RG Motors",
  tagline: "Autos usados seleccionados en Puerto Montt",
  phoneDisplay: "+56 9 5907 3127",
  /** Solo dígitos, formato internacional sin + */
  whatsapp: "56959073127",
  email: "administracion@rgmotorschile.cl",
  address: "Av. El Tepual (Ex Banco de Chile), Puerto Montt",
  hours: "Lun a Vie 9:00–19:00 · Sáb 10:00–14:00",
  website: "www.rgmotors.cl",
  instagram: "https://www.instagram.com/_rgmotors/",
  facebook: "https://www.facebook.com/automotoraga?locale=es_LA",
};

/**
 * Canal concesionario Autofin (simulador oficial).
 * Las cuotas de este portal son las mismas que se usan en sucursal.
 */
export const AUTOFIN_PARTNER = {
  cesId: "C891S89101",
  name: "Autofin",
  simulatorBaseUrl: "https://solicitatufinanciamiento.autofin.cl/",
};

/** URL del simulador oficial Autofin para RG Motors. */
export function autofinSimulatorUrl(extraParams?: Record<string, string>): string {
  const url = new URL(AUTOFIN_PARTNER.simulatorBaseUrl);
  url.searchParams.set("ces_id", AUTOFIN_PARTNER.cesId);
  if (extraParams) {
    for (const [key, value] of Object.entries(extraParams)) {
      if (value) url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

/** Link de WhatsApp con mensaje prearmado. */
export function whatsappLink(message: string): string {
  return `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(message)}`;
}
