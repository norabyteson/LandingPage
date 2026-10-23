"use client";

import { useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import DemoViewer from "@/components/ui/DemoViewer";
import type { DemoViewerCopy } from "@/components/ui/DemoViewer";
import Reveal from "@/components/ui/Reveal";
import { arrowNudge, buttonClasses } from "@/lib/ui";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types/i18n";

const SERVICE_IDS = ["ecommerce", "landing", "custom"] as const;

function serviceFormLabel(serviceId: string, formServices: string[]): string {
  const idx = SERVICE_IDS.indexOf(serviceId as (typeof SERVICE_IDS)[number]);
  return idx >= 0 ? formServices[idx] ?? "" : "";
}

/** Capturas de los demos (npm run capture-demos); mismo orden que DEMOS en DemoViewer. */
const previews: Record<string, string[]> = {
  ecommerce: ["/demos/previews/ecommerce-1.jpg", "/demos/previews/ecommerce-2.jpg", "/demos/previews/ecommerce-3.jpg"],
  landing: ["/demos/previews/landing-1.jpg", "/demos/previews/landing-2.jpg", "/demos/previews/landing-3.jpg"],
  custom: ["/demos/previews/custom-1.jpg", "/demos/previews/custom-2.jpg", "/demos/previews/custom-3.jpg"],
};

const demoNames: Record<string, string[]> = {
  ecommerce: ["LuxeMode", "CasaMarket", "TUESTE"],
  landing: ["El Gastrónomo", "AURA", "DentaLux"],
  custom: ["NexusERP", "FluxPOS", "ArquitectOS"],
};

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  features: string[];
}

interface ServicesSectionProps {
  dict: {
    services: {
      badge: string;
      title: string;
      subtitle: string;
      items: ServiceItem[];
      viewDemo?: string;
      carousel: {
        prevAria: string;
        nextAria: string;
        dotAria: string;
        overlayFallback: string;
      };
    };
    contact: {
      form: { services: string[] };
    };
    demoViewer: DemoViewerCopy;
  };
  lang: Locale;
}

/**
 * Servicios como pestañas: se elige qué se necesita y al lado se ve un ejemplo real.
 * La vista previa grande y el botón abren el visor de demos en el ejemplo elegido.
 */
export default function ServicesSection({ dict, lang }: ServicesSectionProps) {
  const { services } = dict;
  const [activeId, setActiveId] = useState(services.items[0]?.id ?? "ecommerce");
  const [previewIndex, setPreviewIndex] = useState(0);
  const [activeDemo, setActiveDemo] = useState<{ serviceId: string; demoIndex: number } | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const active = services.items.find((s) => s.id === activeId) ?? services.items[0];
  const images = previews[active.id] ?? previews.ecommerce;
  const names = demoNames[active.id] ?? demoNames.ecommerce;
  const viewDemoLabel = services.viewDemo ?? services.carousel.overlayFallback;

  const selectTab = (index: number) => {
    const item = services.items[index];
    if (!item) return;
    setActiveId(item.id);
    setPreviewIndex(0);
    tabRefs.current[index]?.focus();
  };

  // Flechas izquierda/derecha entre pestañas (patrón de pestañas de WAI-ARIA).
  const onTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = services.items.length - 1;
    if (e.key === "ArrowRight") selectTab(index === last ? 0 : index + 1);
    else if (e.key === "ArrowLeft") selectTab(index === 0 ? last : index - 1);
    else if (e.key === "Home") selectTab(0);
    else if (e.key === "End") selectTab(last);
    else return;
    e.preventDefault();
  };

  return (
    <>
      <section id="services" aria-labelledby="services-title" className="scroll-mt-20 bg-canvas">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <Reveal name="services-header">
            <h2
              id="services-title"
              className="max-w-[20ch] text-4xl leading-[1.05] font-extrabold tracking-tight text-balance text-ink sm:text-5xl"
            >
              {services.title}
            </h2>
            <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-ink-muted">{services.subtitle}</p>
          </Reveal>

          <Reveal name="services-panel" delay={120} className="mt-12">
            <div
              role="tablist"
              aria-label={services.title}
              className="grid gap-1 rounded-2xl border border-line bg-surface p-1 shadow-card sm:inline-flex"
            >
              {services.items.map((item, i) => {
                const selected = item.id === active.id;
                return (
                  <button
                    key={item.id}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`service-tab-${item.id}`}
                    aria-selected={selected}
                    aria-controls="service-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => selectTab(i)}
                    onKeyDown={(e) => onTabKeyDown(e, i)}
                    className={cn(
                      "min-h-11 shrink-0 rounded-xl px-4 text-left text-base font-semibold whitespace-nowrap transition-colors duration-150 sm:px-5 sm:text-center",
                      selected ? "bg-brand text-on-brand" : "text-ink-muted hover:bg-surface-hover hover:text-ink"
                    )}
                  >
                    {item.title}
                  </button>
                );
              })}
            </div>

            <div
              key={active.id}
              id="service-panel"
              role="tabpanel"
              aria-labelledby={`service-tab-${active.id}`}
              className="landing-fade mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14"
            >
              <div className="min-w-0 lg:pt-4">
                <h3 className="text-3xl leading-tight font-bold tracking-tight text-ink">{active.title}</h3>
                <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-ink-muted">{active.description}</p>
                <ul className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2" role="list">
                  {active.features.map((feature) => (
                    <li key={feature} className="flex gap-3 border-t border-line pt-4 text-ink">
                      <Check size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-brand" />
                      <span className="leading-snug font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setActiveDemo({ serviceId: active.id, demoIndex: previewIndex })}
                  className={cn("group mt-10", buttonClasses("primary", "lg"))}
                >
                  {viewDemoLabel}: {names[previewIndex]}
                  <ArrowRight aria-hidden="true" className={arrowNudge} />
                </button>
              </div>

              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => setActiveDemo({ serviceId: active.id, demoIndex: previewIndex })}
                  aria-label={`${viewDemoLabel}: ${names[previewIndex]}`}
                  className="group relative block aspect-[4/3] w-full overflow-hidden rounded-3xl border border-line bg-surface shadow-lift"
                >
                  <Image
                    key={images[previewIndex]}
                    src={images[previewIndex]}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="landing-fade object-cover object-top transition-transform duration-700 ease-standard group-hover:scale-[1.02] motion-reduce:transition-none"
                  />
                </button>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {images.map((src, i) => {
                    const selected = i === previewIndex;
                    return (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setPreviewIndex(i)}
                        aria-pressed={selected}
                        className={cn(
                          "group/thumb min-w-0 rounded-2xl border p-2 text-left transition-colors duration-150",
                          selected
                            ? "border-brand bg-brand-soft"
                            : "border-line bg-surface hover:border-line-strong/50"
                        )}
                      >
                        <span className="relative block aspect-[4/3] overflow-hidden rounded-xl">
                          <Image src={src} alt="" fill sizes="160px" className="object-cover object-top" />
                        </span>
                        <span
                          className={cn(
                            "mt-2 block truncate px-1 text-sm font-semibold",
                            selected ? "text-brand-ink" : "text-ink-muted group-hover/thumb:text-ink"
                          )}
                        >
                          {names[i]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <AnimatePresence>
        {activeDemo && (
          <DemoViewer
            serviceId={activeDemo.serviceId}
            initialIndex={activeDemo.demoIndex}
            lang={lang}
            onClose={() => setActiveDemo(null)}
            copy={dict.demoViewer}
            serviceFormLabel={serviceFormLabel(activeDemo.serviceId, dict.contact.form.services)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
