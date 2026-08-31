"use client";

import { asset } from "@/lib/asset";

type Props = {
  className?: string;
  /** Altura en px del logo */
  size?: number;
  tagline?: boolean;
};

export default function Logo({ className = "", size = 42 }: Props) {
  return (
    <div className={`inline-flex items-center select-none ${className}`} style={{ height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset("/logo.png")}
        alt="RG Motors — Automotora"
        style={{ height: size, width: "auto" }}
        className="object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:scale-[1.02]"
        draggable={false}
      />
    </div>
  );
}
