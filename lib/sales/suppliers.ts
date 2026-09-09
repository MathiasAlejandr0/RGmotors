/** Empresas que pueden registrar una venta en el historial. */
export const SALE_SUPPLIERS = [
  "RG Motors",
  "Unidades Chile",
  "Salgado Automotoriz",
] as const;

export type SaleSupplier = (typeof SALE_SUPPLIERS)[number];

export function isSaleSupplier(value: unknown): value is SaleSupplier {
  return (
    typeof value === "string" &&
    (SALE_SUPPLIERS as readonly string[]).includes(value)
  );
}
