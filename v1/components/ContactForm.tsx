"use client";

import { useState } from "react";
import { COMPANY, whatsappLink } from "@/lib/company";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-400/20 text-2xl">
          ✓
        </div>
        <h2 className="mt-4 text-xl font-bold text-emerald-300">¡Mensaje enviado!</h2>
        <p className="mt-2 text-sm text-white/70">
          Gracias{name ? `, ${name}` : ""}. Un ejecutivo de RG Motors te contactará
          pronto al {phone || email || "medio indicado"}.
        </p>
        <a
          href={whatsappLink("Hola RG Motors, quiero más información sobre un vehículo.")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-block rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
        >
          También puedes escribirnos por WhatsApp
        </a>
        <button
          onClick={() => setSent(false)}
          className="mt-3 block w-full text-xs text-white/40 hover:text-white"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form
      className="rounded-2xl border border-white/10 bg-ink-800/60 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" value={name} onChange={setName} placeholder="Tu nombre" required />
        <Field label="Teléfono" value={phone} onChange={setPhone} placeholder="+56 9 ..." required />
      </div>
      <div className="mt-4">
        <Field
          label="Correo"
          value={email}
          onChange={setEmail}
          placeholder="tucorreo@mail.com"
          type="email"
          required
        />
      </div>
      <div className="mt-4">
        <label className="text-sm text-white/60">Mensaje</label>
        <textarea
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="¿En qué te podemos ayudar?"
          className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
        />
      </div>
      <button
        type="submit"
        className="mt-4 w-full rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-400 sm:w-auto"
      >
        Enviar mensaje
      </button>
      <p className="mt-3 text-xs text-white/35">
        Al enviar aceptas que RG Motors te contacte. Horario: {COMPANY.hours}.
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
      <label className="text-sm text-white/60">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
      />
    </div>
  );
}
