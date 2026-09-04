import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth/session";

/** APIs públicas (POST/GET) para leads y catálogo. */
const PUBLIC_API_PREFIXES = [
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
];

const PUBLIC_GET_PREFIXES = [
  "/api/vehicles",
  "/api/spin",
  "/api/settings",
  "/api/photos",
];

function isPublicApi(pathname: string, method: string): boolean {
  if (pathname.startsWith("/api/cron")) return true;

  if (PUBLIC_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    // Listados admin (GET) de créditos/reservaciones siguen protegidos salvo POST creación
    if (
      method === "GET" &&
      (pathname.startsWith("/api/credits") ||
        pathname.startsWith("/api/reservations") ||
        pathname.startsWith("/api/contact") ||
        pathname.startsWith("/api/track") ||
        pathname.startsWith("/api/simulations"))
    ) {
      return false;
    }
    // Mutaciones admin sobre un recurso (PATCH/PUT/DELETE) protegidas
    if (
      (method === "PATCH" || method === "PUT" || method === "DELETE") &&
      (pathname.startsWith("/api/credits/") ||
        pathname.startsWith("/api/reservations/") ||
        pathname.startsWith("/api/vehicles/") ||
        pathname.startsWith("/api/car-requests/") ||
        pathname.startsWith("/api/test-drives/") ||
        pathname.startsWith("/api/price-alerts/") ||
        pathname.startsWith("/api/trade-in/"))
    ) {
      return false;
    }
    // PUT vehículos = admin
    if (method === "PUT" && pathname.startsWith("/api/vehicles")) return false;
    if (method === "POST" && pathname.startsWith("/api/vehicles")) return false;
    return true;
  }

  if (
    method === "GET" &&
    PUBLIC_GET_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))
  ) {
    return true;
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  const isProtectedAdminPath =
    pathname.startsWith("/admin") && pathname !== "/admin/login";

  const isProtectedApi =
    pathname.startsWith("/api/") && !isPublicApi(pathname, method);

  if (isProtectedAdminPath || isProtectedApi) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const session = await verifyAdminSessionToken(token);

    if (!session) {
      if (isProtectedApi) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Forzar cambio de credenciales: solo login + change API + página login
    if (session.mustChange) {
      const allowedWhileMustChange =
        pathname === "/admin/login" ||
        pathname.startsWith("/api/auth");
      if (!allowedWhileMustChange) {
        if (isProtectedApi) {
          return NextResponse.json(
            { error: "Debes cambiar usuario y contraseña antes de continuar", mustChange: true },
            { status: 403 },
          );
        }
        return NextResponse.redirect(new URL("/admin/login?change=1", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
