"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
} from "lucide-react";

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%" }),
  center: { x: "0%" },
  exit: (dir: number) => ({ x: dir < 0 ? "100%" : "-100%" }),
};
import SectionBadge from "@/components/ui/SectionBadge";
import AnimatedSection from "@/components/ui/AnimatedSection";
import DemoViewer from "@/components/ui/DemoViewer";
import type { DemoViewerCopy } from "@/components/ui/DemoViewer";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types/i18n";

const SERVICE_IDS = ["ecommerce", "landing", "custom"] as const;

function serviceFormLabel(serviceId: string, formServices: string[]): string {
  const idx = SERVICE_IDS.indexOf(serviceId as (typeof SERVICE_IDS)[number]);
  return idx >= 0 ? formServices[idx] ?? "" : "";
}

const placeholderImagesSet: Record<string, string[]> = {
  ecommerce: [
    "/demos/previews/ecommerce-1.jpg",
    "/demos/previews/ecommerce-2.jpg",
    "/demos/previews/ecommerce-3.jpg",
  ],
  landing: [
    "/demos/previews/landing-1.jpg",
    "/demos/previews/landing-2.jpg",
    "/demos/previews/landing-3.jpg",
  ],
  custom: [
    "/demos/previews/custom-1.jpg",
    "/demos/previews/custom-2.jpg",
    "/demos/previews/custom-3.jpg",
  ],
};

const placeholderFallback: Record<string, string[]> = {
  ecommerce: [
    "https://placehold.co/800x500/191716/ecc071?text=LuxeMode&font=raleway",
    "https://placehold.co/800x500/1a1a2e/4a9eff?text=CasaMarket&font=raleway",
    "https://placehold.co/800x500/1c1410/d4a574?text=TUESTE&font=raleway",
  ],
  landing: [
    "https://placehold.co/800x500/090100/c9a055?text=El+Gastrónomo&font=raleway",
    "https://placehold.co/800x500/1a0010/ff6b9d?text=AURA&font=raleway",
    "https://placehold.co/800x500/0a1628/4a9eff?text=DentaLux&font=raleway",
  ],
  custom: [
    "https://placehold.co/800x500/f7f9fc/0053db?text=NexusERP&font=raleway",
    "https://placehold.co/800x500/1c1c2e/4f46e5?text=FluxPOS&font=raleway",
    "https://placehold.co/800x500/0e1321/b7c4ff?text=ArquitectOS&font=raleway",
  ],
};

const demoNames: Record<string, string[]> = {
  ecommerce: ["LuxeMode", "CasaMarket", "TUESTE"],
  landing:   ["El Gastrónomo", "AURA", "DentaLux"],
  custom:    ["NexusERP", "FluxPOS", "ArquitectOS"],
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

function InnerCarousel({
  images,
  fallbacks,
  altPrefix,
  onImageClick,
  carousel,
}: {
  images: string[];
  fallbacks: string[];
  altPrefix: string;
  onImageClick: (index: number) => void;
  carousel: ServicesSectionProps["dict"]["services"]["carousel"];
}) {
  const [[page, direction], setPage] = useState([0, 1]);
  const [failedIdx, setFailedIdx] = useState<Set<number>>(new Set());
  const activeIndex = ((page % images.length) + images.length) % images.length;

  const paginate = (dir: number) =>
    setPage(([p]) => [p + dir, dir]);

  return (
    <div
      className="relative w-full aspect-[4/3] overflow-hidden bg-[var(--nb-dark)] border-b border-[var(--nb-light)]/5 group/carousel select-none rounded-t-2xl cursor-pointer"
      onClick={() => onImageClick(activeIndex)}
    >
      {/* Slides — AnimatePresence con dirección */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0 will-change-transform"
        >
          <Image
            src={failedIdx.has(activeIndex) ? fallbacks[activeIndex] : images[activeIndex]}
            alt={`${altPrefix} — ${carousel.dotAria.replace("{n}", String(activeIndex + 1))}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            draggable={false}
            onError={() => setFailedIdx((prev) => new Set(prev).add(activeIndex))}
          />
        </motion.div>
      </AnimatePresence>

      {/* Hover overlay — CTA visual */}
      <div
        className="absolute inset-0 z-10 flex items-center justify-center opacity-80 md:opacity-0 md:group-hover/carousel:opacity-100 transition-opacity duration-250 bg-black/25 pointer-events-none"
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center ring-1 ring-white/25">
            <PlayCircle size={22} className="text-white" />
          </div>
          <span className="text-white text-xs font-semibold tracking-wide bg-black/40 px-3 py-1 rounded-full">
            {demoNames[altPrefix]?.[activeIndex] ?? carousel.overlayFallback}
          </span>
        </div>
      </div>

      {/* Flechas — se muestran en hover, no interfieren con el click del centro */}
      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2.5 opacity-100 md:opacity-0 md:group-hover/carousel:opacity-100 transition-opacity duration-250 z-20 pointer-events-none">
        <button
          onClick={(e) => { e.stopPropagation(); paginate(-1); }}
          className="w-8 h-8 rounded-full bg-black/65 flex items-center justify-center text-white border border-white/15 pointer-events-auto hover:bg-black/85 transition-colors cursor-pointer"
          aria-label={carousel.prevAria}
        >
          <ChevronLeft size={15} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); paginate(1); }}
          className="w-8 h-8 rounded-full bg-black/65 flex items-center justify-center text-white border border-white/15 pointer-events-auto hover:bg-black/85 transition-colors cursor-pointer"
          aria-label={carousel.nextAria}
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              const dir = i > activeIndex ? 1 : -1;
              setPage([i, dir]);
            }}
            aria-label={carousel.dotAria.replace("{n}", String(i + 1))}
            style={{ pointerEvents: "auto" }}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
              activeIndex === i
                ? "bg-[var(--nb-primary)] w-4 shadow-[0_0_8px_rgba(38,109,211,0.9)]"
                : "bg-white/40 w-1.5 hover:bg-white/70"
            )}
          />
        ))}
      </div>
    </div>
  );
}

function ServiceCard({
  service,
  index,
  onOpenDemo,
  carousel,
}: {
  service: ServiceItem;
  index: number;
  onOpenDemo: (serviceId: string, demoIndex: number) => void;
  carousel: ServicesSectionProps["dict"]["services"]["carousel"];
}) {
  const images    = placeholderImagesSet[service.id]  ?? placeholderImagesSet.ecommerce;
  const fallbacks = placeholderFallback[service.id]   ?? placeholderFallback.ecommerce;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.1, ease: "easeOut" }}
      className="group/card glass-card rounded-2xl overflow-hidden border border-[var(--nb-light)]/10 flex flex-col h-full bg-[var(--nb-dark-surface)] transition-all duration-300 shadow-sm hover:shadow-xl relative w-full"
    >
      <InnerCarousel
        images={images}
        fallbacks={fallbacks}
        altPrefix={service.id}
        onImageClick={(i) => onOpenDemo(service.id, i)}
        carousel={carousel}
      />

      {/* Content */}
      <div className="p-6 md:p-8 flex flex-col gap-5 flex-1 z-10 relative">
        <div>
          <h3 className="text-[var(--nb-light)] font-bold text-xl mb-3 group-hover/card:text-[var(--nb-primary-light)] transition-colors duration-200">
            {service.title}
          </h3>
          <p className="text-[var(--nb-light)]/65 text-sm md:text-base leading-relaxed">
            {service.description}
          </p>
        </div>

        <ul
          className="flex flex-col gap-2.5 mt-auto pt-5 border-t border-[var(--nb-light)]/5"
          role="list"
          aria-label={`Incluye en ${service.title}`}
        >
          {service.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-[var(--nb-light)]/60"
            >
              <CheckCircle
                size={16}
                className="text-[var(--nb-primary)] shrink-0 mt-[1px]"
                aria-hidden="true"
              />
              <span className="leading-snug">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

export default function ServicesSection({ dict, lang }: ServicesSectionProps) {
  const { services } = dict;
  const [activeDemo, setActiveDemo] = useState<{
    serviceId: string;
    demoIndex: number;
  } | null>(null);

  const handleOpenDemo = (serviceId: string, demoIndex: number) => {
    setActiveDemo({ serviceId, demoIndex });
  };

  return (
    <>
      <section
        id="services"
        className="section-padding relative overflow-hidden bg-[var(--nb-section-navy)]"
        aria-labelledby="services-title"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--nb-dark)]/50 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-14">
          <div className="flex flex-col items-center text-center mb-10 md:mb-14 gap-4 max-w-3xl mx-auto">
            <SectionBadge>{services.badge}</SectionBadge>
            <AnimatedSection delay={0.1}>
              <h2 id="services-title" className="heading-lg text-[var(--nb-light)]">
                {services.title}
              </h2>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <p className="text-[var(--nb-light)]/60 text-lg leading-relaxed">
                {services.subtitle}
              </p>
            </AnimatedSection>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
            {services.items.map((service, i) => (
                           <ServiceCard
                key={service.id}
                service={service}
                index={i}
                onOpenDemo={handleOpenDemo}
                carousel={services.carousel}
              />
            ))}
          </div>
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
