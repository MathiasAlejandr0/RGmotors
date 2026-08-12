import Link from "next/link";
import Logo from "./Logo";
import { COMPANY, whatsappLink } from "@/lib/company";

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-ink-900">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-white/50">
            La nueva forma de comprar tu próximo auto usado en Chile. Con
            experiencia 360°, crédito online y total transparencia.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white/80">Comprar</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/50">
            <li><Link href="/catalogo" className="hover:text-white">Catálogo</Link></li>
            <li><Link href="/comparador" className="hover:text-white">Comparador</Link></li>
            <li><Link href="/simulador" className="hover:text-white">Simular crédito</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white/80">Empresa</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/50">
            <li><Link href="/contacto" className="hover:text-white">Contacto</Link></li>
            <li><Link href="/admin" className="hover:text-white">Panel admin</Link></li>
            <li>
              <a
                href={whatsappLink("Hola RG Motors, quiero información.")}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white/80">Contacto</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/50">
            <li>{COMPANY.phoneDisplay}</li>
            <li>{COMPANY.email}</li>
            <li>{COMPANY.address}</li>
            <li className="text-xs text-white/35">{COMPANY.hours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-white/40">
          <span>© {new Date().getFullYear()} RG Motors · Todos los derechos reservados</span>
          <span className="text-xs">Demo de presentación · Datos de contacto configurables</span>
        </div>
      </div>
    </footer>
  );
}
