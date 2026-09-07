/**
 * Rate limit: memoria local + KV distribuido cuando está configurado.
 */
import { kv } from "@vercel/kv";
import { isKvReady } from "@/lib/server/storageHealth";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Rate limit en memoria del proceso (fallback / local).
 */
export function rateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000,
): { ok: boolean; remaining: number } {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (current.count >= limit) {
    return { ok: false, remaining: 0 };
  }
  current.count += 1;
  return { ok: true, remaining: limit - current.count };
}

/**
 * Preferido en APIs: usa Vercel KV/Upstash si hay credenciales (multi-instancia).
 */
export async function rateLimitAsync(
  key: string,
  limit = 20,
  windowMs = 60_000,
): Promise<{ ok: boolean; remaining: number }> {
  if (isKvReady()) {
    try {
      const redisKey = `rl:${key}`;
      const count = await kv.incr(redisKey);
      if (count === 1) {
        await kv.expire(redisKey, Math.max(1, Math.ceil(windowMs / 1000)));
      }
      if (count > limit) {
        return { ok: false, remaining: 0 };
      }
      return { ok: true, remaining: Math.max(0, limit - count) };
    } catch (err) {
      console.warn("[rateLimit] KV falló, usando memoria:", err);
    }
  }
  return rateLimit(key, limit, windowMs);
}

export function clientKey(request: Request, prefix: string): string {
  const fwd = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = fwd || request.headers.get("x-real-ip") || "unknown";
  return `${prefix}:${ip}`;
}
