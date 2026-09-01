import Link from "next/link";
import { asset } from "@/lib/asset";
import { getVehicles } from "@/lib/server/vehiclesStore";
import VehicleCard from "@/components/VehicleCard";
import RevealOnScroll from "@/components/RevealOnScroll";
import Hero3DCarousel from "@/components/Hero3DCarousel";
import AppleCareTrustSection from "@/components/AppleCareTrustSection";

export const dynamic = "force-dynamic";

export default async function Home() {
  const vehicles = await getVehicles();
  // Solo mostrar en la web pública los vehículos que tengan fotos
  const publicVehicles = vehicles.filter((v) => v.gallery && v.gallery.length > 0);
  const featured = publicVehicles.filter((v) => v.featured).slice(0, 6);

  return (
    <main className="relative overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative hero-bg border-b border-white/[0.08] pt-10 pb-16 lg:pt-14 lg:pb-20">
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          {/* Left Hero Copy */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-3.5 py-1 backdrop-blur-md shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
              </span>
              <span className="text-xs font-semibold text-brand-200 tracking-wide">
                Calidad Garantizada · Inspección 150 Puntos
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white leading-[1.1]">
              Tu próximo vehículo,{" "}
              <span className="bg-gradient-to-r from-brand-200 via-white to-brand-300 bg-clip-text text-transparent drop-shadow-sm">
                garantizado y con financiamiento a tu medida.
              </span>
            </h1>

            <p className="mt-4 max-w-lg text-base sm:text-lg leading-relaxed text-white/65 font-normal">
              Explora nuestra selección de camionetas 4x4, SUVs y autos seminuevos inspeccionados. Fotografías 100% reales, evaluación crediticia rápida y entrega inmediata en Puerto Montt.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              <Link
                href="/catalogo"
                className="apple-btn-primary rounded-full px-7 py-3 text-sm font-bold text-white shadow-glow transition hover:scale-105"
              >
                Explorar Catálogo Completo
              </Link>
              <Link
                href="/simulador"
                className="apple-btn-secondary rounded-full px-6 py-3 text-sm font-semibold text-white"
              >
                Simular Crédito Online
              </Link>
            </div>
          </div>

          {/* Right 3D Carousel Stage */}
          <div className="animate-fade-up lg:pl-4">
            <Hero3DCarousel vehicles={vehicles} />
          </div>
        </div>

        {/* Value Props Clean Strip */}
        <div className="mt-12 border-t border-white/[0.08] bg-white/[0.02] backdrop-blur-md">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/[0.08] px-4 py-5 sm:grid-cols-4">
            <Pillar
              icon="🚘"
              title="Stock Verificado"
              text="Historial y kilometraje auditado"
            />
            <Pillar
              icon="⚡"
              title="Simulación Online"
              text="Respuesta ágil a tu correo"
            />
            <Pillar
              icon="📸"
              title="Fotos Reales HD"
              text="Exteriores, interiores y motor"
            />
            <Pillar
              icon="🛡️"
              title="Garantía & Respaldo"
              text="Inspección mecánica 150 puntos"
            />
          </div>
        </div>
      </section>

      {/* 2. FEATURED VEHICLES */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <RevealOnScroll>
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-1 rounded-full bg-brand-400" />
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-white">
                  Vehículos destacados
                </h2>
              </div>
              <p className="mt-1 text-sm text-white/50">
                Unidades seleccionadas minuciosamente por su óptimo estado mecánico y estético.
              </p>
            </div>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 transition hover:text-white"
            >
              Ver catálogo completo <span className="text-xs">→</span>
            </Link>
          </div>
        </RevealOnScroll>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((v, idx) => (
            <RevealOnScroll key={v.slug} delay={idx * 100}>
              <VehicleCard vehicle={v} />
            </RevealOnScroll>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/catalogo"
            className="apple-btn-secondary inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold text-white"
          >
            Ver todos los {vehicles.length} vehículos disponibles →
          </Link>
        </div>
      </section>

      {/* 3. HOW IT WORKS (SIMPLE 4 STEPS) */}
      <section className="border-y border-white/[0.08] bg-ink-900/40 backdrop-blur-xl py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <RevealOnScroll>
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-white">
                Comprar tu auto nunca fue tan simple y seguro
              </h2>
              <p className="mt-2 text-sm text-white/50">
                Experiencia 100% digital respaldada por atención personalizada en cada etapa.
              </p>
            </div>
          </RevealOnScroll>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <RevealOnScroll delay={100}>
              <Step
                n="1"
                title="Explora el stock"
                text="Filtra entre autos inspeccionados con certificación técnica de 150 puntos."
              />
            </RevealOnScroll>
            <RevealOnScroll delay={200}>
              <Step
                n="2"
                title="Inspección 360°"
                text="Revisa cada rincón exterior e interior con fotos reales de alta fidelidad."
              />
            </RevealOnScroll>
            <RevealOnScroll delay={300}>
              <Step
                n="3"
                title="Simula tu cuota"
                text="Elige tu pie y plazo. Recibiremos tu solicitud para responderte a la brevedad."
              />
            </RevealOnScroll>
            <RevealOnScroll delay={400}>
              <Step
                n="4"
                title="Entrega & Showroom"
                text="Visita nuestro showroom en Puerto Montt o coordinamos la entrega de tu auto."
              />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* 4. TRUST & GUARANTEES BENTO */}
      <RevealOnScroll>
        <AppleCareTrustSection />
      </RevealOnScroll>

      {/* 5. CTA BANNER */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <RevealOnScroll>
          <div className="relative overflow-hidden rounded-3xl border border-brand-500/40 bg-gradient-to-br from-brand-600/25 via-ink-900/90 to-black p-8 text-center sm:p-14 shadow-apple-card">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              ¿Listo para encontrar tu próximo vehículo?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-white/60">
              Explora nuestro catálogo con fotos 360°, simula tu crédito online o solicita una tasación por tu vehículo actual.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/catalogo"
                className="apple-btn-primary rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-glow"
              >
                Explorar catálogo completo
              </Link>
              <Link
                href="/contacto"
                className="apple-btn-secondary rounded-full px-8 py-3.5 text-sm font-semibold text-white"
              >
                Hablar con un asesor
              </Link>
            </div>
          </div>
        </RevealOnScroll>
      </section>
    </main>
  );
}

function Pillar({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-2 text-center">
      <span className="text-xl mb-1.5">{icon}</span>
      <p className="text-sm font-bold tracking-tight text-white">{title}</p>
      <p className="text-[11px] text-white/50 mt-0.5">{text}</p>
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
      <p className="mt-2 text-xs leading-relaxed text-white/55 font-normal">{text}</p>
    </div>
  );
}
