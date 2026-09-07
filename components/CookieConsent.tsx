"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "rg_cookie_consent_v1";

type Consent = "accepted" | "essential" | null;

export default function CookieConsent() {
  const [choice, setChoice] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Consent | null;
      if (stored === "accepted" || stored === "essential") setChoice(stored);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const save = (value: Exclude<Consent, null>) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    setChoice(value);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("rg-cookie-consent", { detail: value }));
    }
  };

  if (!ready || choice) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-white/12 bg-[#0c0d12]/95 px-4 py-4 shadow-[0_-8px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:flex-row sm:items-center sm:gap-5 sm:px-5">
        <p className="flex-1 text-[12px] leading-relaxed text-white/65">
          Usamos cookies técnicas y, con tu permiso, medición de tráfico para mejorar el sitio.{" "}
          <Link href="/cookies" className="font-semibold text-brand-300 underline-offset-2 hover:underline">
            Política de cookies
          </Link>
          .
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => save("essential")}
            className="rounded-lg border border-white/15 px-3.5 py-2 text-[11px] font-semibold text-white/75 transition hover:border-white/30 hover:text-white"
          >
            Solo esenciales
          </button>
          <button
            type="button"
            onClick={() => save("accepted")}
            className="rg-btn-primary rounded-lg px-3.5 py-2 text-[11px] font-bold text-white"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
