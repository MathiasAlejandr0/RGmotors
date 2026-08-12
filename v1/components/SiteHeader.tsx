"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "./Logo";

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

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-900/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive(item.href)
                  ? "text-white"
                  : "text-white/55 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cuenta"
            className="hidden rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/5 sm:block"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/catalogo"
            className="hidden rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400 sm:block"
          >
            Ver autos
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 text-white/80 md:hidden"
            aria-label="Menú"
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/10 px-4 py-2 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                isActive(item.href) ? "bg-white/5 text-white" : "text-white/60"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/cuenta"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-lg px-3 py-2 text-sm font-medium text-brand-300"
          >
            Iniciar sesión
          </Link>
        </nav>
      )}
    </header>
  );
}
