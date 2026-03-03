"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Globe,
  ShoppingCart,
  Building2,
  Monitor,
  LayoutDashboard,
  Settings2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import SectionBadge from "@/components/ui/SectionBadge";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { cn } from "@/lib/utils";

const serviceIcons: Record<string, React.ElementType> = {
  landing:    Globe,
  ecommerce:  ShoppingCart,
  enterprise: Building2,
  pos:        Monitor,
  desktop:    LayoutDashboard,
  custom:     Settings2,
};

// Generamos 3 imágenes de variantes por cada servicio para el mini-carrusel
const placeholderImagesSet: Record<string, string[]> = {
  landing:    [
    "https://placehold.co/800x500/191716/266DD3?text=Sitios+Web+1&font=raleway",
    "https://placehold.co/800x500/1D1A19/4A8FE8?text=Sitios+Web+2&font=raleway",
    "https://placehold.co/800x500/151312/1A4F9A?text=Sitios+Web+3&font=raleway"
  ],
  ecommerce:  [
    "https://placehold.co/800x500/191716/4A8FE8?text=E-Commerce+1&font=raleway",
    "https://placehold.co/800x500/1D1A19/1A4F9A?text=E-Commerce+2&font=raleway",
    "https://placehold.co/800x500/151312/266DD3?text=E-Commerce+3&font=raleway"
  ],
  enterprise: [
    "https://placehold.co/800x500/191716/1A4F9A?text=Sistemas+1&font=raleway",
    "https://placehold.co/800x500/1D1A19/266DD3?text=Sistemas+2&font=raleway",
    "https://placehold.co/800x500/151312/4A8FE8?text=Sistemas+3&font=raleway"
  ],
  pos:        [
    "https://placehold.co/800x500/191716/266DD3?text=POS+1&font=raleway",
    "https://placehold.co/800x500/1D1A19/1A4F9A?text=POS+2&font=raleway",
    "https://placehold.co/800x500/151312/4A8FE8?text=POS+3&font=raleway"
  ],
  desktop:    [
    "https://placehold.co/800x500/191716/4A8FE8?text=Desktop+1&font=raleway",
    "https://placehold.co/800x500/1D1A19/266DD3?text=Desktop+2&font=raleway",
    "https://placehold.co/800x500/151312/1A4F9A?text=Desktop+3&font=raleway"
  ],
  custom:     [
    "https://placehold.co/800x500/191716/1A4F9A?text=Custom+1&font=raleway",
    "https://placehold.co/800x500/1D1A19/4A8FE8?text=Custom+2&font=raleway",
    "https://placehold.co/800x500/151312/266DD3?text=Custom+3&font=raleway"
  ],
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
    };
  };
  lang: string;
}

function InnerCarousel({ images, altPrefix }: { images: string[], altPrefix: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const paginate = (newDirection: number) => {
    setActiveIndex((prev) => (prev + newDirection + images.length) % images.length);
  };

  const setFixedPage = (targetIndex: number) => {
    setActiveIndex(targetIndex);
  };

  return (
    <div className="relative w-full aspect-[16/10] overflow-hidden bg-[var(--nb-dark)] border-b border-[var(--nb-light)]/5 group/carousel cursor-grab active:cursor-grabbing select-none rounded-t-2xl">
      
      {/* Track: Continous Flex Track para prevenir vacíos al arrastrar */}
      <motion.div
        drag="x"
        onDragEnd={(e, { offset, velocity }) => {
          const swipe = offset.x;
          if (swipe < -40 || velocity.x < -20) {
            paginate(1);
          } else if (swipe > 40 || velocity.x > 20) {
            paginate(-1);
          }
        }}
        animate={{ x: `-${activeIndex * 100}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute inset-0 flex w-full h-full will-change-transform"
      >
        {images.map((img, i) => (
          <div key={i} className="min-w-full h-full relative shrink-0">
            <Image
              src={img}
              alt={`${altPrefix} - Vista ${i + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
              unoptimized
              draggable={false}
            />
          </div>
        ))}
      </motion.div>

      {/* Navegación manual (Arrows) - Siempre visibles en hover, infinitas */}
      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
        <button 
          onPointerDown={e => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); paginate(-1); }}
          className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/10 pointer-events-auto hover:bg-black/80 transition-colors"
          aria-label="Anterior imagen"
        >
          <ChevronLeft size={16} />
        </button>
        <button 
          onPointerDown={e => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); paginate(1); }}
          className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/10 pointer-events-auto hover:bg-black/80 transition-colors"
          aria-label="Siguiente imagen"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Dots de paginación */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
        {images.map((_, i) => (
          <button
            key={i}
            onPointerDown={e => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setFixedPage(i); }}
            aria-label={`Ir a imagen ${i + 1}`}
            style={{ pointerEvents: "auto" }}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-300",
              activeIndex === i ? "bg-[var(--nb-primary)] w-3 shadow-[0_0_8px_rgba(38,109,211,0.8)]" : "bg-white/40 hover:bg-white/80"
            )}
          />
        ))}
      </div>
    </div>
  );
}

function ServiceCard({ service, index }: { service: ServiceItem; index: number }) {
  const Icon = serviceIcons[service.id] ?? Globe;
  const images = placeholderImagesSet[service.id] ?? placeholderImagesSet.landing;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.4,
        delay: (index % 3) * 0.1, // Stagger effect based on column
        ease: "easeOut",
      }}
      className={cn(
        "group/card glass-card rounded-2xl overflow-hidden border border-[var(--nb-light)]/10 flex flex-col h-full bg-[var(--nb-dark-surface)] transition-all duration-300 shadow-sm hover:shadow-xl relative",
        "w-full"
      )}
    >
      {/* Inner Image Carousel */}
      <InnerCarousel images={images} altPrefix={service.title} />

      {/* Icono flotante superior derecho */}
      <div className="absolute top-4 right-4 z-20 w-10 h-10 rounded-xl bg-[var(--nb-dark)]/80 backdrop-blur-md border border-[var(--nb-light)]/10 flex items-center justify-center opacity-0 translate-y-2 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-300 pointer-events-none">
         <Icon size={18} className="text-[var(--nb-primary-light)]" aria-hidden="true" />
      </div>

      {/* Contenido */}
      <div className="p-6 md:p-8 flex flex-col gap-5 flex-1 z-10 relative">
        <div>
          <h3 className="text-[var(--nb-light)] font-bold text-xl mb-3 group-hover/card:text-[var(--nb-primary-light)] transition-colors duration-200">
            {service.title}
          </h3>
          <p className="text-[var(--nb-light)]/55 text-sm md:text-base leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Features minimalistas */}
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

export default function ServicesSection({ dict }: ServicesSectionProps) {
  const { services } = dict;

  return (
    <section
      id="services"
      className="section-padding relative overflow-hidden bg-[var(--nb-section-navy)]"
      aria-labelledby="services-title"
    >
      {/* Background ambient light */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--nb-dark)]/50 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera Centrada */}
        <div className="flex flex-col items-center text-center mb-10 md:mb-12 gap-4 max-w-3xl mx-auto">
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

        {/* Grid de Servicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.items.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>
        
      </div>
    </section>
  );
}
