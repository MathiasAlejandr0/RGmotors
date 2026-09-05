import { describe, expect, it } from "vitest";
import { clientKey, rateLimit } from "@/lib/server/rateLimit";

describe("rateLimit", () => {
  it("permite hasta el límite y luego bloquea", () => {
    const key = `test-burst-${Date.now()}-${Math.random()}`;
    const limit = 3;
    const windowMs = 60_000;

    expect(rateLimit(key, limit, windowMs).ok).toBe(true);
    expect(rateLimit(key, limit, windowMs).ok).toBe(true);
    expect(rateLimit(key, limit, windowMs).ok).toBe(true);
    expect(rateLimit(key, limit, windowMs).ok).toBe(false);
  });

  it("reinicia ventana cuando expira", async () => {
    const key = `test-window-${Date.now()}-${Math.random()}`;
    expect(rateLimit(key, 1, 15).ok).toBe(true);
    expect(rateLimit(key, 1, 15).ok).toBe(false);
    await new Promise((r) => setTimeout(r, 25));
    expect(rateLimit(key, 1, 15).ok).toBe(true);
  });

  it("clientKey usa x-forwarded-for", () => {
    const req = new Request("http://localhost/api/contact", {
      headers: { "x-forwarded-for": "203.0.113.10, 10.0.0.1" },
    });
    expect(clientKey(req, "contact")).toBe("contact:203.0.113.10");
  });

  it("clientKey cae a unknown sin IP", () => {
    const req = new Request("http://localhost/api/contact");
    expect(clientKey(req, "contact")).toBe("contact:unknown");
  });
});
