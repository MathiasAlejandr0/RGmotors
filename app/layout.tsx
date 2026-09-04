import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL("https://rgmotors.cl"),
  title: "RG Motors — Vehículos Seleccionados en Puerto Montt",
  description:
    "Compra tu próximo auto o camioneta en Puerto Montt, Los Lagos. Stock verificado, fotos reales de cada unidad y simulación de crédito automotriz con Autofin.",
  keywords: [
    "autos usados",
    "camionetas 4x4",
    "vehículos seleccionados",
    "crédito automotriz",
    "RG Motors",
    "Puerto Montt",
    "Chile",
  ],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "RG Motors — Vehículos Seleccionados en Puerto Montt",
    description:
      "Automotora en Puerto Montt. Catálogo de camionetas y autos usados con fotografías reales e financiamiento Autofin.",
    type: "website",
    locale: "es_CL",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "RG Motors" }],
  },
};

import TrafficTracker from "@/components/TrafficTracker";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CL" className={inter.variable}>
      <body>
        <TrafficTracker />
        {children}
      </body>
    </html>
  );
}
