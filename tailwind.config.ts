import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Azul corporativo RG Motors
        brand: {
          300: "#49A7FF", // glow
          400: "#2D8CFF", // claro / hover
          500: "#006CFF", // principal
          600: "#0054CC", // oscuro
          700: "#0054CC",
        },
        // Escala de oscuros
        ink: {
          950: "#090909", // fondo principal
          900: "#111315", // header / footer (carbón)
          800: "#181A1F", // tarjetas
          700: "#22252B", // paneles
          600: "#323842", // bordes (gris medio)
          500: "#8A9099", // texto secundario
        },
        state: {
          green: "#22C55E",
          yellow: "#FACC15",
          red: "#EF4444",
          violet: "#7C3AED",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 10px 30px rgba(0, 108, 255, 0.35)",
        card: "0 20px 60px rgba(0, 0, 0, 0.45)",
        modal: "0 30px 80px rgba(0, 0, 0, 0.6)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
