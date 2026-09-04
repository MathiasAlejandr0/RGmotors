import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { readJson, writeJson } from "@/lib/server/db";

const FILENAME = "admin-credentials.json";

export const DEFAULT_ADMIN_USERNAME = "admin";
export const DEFAULT_ADMIN_PASSWORD = "rgmotors2026";

type StoredCredentials = {
  username: string;
  /** scrypt hash: salt:hex */
  passwordHash: string;
  mustChangePassword: boolean;
  updatedAt: string;
};

function hashPassword(password: string, salt?: string): string {
  const realSalt = salt || randomBytes(16).toString("hex");
  const derived = scryptSync(password, realSalt, 64).toString("hex");
  return `${realSalt}:${derived}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(expected, derived);
}

function defaultCredentials(): StoredCredentials {
  return {
    username: DEFAULT_ADMIN_USERNAME,
    passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
    mustChangePassword: true,
    updatedAt: new Date().toISOString(),
  };
}

export async function getAdminCredentials(): Promise<StoredCredentials> {
  return readJson<StoredCredentials>(FILENAME, defaultCredentials());
}

export async function validateAdminLogin(
  username: string,
  password: string,
): Promise<{ ok: true; mustChange: boolean; username: string } | { ok: false }> {
  const creds = await getAdminCredentials();
  const userOk = username.trim().toLowerCase() === creds.username.toLowerCase();
  const passOk = verifyPassword(password, creds.passwordHash);
  if (!userOk || !passOk) return { ok: false };
  return {
    ok: true,
    mustChange: creds.mustChangePassword,
    username: creds.username,
  };
}

/** Requisitos mínimos de contraseña fuerte. */
export function validateStrongPassword(password: string): string | null {
  if (password.length < 10) return "La contraseña debe tener al menos 10 caracteres.";
  if (!/[A-Z]/.test(password)) return "Debe incluir al menos una mayúscula.";
  if (!/[a-z]/.test(password)) return "Debe incluir al menos una minúscula.";
  if (!/[0-9]/.test(password)) return "Debe incluir al menos un número.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Debe incluir al menos un símbolo.";
  if (password === DEFAULT_ADMIN_PASSWORD) return "No puedes reutilizar la contraseña por defecto.";
  return null;
}

export function validateStrongUsername(username: string): string | null {
  const u = username.trim();
  if (u.length < 4) return "El usuario debe tener al menos 4 caracteres.";
  if (!/^[a-zA-Z0-9._-]+$/.test(u)) return "Usuario: solo letras, números, punto, guion o guion bajo.";
  if (u.toLowerCase() === DEFAULT_ADMIN_USERNAME && process.env.ALLOW_DEFAULT_ADMIN_USER !== "1") {
    // Permitimos mantener "admin" solo si también cambian la password; no forzar otro user name estrictamente
    // pero pedimos que no sea trivialmente "admin" si quieren seguridad — el usuario pidió cambiar usuario Y contraseña.
    // Forzamos cambio de usuario distinto al default.
    return "Elige un usuario distinto a \"admin\".";
  }
  return null;
}

export async function changeAdminCredentials(
  currentUsername: string,
  currentPassword: string,
  newUsername: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const login = await validateAdminLogin(currentUsername, currentPassword);
  if (!login.ok) return { ok: false, error: "Credenciales actuales incorrectas." };

  const userErr = validateStrongUsername(newUsername);
  if (userErr) return { ok: false, error: userErr };
  const passErr = validateStrongPassword(newPassword);
  if (passErr) return { ok: false, error: passErr };

  const next: StoredCredentials = {
    username: newUsername.trim(),
    passwordHash: hashPassword(newPassword),
    mustChangePassword: false,
    updatedAt: new Date().toISOString(),
  };
  await writeJson(FILENAME, next);
  return { ok: true };
}

/** Fingerprint no reversible para logs. */
export function credentialFingerprint(username: string): string {
  return createHash("sha256").update(username.toLowerCase()).digest("hex").slice(0, 12);
}
