export default function ContactoPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">Contacto</h1>
      <p className="mt-1 text-white/50">Estamos para ayudarte a encontrar tu próximo auto.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <form className="rounded-2xl border border-white/10 bg-ink-800/60 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre" placeholder="Tu nombre" />
            <Field label="Teléfono" placeholder="+56 9 ..." />
          </div>
          <div className="mt-4">
            <Field label="Correo" placeholder="tucorreo@mail.com" type="email" />
          </div>
          <div className="mt-4">
            <label className="text-sm text-white/60">Mensaje</label>
            <textarea
              rows={4}
              placeholder="¿En qué te podemos ayudar?"
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <button
            type="button"
            className="mt-4 rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-400"
          >
            Enviar mensaje
          </button>
        </form>

        <div className="space-y-4">
          <Info icon="📍" title="Dirección" text="Av. Las Condes 1234, Santiago" />
          <Info icon="📞" title="Teléfono" text="+56 9 1234 5678" />
          <Info icon="✉️" title="Correo" text="contacto@rgmotors.cl" />
          <Info icon="🕒" title="Horario" text="Lun a Vie 9:00–19:00 · Sáb 10:00–14:00" />
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm text-white/60">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
      />
    </div>
  );
}

function Info({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-ink-800/60 p-4">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-white/60">{text}</p>
      </div>
    </div>
  );
}
