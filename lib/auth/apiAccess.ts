/**
 * Política de acceso a APIs: qué es público vs qué exige sesión admin.
 * Extraído del middleware para poder testearlo sin NextRequest completo.
 */

/** Prefijos donde POST crea leads/sesión (GET de listados NO es público). */
const LEAD_OR_AUTH_PREFIXES = [
  "/api/auth",
  "/api/car-requests",
  "/api/test-drives",
  "/api/price-alerts",
  "/api/trade-in",
  "/api/contact",
  "/api/credits",
  "/api/reservations",
  "/api/track",
  "/api/simulations",
] as const;

/** GET de catálogo/ajustes públicos (sin listar borradores admin). */
const PUBLIC_GET_PREFIXES = [
  "/api/vehicles",
  "/api/spin",
  "/api/settings",
  "/api/photos",
  "/api/catalog",
] as const;

/** Prefijos de leads cuyo GET lista PII y nunca debe ser público. */
export const PII_LIST_PREFIXES = [
  "/api/car-requests",
  "/api/test-drives",
  "/api/price-alerts",
  "/api/trade-in",
  "/api/credits",
  "/api/reservations",
  "/api/contact",
  "/api/track",
  "/api/simulations",
] as const;

function matchesPrefix(pathname: string, prefix: string): boolean {
  const p = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
  return pathname === p || pathname.startsWith(`${p}/`);
}

/**
 * @returns true si la petición puede pasar sin cookie de admin.
 */
export function isPublicApi(
  pathname: string,
  method: string,
  searchParams?: URLSearchParams | null,
): boolean {
  if (pathname.startsWith("/api/cron")) return true;

  if (LEAD_OR_AUTH_PREFIXES.some((p) => matchesPrefix(pathname, p))) {
    // Listados con PII: solo POST (crear) es público; GET/PATCH/PUT/DELETE requieren auth
    if (method === "GET" && PII_LIST_PREFIXES.some((p) => matchesPrefix(pathname, p))) {
      return false;
    }

    if (
      (method === "PATCH" || method === "PUT" || method === "DELETE") &&
      (matchesPrefix(pathname, "/api/credits/") ||
        matchesPrefix(pathname, "/api/reservations/") ||
        matchesPrefix(pathname, "/api/vehicles/") ||
        matchesPrefix(pathname, "/api/car-requests/") ||
        matchesPrefix(pathname, "/api/test-drives/") ||
        matchesPrefix(pathname, "/api/price-alerts/") ||
        matchesPrefix(pathname, "/api/trade-in/"))
    ) {
      return false;
    }

    if (method === "PUT" && pathname.startsWith("/api/vehicles")) return false;
    if (method === "POST" && pathname.startsWith("/api/vehicles")) return false;
    return true;
  }

  if (
    method === "GET" &&
    PUBLIC_GET_PREFIXES.some((p) => matchesPrefix(pathname, p))
  ) {
    // ?admin=true en vehículos no es público (borradores / vista admin)
    if (
      pathname.startsWith("/api/vehicles") &&
      searchParams?.get("admin") === "true"
    ) {
      return false;
    }
    return true;
  }

  return false;
}
