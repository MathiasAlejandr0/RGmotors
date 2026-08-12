import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Azul corporativo RG Motors (estilo Apple Gloss)
        brand: {
          300: "#49A7FF", // glow
          400: "#2D8CFF", // claro / hover
          500: "#006CFF", // principal
          600: "#0054CC", // oscuro
          700: "#0040A3",
        },
        // Escala de oscuros profundos Apple (Jet Black / Obsidian)
        ink: {
          950: "#050608", // fondo principal ultra profundo
          900: "#0c0d10", // superficies secundarias
          800: "#13151b", // tarjetas esmeriladas
          700: "#1d2029", // paneles y flotantes
          600: "#2d3240", // bordes sutiles
          500: "#868e9e", // texto secundario iOS
        },
        state: {
          green: "#30D158",
          yellow: "#FFD60A",
          red: "#FF453A",
          violet: "#BF5AF2",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "var(--font-sans)",
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Helvetica Neue"',
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 12px 35px -5px rgba(0, 108, 255, 0.4)",
        "glow-lg": "0 20px 60px -10px rgba(0, 108, 255, 0.5)",
        "apple-card": "0 20px 50px -12px rgba(0, 0, 0, 0.7)",
        "apple-glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "apple-hover": "0 30px 60px -15px rgba(0, 0, 0, 0.8)",
        modal: "0 40px 100px -20px rgba(0, 0, 0, 0.85)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

