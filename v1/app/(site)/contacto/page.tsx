import ContactForm from "@/components/ContactForm";
import { COMPANY, whatsappLink } from "@/lib/company";

export default function ContactoPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">Contacto</h1>
      <p className="mt-1 text-white/50">Estamos para ayudarte a encontrar tu próximo auto.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <ContactForm />

        <div className="space-y-4">
          <Info icon="📍" title="Dirección" text={COMPANY.address} />
          <Info icon="📞" title="Teléfono" text={COMPANY.phoneDisplay} />
          <Info icon="✉️" title="Correo" text={COMPANY.email} />
          <Info icon="🕒" title="Horario" text={COMPANY.hours} />
          <a
            href={whatsappLink("Hola RG Motors, quiero información.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 px-4 py-3 transition hover:bg-[#25D366]/20"
          >
            <span className="text-xl">💬</span>
            <div>
              <p className="text-sm font-semibold text-[#25D366]">WhatsApp</p>
              <p className="text-xs text-white/60">Respuesta rápida · {COMPANY.phoneDisplay}</p>
            </div>
          </a>
        </div>
      </div>
    </main>
  );
}

function Info({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-ink-800/60 px-4 py-3">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-white/60">{text}</p>
      </div>
    </div>
  );
}
