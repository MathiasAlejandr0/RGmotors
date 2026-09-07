/**
 * Guardas anti-wipe para sync de inventario desde Sheets.
 * Evita vaciar el catálogo si la planilla falla o viene incompleta.
 */

export type MassArchiveGuardInput = {
  /** Filas activas válidas leídas de la hoja (no vendidas). */
  sheetActiveCount: number;
  /** Unidades activas actuales en el store. */
  currentActiveCount: number;
  /** Cuántas se archivarían por no aparecer en la hoja. */
  wouldArchiveCount: number;
  /** Umbral de caída relativa (0–1). Default 35%. */
  maxDropRatio?: number;
  /** Mínimo de stock actual para aplicar ratio. */
  minStockForRatio?: number;
};

export type MassArchiveGuardResult =
  | { abortAll: true; skipArchive: true; reason: string }
  | { abortAll: false; skipArchive: true; reason: string }
  | { abortAll: false; skipArchive: false };

/**
 * - Hoja vacía → abortar sync completo (no escribir).
 * - Caída masiva sospechosa → aplicar altas/updates pero NO archivar faltantes.
 */
export function evaluateSheetWipeGuard(
  input: MassArchiveGuardInput,
): MassArchiveGuardResult {
  const maxDropRatio = input.maxDropRatio ?? 0.35;
  const minStockForRatio = input.minStockForRatio ?? 5;

  if (input.sheetActiveCount <= 0) {
    return {
      abortAll: true,
      skipArchive: true,
      reason:
        "Planilla sin filas activas válidas — sync abortado (anti-wipe). Revisa la hoja o el scrape.",
    };
  }

  if (
    input.currentActiveCount >= minStockForRatio &&
    input.wouldArchiveCount >= 3
  ) {
    const ratio = input.wouldArchiveCount / input.currentActiveCount;
    if (ratio > maxDropRatio) {
      return {
        abortAll: false,
        skipArchive: true,
        reason: `Caída sospechosa del stock (${Math.round(ratio * 100)}% / ${input.wouldArchiveCount} unidades). Se actualizan precios/km y altas, pero no se archiva masivo.`,
      };
    }
  }

  return { abortAll: false, skipArchive: false };
}

/** Inferencia conservadora de carrocería; sin inventar diésel/manual. */
export function guessBodyTypeFromModel(model: string): string {
  const m = model.toUpperCase();
  if (
    /HILUX|L200|NAVARA|AMAROK|COLORADO|DMAX|T60|RAPTOR|SAVEIRO|KATANA|PORTER|RANGER/.test(
      m,
    )
  ) {
    return "Camioneta";
  }
  if (/PARTNER|EXPERT|XZU|FURGON|FURGÓN/.test(m)) return "Furgón";
  if (/RAIZE|FORESTER|2008|SUZUKI|SUV|WRX/.test(m)) return "SUV";
  if (/ML300|SEDAN|SEDÁN/.test(m)) return "Sedán";
  return "Por confirmar";
}
