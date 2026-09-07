"use client";

import { useEffect, useState } from "react";

export default function HeroExploreHint() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY < 48);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToCatalog = () => {
    const el = document.getElementById("catalogo");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.location.href = "/catalogo";
  };

  return (
    <button
      type="button"
      onClick={goToCatalog}
      aria-label="Ir al catálogo de vehículos"
      className={`pointer-events-auto absolute inset-x-0 bottom-[max(1.25rem,calc(env(safe-area-inset-bottom)+0.75rem))] z-20 mx-auto hidden w-fit flex-col items-center rounded-full px-4 py-2 text-white/70 transition-[opacity,transform,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400 sm:flex ${
        visible
          ? "opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <span
        className={`flex flex-col items-center gap-2.5 ${visible ? "rg-scroll-hint" : ""}`}
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.28em]">
          Explorar
        </span>
        <span className="relative h-9 w-px overflow-hidden bg-white/15">
          <span className="rg-scroll-hint-line absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white to-transparent" />
        </span>
      </span>
    </button>
  );
}
