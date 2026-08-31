import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD || "rgmotors2026"; // Fallback para desarrollo local

    if (password === adminPassword) {
      cookies().set("rgmotors_session", adminPassword, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 días
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Error en la autenticación" }, { status: 500 });
  }
}
