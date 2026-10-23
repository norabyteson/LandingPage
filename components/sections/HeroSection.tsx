import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/types/i18n";
import { arrowNudge, buttonClasses } from "@/lib/ui";
import { cn } from "@/lib/utils";
import MarkPlayed from "@/components/ui/MarkPlayed";

interface HeroSectionProps {
  dict: {
    hero: {
      badge: string;
      headline: string;
      subheadline: string;
      ctaPrimary: string;
      ctaSecondary: string;
    };
  };
  lang: Locale;
}

/**
 * Portada: el lema a la izquierda y la captura real del panel a la derecha.
 * Componente de servidor; la entrada es CSS (`landing-rise` / `landing-pop`), escalonada
 * con `animation-delay`, una vez por pestaña (lib/played.ts) y se anula con «reducir movimiento».
 */
export default function HeroSection({ dict, lang }: HeroSectionProps) {
  const { hero } = dict;
  const words = hero.headline.split(" ");
  const lead = words.slice(0, 3).join(" ");
  const rest = words.slice(3).join(" ");

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      data-reveal="hero"
      className="relative overflow-hidden bg-surface pt-28 pb-16 md:pt-32 lg:pb-24"
    >
      <MarkPlayed name="hero" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:min-h-[calc(100dvh-72px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14 lg:px-8">
        <div className="min-w-0">
          <p className="landing-rise text-sm font-semibold text-brand-ink">{hero.badge}</p>

          <h1
            id="hero-title"
            className="landing-rise mt-5 text-[clamp(2.4rem,1.6rem+2.6vw,4rem)] leading-[1.05] font-extrabold tracking-tight text-balance text-ink [animation-delay:90ms]"
          >
            {lead} <span className="text-brand">{rest}</span>
          </h1>

          <p className="landing-rise mt-7 max-w-[40ch] text-lg leading-relaxed text-ink-muted [animation-delay:280ms] md:text-xl">
            {hero.subheadline}
          </p>

          <div className="landing-rise mt-9 flex flex-wrap gap-3 [animation-delay:380ms]">
            <a href={`/${lang}#contact`} className={cn("group", buttonClasses("primary", "lg"))}>
              {hero.ctaPrimary}
              <ArrowRight aria-hidden="true" className={arrowNudge} />
            </a>
            <a href={`/${lang}#services`} className={buttonClasses("secondary", "lg")}>
              {hero.ctaSecondary}
            </a>
          </div>
        </div>

        {/* Captura real del panel sobre un plano suave de marca. */}
        <div className="relative min-w-0">
          <div
            aria-hidden="true"
            className="landing-pop absolute -inset-x-4 -top-6 -bottom-8 rounded-[2.5rem] bg-brand-soft sm:-inset-x-8 lg:-right-16 lg:left-8"
          />
          <div className="landing-rise relative overflow-hidden rounded-2xl border border-line bg-[#0b0b0b] shadow-lift [animation-delay:240ms] [animation-duration:900ms] lg:translate-x-4">
            <Image
              src={lang === "es" ? "/dashboard-assets/dashboard-es.webp" : "/dashboard-assets/dashboard-en.webp"}
              alt={
                lang === "es"
                  ? "Panel de un sistema hecho por NORABYTE: ventas del mes, pedidos y seguimiento de órdenes."
                  : "Dashboard of a system built by NORABYTE: monthly sales, orders and order tracking."
              }
              width={1600}
              height={1000}
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="block aspect-[16/10] h-auto w-full object-cover object-left-top"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
