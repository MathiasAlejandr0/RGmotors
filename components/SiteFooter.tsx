import Link from "next/link";
import Logo from "./Logo";

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
            <li><a href="#" className="hover:text-white">Vende tu auto</a></li>
            <li><a href="#" className="hover:text-white">Sucursales</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white/80">Contacto</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/50">
            <li>+56 9 1234 5678</li>
            <li>contacto@rgmotors.cl</li>
            <li>Av. Las Condes 1234, Santiago</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-white/40">
          © {new Date().getFullYear()} RG Motors · Todos los derechos reservados
        </div>
      </div>
    </footer>
  );
}
