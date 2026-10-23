import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./demos.css";

/**
 * Layout raíz de los demos funcionales (/demos/*). Separado del sitio (app/(site)) a propósito:
 * sin AdSense, sin Analytics, sin Lenis ni navbar. Se abren dentro del visor de la landing.
 * El código de cada demo vive en la carpeta /demos (ver demos/README.md).
 */

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Demo | NORABYTE", template: "%s | Demo NORABYTE" },
  description: "Demo funcional con datos ficticios, desarrollada por NORABYTE.",
  robots: { index: false, follow: false },
  icons: { icon: "/Logo-Norabyte.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function DemosLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
