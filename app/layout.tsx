import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import ThemeVarsInjector from "@/components/ui/ThemeVarsInjector";
import LenisProvider from "@/components/ui/LenisProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NORABYTE — Desarrollo de Software a Medida",
  description: "Transformamos tus ideas en soluciones digitales de alto impacto.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#191716" },
    { media: "(prefers-color-scheme: light)", color: "#F0F0F0" },
  ],
};

/**
 * Script de inicialización de tema — se ejecuta de forma SÍNCRONA antes de
 * que React hidrate el DOM. Elimina el flash de tema al recargar la página.
 * Por defecto iniciará en 'light'.
 */
const themeInitScript = `
(function(){try{
  var t=localStorage.getItem('nb-theme')||'light';
  document.documentElement.classList.remove('dark','light');
  document.documentElement.classList.add(t);
}catch(e){}})();
`.trim();

/**
 * Script de inicialización de idioma — lee el pathname y asigna el atributo
 * lang del <html> de forma síncrona, antes de que React hidrate, para que
 * /en y /es funcionen correctamente desde el primer paint.
 */
const langInitScript = `
(function(){try{
  var p=location.pathname;
  var l=p.startsWith('/en')?'en':'es';
  document.documentElement.lang=l;
}catch(e){}})();
`.trim();

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} light`}
    >
      <head>
        {/* Script bloqueante — aplica tema antes del primer paint para evitar flash */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* Script bloqueante — asigna lang según pathname antes del primer paint */}
        <script dangerouslySetInnerHTML={{ __html: langInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <ThemeVarsInjector />
          <LenisProvider>
            {children}
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
