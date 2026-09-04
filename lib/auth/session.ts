/**
 * Sesiones firmadas compatibles con Edge Middleware (Web Crypto).
 */

const encoder = new TextEncoder();

function getSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "rgmotors-dev-session-secret-change-me"
  );
}

async function hmac(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return bufferToBase64Url(sig);
}

function bufferToBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToJson<T>(value: string): T | null {
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    return JSON.parse(atob(padded + pad)) as T;
  } catch {
    return null;
  }
}

function jsonToBase64Url(value: unknown): string {
  const json = JSON.stringify(value);
  return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export type AdminSessionPayload = {
  sub: string;
  mustChange: boolean;
  iat: number;
  exp: number;
};

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export async function createAdminSessionToken(
  username: string,
  mustChange: boolean,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSessionPayload = {
    sub: username,
    mustChange,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const body = jsonToBase64Url(payload);
  const signature = await hmac(body);
  return `${body}.${signature}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined | null,
): Promise<AdminSessionPayload | null> {
  if (!token || !token.includes(".")) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = await hmac(body);
  if (expected !== signature) return null;
  const payload = base64UrlToJson<AdminSessionPayload>(body);
  if (!payload?.sub || !payload.exp) return null;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

export const ADMIN_SESSION_COOKIE = "rgmotors_session";
