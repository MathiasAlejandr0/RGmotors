"use client";

import { useState } from "react";
import { COMPANY, whatsappLink } from "@/lib/company";
import { getTrafficSource } from "@/lib/trafficTracking";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  if (sent) {
    return (
      <div className="apple-glass-card rounded-3xl p-8 text-center border-emerald-500/30">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-2xl text-emerald-400 font-bold shadow-glow">
          ✓
        </div>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-emerald-400">¡Mensaje enviado con éxito!</h2>
        <p className="mt-2 text-xs leading-relaxed text-white/70 max-w-md mx-auto">
          Gracias{name ? `, ${name}` : ""}. Un asesor especialista de RG Motors te contactará
          pronto al {phone || email || "medio indicado"}.
        </p>
        <a
          href={whatsappLink("Hola RG Motors, quiero más información sobre un vehículo.")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-xs font-semibold text-white transition hover:brightness-110 shadow-sm"
        >
          <span>💬</span> Contactar directamente por WhatsApp
        </a>
        <button
          onClick={() => setSent(false)}
          className="mt-4 block w-full text-xs text-white/40 hover:text-white transition-colors"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form
      className="apple-glass-card rounded-3xl p-7 space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setSent(true);
        const traffic = getTrafficSource();
        try {
          await fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: `contact_${Date.now()}`,
              name,
              contact: phone || email,
              intents: ["formulario-contacto", `canal-${traffic.source}`, message.slice(0, 50)],
            }),
          });
        } catch {}
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre completo" value={name} onChange={setName} placeholder="Ej. Carlos Silva" required />
        <Field label="Teléfono de contacto" value={phone} onChange={setPhone} placeholder="+56 9 1234 5678" required />
      </div>
      <div>
        <Field
          label="Correo electrónico"
          value={email}
          onChange={setEmail}
          placeholder="tucorreo@ejemplo.com"
          type="email"
          required
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-white/70">Mensaje o consulta</label>
        <textarea
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="¿En qué te podemos asesorar?"
          className="mt-1.5 w-full rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-3 text-xs text-white outline-none focus:border-brand-500 focus:bg-white/[0.08] focus:ring-2 focus:ring-brand-500/20 transition placeholder-white/40"
        />
      </div>
      <button
        type="submit"
        className="apple-btn-primary w-full rounded-full py-3.5 text-xs font-semibold text-white shadow-glow sm:w-auto sm:px-8"
      >
        Enviar mensaje
      </button>
      <p className="text-[10px] text-white/35">
        Al enviar este formulario autorizas a RG Motors a comunicarse contigo. Horario de atención: {COMPANY.hours}.
      </p>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-white/70">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-3 text-xs text-white outline-none focus:border-brand-500 focus:bg-white/[0.08] focus:ring-2 focus:ring-brand-500/20 transition placeholder-white/40"
      />
    </div>
  );
}

