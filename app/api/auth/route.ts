import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  changeAdminCredentials,
  validateAdminLogin,
} from "@/lib/server/adminCredentials";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "@/lib/auth/session";
import { clientKey, rateLimit } from "@/lib/server/rateLimit";

function sessionCookieOptions(maxAge = 60 * 60 * 24 * 30) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/** POST login | change | logout */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action || "login";

    if (action === "logout") {
      const cookieStore = await cookies();
      cookieStore.set(ADMIN_SESSION_COOKIE, "", { ...sessionCookieOptions(0), maxAge: 0 });
      return NextResponse.json({ success: true });
    }

    if (action === "change") {
      const rl = rateLimit(clientKey(request, "auth-change"), 10, 60_000);
      if (!rl.ok) {
        return NextResponse.json({ error: "Demasiados intentos. Espera un minuto." }, { status: 429 });
      }

      const cookieStore = await cookies();
      const session = await verifyAdminSessionToken(
        cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
      );
      if (!session) {
        return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
      }

      const {
        currentUsername,
        currentPassword,
        newUsername,
        newPassword,
      } = body as {
        currentUsername?: string;
        currentPassword?: string;
        newUsername?: string;
        newPassword?: string;
      };

      if (!currentPassword || !newUsername || !newPassword) {
        return NextResponse.json(
          { error: "Completa usuario y contraseña nuevos." },
          { status: 400 },
        );
      }

      const result = await changeAdminCredentials(
        currentUsername || session.sub,
        currentPassword,
        newUsername,
        newPassword,
      );
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      const token = await createAdminSessionToken(newUsername.trim(), false);
      cookieStore.set(ADMIN_SESSION_COOKIE, token, sessionCookieOptions());
      return NextResponse.json({ success: true, mustChange: false, username: newUsername.trim() });
    }

    // login
    const rl = rateLimit(clientKey(request, "auth-login"), 15, 60_000);
    if (!rl.ok) {
      return NextResponse.json({ error: "Demasiados intentos. Espera un minuto." }, { status: 429 });
    }

    const username = String(body.username || "admin").trim();
    const password = String(body.password || "");
    if (!password) {
      return NextResponse.json({ error: "Ingresa la contraseña" }, { status: 400 });
    }

    const result = await validateAdminLogin(username, password);
    if (!result.ok) {
      return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
    }

    const token = await createAdminSessionToken(result.username, result.mustChange);
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, token, sessionCookieOptions());

    return NextResponse.json({
      success: true,
      mustChange: result.mustChange,
      username: result.username,
    });
  } catch {
    return NextResponse.json({ error: "Error en la autenticación" }, { status: 500 });
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const session = await verifyAdminSessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    username: session.sub,
    mustChange: session.mustChange,
  });
}
