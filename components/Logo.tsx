type Props = {
  className?: string;
  /** Altura del logo en px. */
  size?: number;
  /** Compatibilidad: sin efecto (el logo ya incluye la bajada). */
  tagline?: boolean;
};

export default function Logo({ className = "", size = 44 }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="RG Motors — Vehículos de segunda mano"
      style={{ height: size }}
      className={`w-auto select-none ${className}`}
      draggable={false}
    />
  );
}
