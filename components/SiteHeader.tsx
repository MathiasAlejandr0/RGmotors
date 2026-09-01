"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "./Logo";
import { COMPANY } from "@/lib/company";
import TradeInModal from "./TradeInModal";
import FastCreditPreApprovalModal from "./FastCreditPreApprovalModal";
import CarRequestModal from "./CarRequestModal";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/simulador", label: "Financiamiento" },
  { href: "/comparador", label: "Comparador" },
  { href: "/contacto", label: "Contacto" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tradeInOpen, setTradeInOpen] = useState(false);
  const [creditSimulationOpen, setCreditSimulationOpen] = useState(false);
  const [carRequestOpen, setCarRequestOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className="apple-glass-header sticky top-0 z-40 transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Brand Logo & Location */}
          <div className="flex items-center gap-3">
            <Link href="/" className="transition-transform active:scale-95 flex items-center">
              <Logo size={40} />
            </Link>
            <span className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-white/50">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Puerto Montt
            </span>
          </div>

          {/* Clean Main Navigation */}
          <nav className="hidden md:flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 backdrop-blur-xl">
            {NAV_LINKS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-tight transition-all duration-200 ${
                    active
                      ? "bg-brand-500 text-white shadow-glow"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            {/* Social & WhatsApp Channels for Direct Contact */}
            <div className="hidden lg:flex items-center gap-1.5 border-r border-white/10 pr-2 mr-1">
              <a
                href="https://wa.me/56959073127"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-8 w-8 place-items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 transition hover:border-emerald-500/60 hover:bg-emerald-500/20 hover:scale-105 active:scale-95 shadow-sm shadow-emerald-500/10"
                title="WhatsApp +56 9 5907 3127"
                aria-label="WhatsApp"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>

              <a
                href={COMPANY.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-8 w-8 place-items-center rounded-full border border-pink-500/20 bg-pink-500/10 text-pink-300 transition hover:border-pink-500/50 hover:bg-pink-500/20 hover:scale-105 active:scale-95"
                title="Instagram @_rgmotors"
                aria-label="Instagram"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              <a
                href={COMPANY.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-8 w-8 place-items-center rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-300 transition hover:border-blue-500/50 hover:bg-blue-500/20 hover:scale-105 active:scale-95"
                title="Facebook Automotora GA"
                aria-label="Facebook"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.597 0 9 1.582 9 4.615V8z" />
                </svg>
              </a>
            </div>

            <button
              onClick={() => setTradeInOpen(true)}
              className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-white/80 hover:border-white/25 hover:bg-white/10 hover:text-white transition active:scale-95"
            >
              🔄 Tasar Auto
            </button>

            <button
              onClick={() => setCreditSimulationOpen(true)}
              className="apple-btn-primary hidden sm:inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold text-white shadow-glow transition-all hover:scale-105 active:scale-95"
            >
              <span>⚡</span> Simular Crédito
            </button>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:bg-white/10 active:scale-95 md:hidden"
              aria-label="Menú principal"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <nav className="animate-fade-up border-t border-white/10 bg-ink-950/95 px-4 py-4 backdrop-blur-2xl md:hidden">
            <div className="flex flex-col gap-1.5">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                    isActive(item.href)
                      ? "bg-brand-500 text-white shadow-glow"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <div className="my-2 border-t border-white/10 pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setCreditSimulationOpen(true);
                  }}
                  className="apple-btn-primary flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold text-white shadow-glow text-center"
                >
                  <span>⚡</span> Simular crédito automotriz
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setTradeInOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.05] py-2.5 text-xs font-semibold text-white/90 hover:bg-white/10 transition"
                >
                  <span>🔄</span> Tasar mi auto en parte de pago
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setCarRequestOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-2 text-xs font-medium text-white/70 hover:bg-white/10 transition"
                >
                  <span>🔍</span> ¿Buscas un modelo específico? Te lo buscamos
                </button>

                {/* Mobile Social & WhatsApp Links */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
                  <a
                    href="https://wa.me/56959073127"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2 text-xs font-semibold text-emerald-400"
                  >
                    <span>💬</span> WhatsApp
                  </a>

                  <a
                    href={COMPANY.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-pink-500/20 bg-pink-500/10 py-2 text-xs font-semibold text-pink-300"
                  >
                    <span>📸</span> Instagram
                  </a>

                  <a
                    href={COMPANY.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-blue-500/20 bg-blue-500/10 py-2 text-xs font-semibold text-blue-300"
                  >
                    <span>📘</span> Facebook
                  </a>
                </div>
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* Action Modals */}
      <TradeInModal isOpen={tradeInOpen} onClose={() => setTradeInOpen(false)} />
      <FastCreditPreApprovalModal isOpen={creditSimulationOpen} onClose={() => setCreditSimulationOpen(false)} />
      <CarRequestModal isOpen={carRequestOpen} onClose={() => setCarRequestOpen(false)} />
    </>
  );
}
