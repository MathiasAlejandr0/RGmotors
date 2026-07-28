import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "RG Motors — Autos usados con experiencia 360°",
  description:
    "Compra tu próximo auto usado con la primera experiencia 360° interactiva de Chile. Gira el vehículo, revisa cada detalle, simula tu crédito y reserva online.",
  keywords: [
    "autos usados",
    "vehículos segunda mano",
    "spin 360",
    "crédito automotriz",
    "RG Motors",
    "Chile",
  ],
  openGraph: {
    title: "RG Motors — Autos usados con experiencia 360°",
    description:
      "La primera automotora de Chile con visor 360° interactivo. Revisa cada ángulo del auto antes de comprar.",
    type: "website",
    locale: "es_CL",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CL" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
