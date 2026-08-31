import Link from "next/link";
import Logo from "./Logo";
import { COMPANY, whatsappLink } from "@/lib/company";

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-white/[0.08] bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo size={50} />
          <p className="max-w-xs text-xs leading-relaxed text-white/45">
            Automotora líder en Puerto Montt. Vehículos seleccionados con
            inspección de 150 puntos, crédito online y total transparencia.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white/70">Comprar</h4>
          <ul className="mt-4 space-y-2.5 text-xs text-white/50">
            <li><Link href="/catalogo" className="hover:text-white transition-colors">Catálogo de vehículos</Link></li>
            <li><Link href="/comparador" className="hover:text-white transition-colors">Comparador de vehículos</Link></li>
            <li><Link href="/simulador" className="hover:text-white transition-colors">Simular crédito online</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white/70">Empresa</h4>
          <ul className="mt-4 space-y-2.5 text-xs text-white/50">
            <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto y ubicación</Link></li>
            <li>
              <a
                href={whatsappLink("Hola RG Motors, quiero información.")}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Atención vía WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white/70">Redes y Contacto</h4>
          <ul className="mt-4 space-y-2.5 text-xs text-white/50">
            <li className="font-semibold text-white/80">{COMPANY.phoneDisplay}</li>
            <li>{COMPANY.email}</li>
            <li>{COMPANY.address}</li>
            <li className="text-[11px] text-white/35 pt-1">{COMPANY.hours}</li>
          </ul>

          {/* Social Lead Generation Links */}
          <div className="mt-4 flex items-center gap-2.5">
            <a
              href={COMPANY.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-gradient-to-r from-pink-500/10 to-purple-500/10 px-3 py-1.5 text-xs font-semibold text-pink-300 transition hover:border-pink-500/60 hover:bg-pink-500/20"
              aria-label="Instagram de RG Motors"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>Instagram</span>
            </a>

            <a
              href={COMPANY.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300 transition hover:border-blue-500/60 hover:bg-blue-500/20"
              aria-label="Facebook de RG Motors"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.597 0 9 1.582 9 4.615V8z" />
              </svg>
              <span>Facebook</span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.08]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 sm:px-6 text-xs text-white/40">
          <span>© {new Date().getFullYear()} RG Motors · Todos los derechos reservados</span>
          <span className="text-[11px] text-white/30">Primera experiencia automotriz 360° de Chile</span>
        </div>
      </div>
    </footer>
  );
}

