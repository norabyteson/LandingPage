import type { Metadata, Viewport } from "next";
import { getDictionary, isValidLocale, defaultLocale } from "@/lib/i18n";
import type { Locale } from "@/types/i18n";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LangUpdater from "@/components/layout/LangUpdater";

interface LangLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: LangLayoutProps): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://norabyte.com";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: dict.meta.title,
      template: "%s | NORABYTE",
    },
    description: dict.meta.description,
    keywords: dict.meta.keywords,
    authors: [{ name: "NORABYTE", url: baseUrl }],
    creator: "NORABYTE",
    publisher: "NORABYTE",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "es" ? "es_MX" : "en_US",
      alternateLocale: locale === "es" ? "en_US" : "es_MX",
      url: `${baseUrl}/${locale}`,
      siteName: "NORABYTE",
      title: dict.meta.ogTitle,
      description: dict.meta.ogDescription,
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: "NORABYTE — Desarrollo de Software a Medida",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.ogTitle,
      description: dict.meta.ogDescription,
      images: [`${baseUrl}/og-image.jpg`],
      creator: "@norabyte",
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        "es-MX": `${baseUrl}/es`,
        "en-US": `${baseUrl}/en`,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
  };
}

export const viewport: Viewport = {
  colorScheme: "dark light",
};

export async function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}

export default async function LangLayout({ children, params }: LangLayoutProps) {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://norabyte.com";

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NORABYTE",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: dict.meta.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ciudad de México",
      addressCountry: "MX",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "hola@norabyte.com",
      availableLanguage: ["Spanish", "English"],
    },
    sameAs: [
      "https://github.com/norabyte",
      "https://linkedin.com/company/norabyte",
    ],
  };

  return (
    <>
      {/* Actualiza el atributo lang del <html> en el cliente */}
      <LangUpdater lang={locale} />

      {/* JSON-LD Schema — SEO estructurado */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Skip to content — accesibilidad */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--nb-primary)] focus:text-white focus:rounded-lg focus:font-medium"
      >
        {locale === "es" ? "Ir al contenido principal" : "Skip to main content"}
      </a>

      <Navbar dict={dict} lang={locale} />

      <main id="main-content" tabIndex={-1} className="relative">
        {children}
      </main>

      <Footer dict={dict} lang={locale} />
    </>
  );
}
