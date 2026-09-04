"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { asset } from "@/lib/asset";
import { vehicles as staticVehicles, formatCLP } from "@/lib/vehicles";
import { getTrafficSource } from "@/lib/trafficTracking";
import { COMPANY } from "@/lib/company";

type Msg = { role: "user" | "ai"; text: string; cars?: string[] };

const SUGGESTIONS = [
  "SUV automático bajo $16M",
  "Camioneta 4x4 diésel",
  "Auto económico para ciudad",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [showTeaser, setShowTeaser] = useState(true);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "ai",
      text: "¡Hola! Soy el asistente del catálogo RG Motors. Cuéntame qué auto buscas (uso, presupuesto, tipo) y te muestro opciones disponibles. No soy una IA generativa: busco en nuestro inventario.",
    },
  ]);
  const [vehiclesData, setVehiclesData] = useState<any[]>(staticVehicles);
  
  useEffect(() => {
    fetch("/api/vehicles")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.vehicles) setVehiclesData(data.vehicles);
      })
      .catch(console.error);
  }, []);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sesión anónima para atribuir las señales capturadas a una conversación.
  const sessionIdRef = useRef<string>("");
  const [askContact, setAskContact] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contact, setContact] = useState("");

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [msgs, open]);

  // Mostrar el teaser flotante suavemente después de 1.2 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTeaser(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

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
      const traffic = getTrafficSource();
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          trafficSource: traffic,
          ...payload,
        }),
      }).catch(() => {});
    } catch {
      /* noop */
    }
  };

  const answer = (q: string) => {
    const query = q.toLowerCase();
    let matches = vehiclesData;

    if (query.includes("suv")) matches = matches.filter((v) => v.bodyType === "SUV");
    if (query.includes("camioneta") || query.includes("4x4"))
      matches = vehiclesData.filter((v) => v.bodyType === "Camioneta");
    if (query.includes("sedán") || query.includes("sedan"))
      matches = vehiclesData.filter((v) => v.bodyType === "Sedán");
    if (query.includes("económic") || query.includes("barato") || query.includes("ciudad"))
      matches = [...vehiclesData].sort((a, b) => a.price - b.price);
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
      text: `Encontré ${top.length} ${top.length === 1 ? "opción" : "opciones"} ideales en nuestro catálogo:`,
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
      { role: "ai", text: "¡Perfecto! Un ejecutivo te enviará las fichas técnicas por WhatsApp. 🙌" },
    ]);
  };

  return (
    <>
      {/* Teaser flotante elegante y no invasivo */}
      {!open && showTeaser && (
        <div
          onClick={() => {
            setOpen(true);
            setShowTeaser(false);
          }}
          className="fixed bottom-6 right-24 z-50 hidden sm:flex max-w-[310px] cursor-pointer items-center gap-3 rounded-2xl border border-white/15 bg-ink-950/90 p-3 pr-3.5 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:scale-[1.02] hover:border-brand-500/50 active:scale-95 animate-fade-in group"
        >
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 text-xs shadow-glow">
            🤖
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-ink-950 bg-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors">
                Asistente catálogo
              </span>
              <span className="text-[9px] text-emerald-400">● En línea</span>
            </div>
            <p className="truncate text-[11px] text-white/70">
              ¿Buscas auto? Haz clic para asesorarte ➔
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowTeaser(false);
            }}
            className="grid h-5 w-5 place-items-center rounded-full text-white/40 hover:bg-white/10 hover:text-white transition"
            aria-label="Cerrar sugerencia"
          >
            ✕
          </button>
        </div>
      )}

      {/* Botón flotante de chat */}
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open) setShowTeaser(false);
        }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 text-2xl text-white shadow-glow transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20 backdrop-blur-xl"
        aria-label="Chat del catálogo RG Motors"
      >
        {open ? "✕" : "💬"}
      </button>

      {/* Ventana de chat desplegada */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[500px] max-h-[75vh] w-[min(92vw,375px)] flex-col overflow-hidden rounded-3xl border border-white/15 bg-ink-950/90 backdrop-blur-2xl shadow-2xl animate-fade-up">
          {/* Header style iMessage */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-5 py-3.5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 text-sm shadow-glow">
                🤖
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-ink-950 bg-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold tracking-tight text-white">Asistente catálogo</p>
                <p className="text-[10px] text-emerald-400">● En línea para ayudarte</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <a
                href={COMPANY.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-7 w-7 place-items-center rounded-full border border-pink-500/20 bg-pink-500/10 text-pink-300 transition hover:bg-pink-500/25"
                title="Instagram @_rgmotors"
                aria-label="Instagram"
              >
                <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              <a
                href={COMPANY.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-7 w-7 place-items-center rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-300 transition hover:bg-blue-500/25"
                title="Facebook Automotora GA"
                aria-label="Facebook"
              >
                <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.597 0 9 1.582 9 4.615V8z" />
                </svg>
              </a>

              <button
                onClick={() => setOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white transition"
                aria-label="Cerrar chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3.5 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div key={i} className="space-y-2">
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed ${
                    m.role === "user"
                      ? "ml-auto bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-sm"
                      : "bg-white/[0.08] text-white/90 border border-white/10 backdrop-blur-md"
                  }`}
                >
                  {m.text}
                </div>

                {m.cars && (
                  <div className="space-y-2 pl-1">
                    {m.cars.map((slug) => {
                      const v = vehiclesData.find((x) => x.slug === slug)!;
                      return (
                        <Link
                          key={slug}
                          href={`/vehiculo/${slug}`}
                          onClick={() => setOpen(false)}
                          className="apple-glass-card flex items-center gap-3 rounded-2xl p-2.5 transition-transform hover:-translate-y-0.5"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={asset(v.image)}
                            alt={v.model}
                            className="h-12 w-16 rounded-xl object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-white">
                              {v.brand} {v.model}
                            </p>
                            <p className="text-[11px] font-semibold text-brand-300">
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

          {/* Controls & Input */}
          <div className="border-t border-white/10 bg-white/[0.02] p-3.5 backdrop-blur-md">
            {askContact && !contactSent && (
              <div className="mb-3 rounded-2xl border border-brand-500/30 bg-brand-500/10 p-3 backdrop-blur-md">
                <p className="mb-2 text-[11px] font-medium text-white/80">
                  📲 ¿Te enviamos estas opciones por WhatsApp?
                </p>
                <div className="flex gap-2">
                  <input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Tu WhatsApp o email"
                    className="flex-1 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white outline-none focus:border-brand-500 placeholder-white/40"
                    onKeyDown={(e) => e.key === "Enter" && sendContact()}
                  />
                  <button
                    onClick={sendContact}
                    className="apple-btn-primary rounded-full px-3.5 py-1.5 text-xs font-semibold text-white"
                  >
                    Enviar
                  </button>
                  <button
                    onClick={() => setAskContact(false)}
                    aria-label="Cerrar"
                    className="px-1.5 text-xs text-white/40 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-medium text-white/70 transition hover:bg-white/15 hover:text-white active:scale-95"
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
                placeholder="Escribe tu consulta sobre un vehículo…"
                className="flex-1 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs text-white outline-none focus:border-brand-500 focus:bg-white/[0.09] transition placeholder-white/40"
              />
              <button
                type="submit"
                className="apple-btn-primary grid h-8 w-8 place-items-center rounded-full text-white text-xs shadow-glow"
                aria-label="Enviar"
              >
                ➔
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
