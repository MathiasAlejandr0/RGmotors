"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "./Logo";
import TradeInModal from "./TradeInModal";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/simulador", label: "Financiamiento" },
  { href: "/comparador", label: "Comparador" },
  { href: "/contacto", label: "Contacto" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [tradeInOpen, setTradeInOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className="apple-glass-header sticky top-0 z-40 transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="transition-transform active:scale-95">
              <Logo />
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-brand-400/30 bg-brand-400/10 px-2.5 py-0.5 text-[10px] font-bold text-brand-300">
              ⚡ v2.0 HIG
            </span>
          </div>

          <nav className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur-md md:flex">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium tracking-tight transition-all duration-200 ${
                    active
                      ? "bg-white/15 text-white shadow-sm"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => setTradeInOpen(true)}
              className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-brand-300 hover:bg-brand-500/10 transition"
            >
              🔄 Tasación
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/catalogo"
              className="apple-btn-primary hidden rounded-full px-6 py-2.5 text-sm font-bold tracking-wide text-white shadow-glow transition-all hover:scale-105 active:scale-95 sm:block"
            >
              Ver autos
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-white/80 transition active:scale-95 md:hidden"
              aria-label="Menú"
            >
              {open ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {open && (
          <nav className="animate-fade-up border-t border-white/10 bg-ink-950/90 px-4 py-3 backdrop-blur-2xl md:hidden">
            <div className="flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    isActive(item.href)
                      ? "bg-white/10 text-white"
                      : "text-white/65 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setOpen(false);
                  setTradeInOpen(true);
                }}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-brand-300 hover:bg-brand-500/10 transition text-left"
              >
                <span>🔄</span> Entrega tu auto en parte de pago (Tasación)
              </button>
              <div className="mt-3 pt-3 border-t border-white/10 sm:hidden">
                <Link
                  href="/catalogo"
                  onClick={() => setOpen(false)}
                  className="apple-btn-primary block w-full rounded-full py-3 text-center text-sm font-bold text-white shadow-glow"
                >
                  Ver catálogo completo
                </Link>
              </div>
            </div>
          </nav>
        )}
      </header>

      <TradeInModal isOpen={tradeInOpen} onClose={() => setTradeInOpen(false)} />
    </>
  );
}
