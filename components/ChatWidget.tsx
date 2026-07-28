"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [msgs, open]);

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

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setTimeout(() => setMsgs((m) => [...m, answer(q)]), 450);
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
                            src={v.image}
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
          </div>
        </div>
      )}
    </>
  );
}
