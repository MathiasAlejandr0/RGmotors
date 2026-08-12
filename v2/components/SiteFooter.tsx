import Link from "next/link";
import Logo from "./Logo";
import { COMPANY, whatsappLink } from "@/lib/company";

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-white/[0.08] bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-xs leading-relaxed text-white/45">
            La nueva forma de comprar tu próximo auto usado en Chile. Con
            experiencia 360°, crédito online instantáneo y total transparencia.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white/70">Comprar</h4>
          <ul className="mt-4 space-y-2.5 text-xs text-white/50">
            <li><Link href="/catalogo" className="hover:text-white transition-colors">Catálogo de autos</Link></li>
            <li><Link href="/comparador" className="hover:text-white transition-colors">Comparador 360°</Link></li>
            <li><Link href="/simulador" className="hover:text-white transition-colors">Simular crédito online</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white/70">Empresa</h4>
          <ul className="mt-4 space-y-2.5 text-xs text-white/50">
            <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto y ubicación</Link></li>
            <li><Link href="/admin" className="hover:text-white transition-colors">Panel administrativo</Link></li>
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
          <h4 className="text-xs font-bold uppercase tracking-wider text-white/70">Contacto</h4>
          <ul className="mt-4 space-y-2.5 text-xs text-white/50">
            <li className="font-semibold text-white/80">{COMPANY.phoneDisplay}</li>
            <li>{COMPANY.email}</li>
            <li>{COMPANY.address}</li>
            <li className="text-[11px] text-white/35 pt-1">{COMPANY.hours}</li>
          </ul>
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

