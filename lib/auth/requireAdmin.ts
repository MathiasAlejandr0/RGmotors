import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth/session";

/**
 * Defense-in-depth: exige cookie de admin válida (sin mustChange).
 * El middleware ya filtra, pero las mutaciones sensibles deben revalidar aquí.
 */
export async function requireAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = await verifyAdminSessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );
  return Boolean(session && !session.mustChange);
}
