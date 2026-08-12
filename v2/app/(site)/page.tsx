import Link from "next/link";
import { asset } from "@/lib/asset";
import { vehicles } from "@/lib/vehicles";
import VehicleCard from "@/components/VehicleCard";
import RevealOnScroll from "@/components/RevealOnScroll";
import Hero3DCarousel from "@/components/Hero3DCarousel";
import AppleCareTrustSection from "@/components/AppleCareTrustSection";

export default function Home() {

  const featured = vehicles.filter((v) => v.featured).slice(0, 3);

  return (
    <main className="relative overflow-hidden">
      {/* Hero */}


      <section className="relative border-b border-white/[0.08] pt-10 pb-16 lg:pt-16 lg:pb-24">
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 backdrop-blur-md shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
              </span>
              <span className="text-xs font-semibold text-white/90 tracking-wide">
                +450 vehículos con inspección y garantía
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
              La nueva forma de comprar tu próximo{" "}
              <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-white bg-clip-text text-transparent">
                vehículo.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base sm:text-lg leading-relaxed text-white/60">
              Explora en 360°, simula tu financiamiento al instante y reserva tu auto 100% online con total transparencia.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                href="/catalogo"
                className="apple-btn-primary rounded-full px-7 py-3.5 text-sm font-semibold text-white"
              >
                Ver catálogo
              </Link>
              <Link
                href="/simulador"
                className="apple-btn-secondary rounded-full px-7 py-3.5 text-sm font-medium"
              >
                Solicitar crédito
              </Link>
            </div>
          </div>

          {/* Apple TV Style 3D Showcase Carousel */}
          <div className="animate-fade-up lg:pl-6">
            <Hero3DCarousel vehicles={vehicles} />
          </div>

        </div>


        {/* Feature strip */}
        <div className="mt-14 border-t border-white/[0.08] bg-white/[0.02] backdrop-blur-md">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/[0.08] px-4 py-6 text-center sm:grid-cols-3 lg:grid-cols-5">
            <Stat
              icon={
                <svg className="h-5 w-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM3 9l2-4h14l2 4M3 9v8a1 1 0 001 1h1m16-9v8a1 1 0 01-1 1h-1M3 9h18" />
                </svg>
              }
              title="+450 autos"
              text="disponibles"
            />
            <Stat
              icon={
                <svg className="h-5 w-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              title="Financiamiento"
              text="inmediato"
            />
            <Stat
              icon={
                <svg className="h-5 w-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              title="Compra"
              text="100% segura"
            />
            <Stat
              icon={
                <svg className="h-5 w-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
              title="Tours 360°"
              text="exterior e interior"
            />
            <Stat
              icon={
                <svg className="h-5 w-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              }
              title="Reserva"
              text="online instantánea"
            />
          </div>
        </div>
      </section>

      {/* Featured Vehicles with Scroll Reveal */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <RevealOnScroll>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-white">
                Vehículos destacados
              </h2>
              <p className="mt-1 text-sm text-white/50">
                Seleccionados minuciosamente por su historial y excelente estado.
              </p>
            </div>
            <Link
              href="/catalogo"
              className="flex items-center gap-1 text-sm font-semibold text-brand-400 transition hover:text-brand-300"
            >
              Ver todos los autos <span className="text-xs">→</span>
            </Link>
          </div>
        </RevealOnScroll>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((v, idx) => (
            <RevealOnScroll key={v.slug} delay={idx * 150}>
              <VehicleCard vehicle={v} />
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* How it works with Scroll Reveal */}
      <section className="border-y border-white/[0.08] bg-ink-900/40 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <RevealOnScroll>
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-white">
                Comprar tu auto nunca fue tan fácil
              </h2>
              <p className="mt-2 text-sm text-white/50 max-w-lg mx-auto">
                Un proceso simple, transparente y diseñado para darte total tranquilidad.
              </p>
            </div>
          </RevealOnScroll>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            <RevealOnScroll delay={100}>
              <Step n="1" title="Explora" text="Filtra entre cientos de autos con inspección certificada de 150 puntos." />
            </RevealOnScroll>
            <RevealOnScroll delay={200}>
              <Step n="2" title="Revisa en 360°" text="Míralo por dentro y por fuera desde tu casa con fotos reales." />
            </RevealOnScroll>
            <RevealOnScroll delay={300}>
              <Step n="3" title="Simula tu crédito" text="Conoce tu cuota estimada al instante con condiciones claras." />
            </RevealOnScroll>
            <RevealOnScroll delay={400}>
              <Step n="4" title="Reserva online" text="Bloquéalo pagando una abono 100% reembolsable de forma segura." />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* 4. Apple Care Style Trust & Guarantee Bento Cards */}
      <RevealOnScroll>
        <AppleCareTrustSection />
      </RevealOnScroll>


      {/* CTA Banner with Scroll Reveal */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">

        <RevealOnScroll>
          <div className="relative overflow-hidden rounded-3xl border border-brand-500/30 bg-gradient-to-br from-brand-500/15 via-ink-900/90 to-black p-8 text-center sm:p-14 shadow-apple-card">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">

              ¿Listo para encontrar tu próximo auto?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-white/60">
              Explora nuestro catálogo completo con experiencia 360° e inicia tu simulación de financiamiento en minutos.
            </p>
            <Link
              href="/catalogo"
              className="apple-btn-primary mt-8 inline-block rounded-full px-8 py-3.5 text-sm font-semibold text-white shadow-glow"
            >
              Explorar catálogo completo
            </Link>
          </div>
        </RevealOnScroll>
      </section>
    </main>
  );
}


function Stat({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-3 py-2">
      <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
        {icon}
      </div>
      <p className="mt-2 text-sm font-bold tracking-tight text-white">{title}</p>
      <p className="text-xs text-white/45">{text}</p>
    </div>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="apple-glass-card rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-500/90 font-bold text-white text-sm shadow-glow">
        {n}
      </span>
      <h3 className="mt-5 text-base font-bold tracking-tight text-white">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-white/55">{text}</p>
    </div>
  );
}

