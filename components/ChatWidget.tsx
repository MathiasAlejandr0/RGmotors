"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { asset } from "@/lib/asset";
import { vehicles, formatCLP } from "@/lib/vehicles";

type Msg = { role: "user" | "ai"; text: string; cars?: string[] };

const SUGGESTIONS = [
  "SUV automático bajo $16M",
  "Camioneta 4x4 diésel",
  "Auto económico para ciudad",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "ai",
      text: "¡Hola! Soy RG AI 🤖 Cuéntame qué auto buscas (uso, presupuesto, tipo) y te recomiendo opciones de nuestro catálogo.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sesión anónima para atribuir las señales capturadas a una conversación.
  const sessionIdRef = useRef<string>("");
  const [askContact, setAskContact] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contact, setContact] = useState("");

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [msgs, open]);

  useEffect(() => {
    try {
      let sid = localStorage.getItem("rg_sid");
      if (!sid) {
        sid = "s" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem("rg_sid", sid);
      }
      sessionIdRef.current = sid;
    } catch {
      sessionIdRef.current = "s" + Date.now().toString(36);
    }
  }, []);

  /** Registra señales del cliente de forma discreta (sin fricción). */
  const track = (payload: Record<string, unknown>) => {
    if (!sessionIdRef.current) return;
    try {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({ sessionId: sessionIdRef.current, ...payload }),
      }).catch(() => {});
    } catch {
      /* noop */
    }
  };

  const answer = (q: string) => {
    const query = q.toLowerCase();
    let matches = vehicles;

    if (query.includes("suv")) matches = matches.filter((v) => v.bodyType === "SUV");
    if (query.includes("camioneta") || query.includes("4x4"))
      matches = vehicles.filter((v) => v.bodyType === "Camioneta");
    if (query.includes("sedán") || query.includes("sedan"))
      matches = vehicles.filter((v) => v.bodyType === "Sedán");
    if (query.includes("económic") || query.includes("barato") || query.includes("ciudad"))
      matches = [...vehicles].sort((a, b) => a.price - b.price);
    if (query.includes("diésel") || query.includes("diesel"))
      matches = matches.filter((v) => v.fuel === "Diésel");
    if (query.includes("automátic") || query.includes("automatic"))
      matches = matches.filter((v) => v.transmission === "Automática");

    const budget = query.match(/(\d+)\s*m/);
    if (budget) {
      const max = Number(budget[1]) * 1_000_000;
      matches = matches.filter((v) => v.price <= max);
    }

    const top = matches.slice(0, 3);
    if (top.length === 0) {
      return {
        role: "ai" as const,
        text: "No encontré coincidencias exactas, pero puedes revisar todo el catálogo. ¿Ajustamos el presupuesto o el tipo de auto?",
      };
    }
    return {
      role: "ai" as const,
      text: `Encontré ${top.length} ${top.length === 1 ? "opción" : "opciones"} que calzan con lo que buscas:`,
      cars: top.map((v) => v.slug),
    };
  };

  /** Infiere señales del negocio a partir del mensaje (captura discreta). */
  const detectSignals = (q: string) => {
    const query = q.toLowerCase();
    let bodyType: string | undefined;
    if (query.includes("suv")) bodyType = "SUV";
    else if (query.includes("camioneta") || query.includes("4x4") || query.includes("pickup"))
      bodyType = "Camioneta";
    else if (query.includes("sedán") || query.includes("sedan")) bodyType = "Sedán";
    else if (query.includes("hatch")) bodyType = "Hatchback";

    const financing = /(cr[eé]dito|financi|cuota|\bpie\b)/.test(query);
    const bm = query.match(/(\d+)\s*m/);
    const budget = bm ? Number(bm[1]) * 1_000_000 : undefined;

    const kw = [
      "suv", "camioneta", "4x4", "sedán", "diésel", "diesel", "automático",
      "automatico", "económico", "economico", "ciudad", "crédito", "credito",
      "financiamiento", "reserva", "prueba", "familia", "trabajo",
    ];
    const intents = kw.filter((k) => query.includes(k));
    return { bodyType, financing, budget, intents };
  };

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: q }]);

    const a = answer(q);
    const sig = detectSignals(q);
    track({ ...sig, models: a.cars ?? [], messages: 1 });

    setTimeout(() => setMsgs((m) => [...m, a]), 450);
    // Tras mostrar recomendaciones, ofrece (una vez) enviar por WhatsApp.
    if (a.cars && a.cars.length > 0 && !contactSent) {
      setTimeout(() => setAskContact(true), 900);
    }
  };

  const sendContact = () => {
    const c = contact.trim();
    if (!c) return;
    track({ contact: c });
    setContactSent(true);
    setAskContact(false);
    setContact("");
    setMsgs((m) => [
      ...m,
      { role: "ai", text: "¡Genial! Un ejecutivo te contactará con estas opciones. 🙌" },
    ]);
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-2xl shadow-glow transition hover:scale-105 hover:bg-brand-400"
        aria-label="Chat con RG AI"
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[520px] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-800 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-white/10 bg-ink-900 px-4 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-500/20 text-brand-300">
              🤖
            </span>
            <div>
              <p className="text-sm font-semibold">RG AI</p>
              <p className="text-xs text-emerald-400">● En línea</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div key={i}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "ml-auto bg-brand-500 text-white"
                      : "bg-ink-700 text-white/85"
                  }`}
                >
                  {m.text}
                </div>
                {m.cars && (
                  <div className="mt-2 space-y-2">
                    {m.cars.map((slug) => {
                      const v = vehicles.find((x) => x.slug === slug)!;
                      return (
                        <Link
                          key={slug}
                          href={`/vehiculo/${slug}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-900 p-2 transition hover:border-brand-500/50"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={asset(v.image)}
                            alt={v.model}
                            className="h-12 w-16 rounded-lg object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {v.brand} {v.model}
                            </p>
                            <p className="text-xs text-brand-300">
                              {formatCLP(v.price)}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 p-3">
            {askContact && !contactSent && (
              <div className="mb-2 rounded-xl border border-brand-500/30 bg-brand-500/5 p-2.5">
                <p className="mb-1.5 text-xs text-white/70">
                  📲 ¿Te enviamos estas opciones por WhatsApp? (opcional)
                </p>
                <div className="flex gap-2">
                  <input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Tu número o correo"
                    className="flex-1 rounded-lg border border-white/10 bg-ink-900 px-2.5 py-1.5 text-xs outline-none focus:border-brand-500"
                    onKeyDown={(e) => e.key === "Enter" && sendContact()}
                  />
                  <button
                    onClick={sendContact}
                    className="rounded-lg bg-brand-500 px-3 text-xs font-medium text-white transition hover:bg-brand-400"
                  >
                    Enviar
                  </button>
                  <button
                    onClick={() => setAskContact(false)}
                    aria-label="Cerrar"
                    className="rounded-lg px-2 text-xs text-white/40 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
            <div className="mb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-white/10 bg-ink-700 px-2.5 py-1 text-xs text-white/70 transition hover:border-brand-500/50"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu mensaje…"
                className="flex-1 rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="rounded-lg bg-brand-500 px-3 text-white transition hover:bg-brand-400"
                aria-label="Enviar"
              >
                ➤
              </button>
            </form>
            <p className="mt-2 text-[10px] leading-snug text-white/30">
              Al chatear, RG Motors puede usar tu consulta (tipo de auto, presupuesto)
              para recomendarte mejor. El contacto solo se guarda si tú lo entregas.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
