import ContactForm from "@/components/ContactForm";
import { COMPANY, whatsappLink } from "@/lib/company";

export default function ContactoPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-8 border-b border-white/[0.08] pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">Contacto y Ubicación</h1>
        <p className="mt-1 text-sm text-white/50">Estamos a tu disposición para asesorarte en la compra o venta de tu vehículo.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] items-start">
        <ContactForm />

        <div className="space-y-3.5">
          <Info icon="📍" title="Showroom y dirección" text={COMPANY.address} />
          <Info icon="📞" title="Teléfono central" text={COMPANY.phoneDisplay} />
          <Info icon="✉️" title="Correo oficial" text={COMPANY.email} />
          <Info icon="🕒" title="Horario de atención" text={COMPANY.hours} />
          
          <a
            href={whatsappLink("Hola RG Motors, quiero información.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3.5 rounded-3xl border border-[#25D366]/30 bg-[#25D366]/10 p-4 transition hover:bg-[#25D366]/20 backdrop-blur-md"
          >
            <span className="text-2xl">💬</span>
            <div>
              <p className="text-xs font-bold text-[#25D366]">Atención inmediata por WhatsApp</p>
              <p className="text-xs text-white/60">Respuesta promedio &lt; 5 min · {COMPANY.phoneDisplay}</p>
            </div>
          </a>

          {/* Social Lead Generation Channels */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <a
              href={COMPANY.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1.5 rounded-3xl border border-pink-500/30 bg-gradient-to-b from-pink-500/15 to-purple-500/10 p-3.5 text-center transition hover:border-pink-500/60 hover:bg-pink-500/25"
            >
              <span className="text-2xl">📸</span>
              <p className="text-xs font-bold text-pink-300">Instagram</p>
              <p className="text-[11px] text-white/60">@_rgmotors</p>
            </a>

            <a
              href={COMPANY.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1.5 rounded-3xl border border-blue-500/30 bg-gradient-to-b from-blue-500/15 to-blue-700/10 p-3.5 text-center transition hover:border-blue-500/60 hover:bg-blue-500/25"
            >
              <span className="text-2xl">📘</span>
              <p className="text-xs font-bold text-blue-300">Facebook</p>
              <p className="text-[11px] text-white/60">@automotoraga</p>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

function Info({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="apple-glass-card flex items-start gap-3.5 rounded-3xl p-4">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-xs font-bold text-white">{title}</p>
        <p className="mt-0.5 text-xs text-white/60">{text}</p>
      </div>
    </div>
  );
}

