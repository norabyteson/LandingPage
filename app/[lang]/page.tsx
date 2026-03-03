import { notFound } from "next/navigation";
import { getDictionary, isValidLocale, defaultLocale } from "@/lib/i18n";
import type { Locale } from "@/types/i18n";
import HeroSection from "@/components/sections/HeroSection";
import ServicesSection from "@/components/sections/ServicesSection";
import ProcessSection from "@/components/sections/ProcessSection";
import AboutSection from "@/components/sections/AboutSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import ContactSection from "@/components/sections/ContactSection";
import PageTransition from "@/components/ui/PageTransition";

interface PageProps {
  params: Promise<{ lang: string }>;
}

import { Metadata } from "next";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};

  const locale: Locale = lang ?? defaultLocale;
  const dict = await getDictionary(locale);

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    keywords: dict.meta.keywords,
    openGraph: {
      title: dict.meta.ogTitle,
      description: dict.meta.ogDescription,
      type: "website",
      locale: locale === "es" ? "es_MX" : "en_US",
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { lang } = await params;

  if (!isValidLocale(lang)) {
    notFound();
  }

  const locale: Locale = lang ?? defaultLocale;
  const dict = await getDictionary(locale);

  return (
    <PageTransition>
      <HeroSection dict={dict} lang={locale} />
      <ServicesSection dict={dict} lang={locale} />
      <ProcessSection dict={dict} />
      <AboutSection dict={dict} />

      <TestimonialsSection dict={dict} />
      <ContactSection dict={dict} />
    </PageTransition>
  );
}
