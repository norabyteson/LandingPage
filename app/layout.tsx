import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import ThemeVarsInjector from "@/components/ui/ThemeVarsInjector";
import LenisProvider from "@/components/ui/LenisProvider";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import GoogleAnalyticsNavigation from "@/components/analytics/GoogleAnalyticsNavigation";
import { ADSENSE_CLIENT } from "@/lib/adsense";

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
  icons: {
    icon: "/Logo-Norabyte.png",
    apple: "/Logo-Norabyte.png",
  },
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

        {/*
          AdSense: la etiqueta de propiedad y el script, en todas las páginas.

          Van los dos porque Google acepta cualquiera de los tres métodos de verificación
          y el sitio no controla cuál elige el revisor. La meta es un byte; el script es
          el que además sirve los anuncios cuando la cuenta esté aprobada.

          `async` para no competir con el primer pintado: un script de publicidad que
          bloquea el render cuesta más en posicionamiento de lo que rinde en ingresos.
        */}
        <meta name="google-adsense-account" content={ADSENSE_CLIENT} />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className="relative antialiased" suppressHydrationWarning>
        <GoogleAnalytics />
        <Suspense fallback={null}>
          <GoogleAnalyticsNavigation />
        </Suspense>
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
