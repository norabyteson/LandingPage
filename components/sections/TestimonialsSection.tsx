"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestimonialItem {
  name: string;
  role: string;
  content: string;
}

interface TestimonialsSectionProps {
  dict: {
    testimonials: {
      badge: string;
      title: string;
      items: TestimonialItem[];
    };
  };
}

const avatarColors = [
  "from-[#266DD3] to-[#4A8FE8]",
  "from-[#1A4F9A] to-[#266DD3]",
  "from-[#4A8FE8] to-[#7EB0F5]",
  "from-[#1A4F9A] to-[#266DD3]",
  "from-[#7EB0F5] to-[#266DD3]"
];

function Card({ item, index, total, scrollYProgress }: { item: TestimonialItem; index: number; total: number; scrollYProgress: any }) {
  // Configuración de distribución radial / orgánica
  // Repartimos en 360 grados, pero ajustamos un poco para que no quede encima del título
  const angle = (index / total) * Math.PI * 2 + (Math.PI / 4); // Offset inicial de 45deg
  
  // Radio elíptico (más ancho que alto) dependiente de la pantalla. Valores seguros SSR:
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const radiusX = isMobile ? 180 : 500;
  const radiusY = isMobile ? 250 : 350;
  
  const midX = Math.cos(angle) * radiusX;
  const midY = Math.sin(angle) * radiusY;
  
  // Posiciones inicio (muy lejos, "fuera del contenedor y se vayan acercando")
  const startX = midX * 3.5;
  const startY = midY * 3.5;
  
  // Posición apilada en el centro al final (Efecto de baraja / Fanned deck)
  const centerOffset = index - (total - 1) / 2; // -2, -1, 0, 1, 2 (para 5 cartas)
  const stackSpreadX = isMobile ? 35 : 70; // Separación horizontal
  
  const endX = centerOffset * stackSpreadX;
  const endY = Math.abs(centerOffset) * 12 + (centerOffset * 8); // Forma de arco suave
  
  const endScale = 1 - (Math.abs(centerOffset) * 0.04); // Extremos ligeramente más pequeños
  const endRotate = centerOffset * 6; // Ángulo de abanico
  
  // Usamos valores pseudo-aleatorios deterministas basados en el index
  // para que SSR y Cliente concuerden a la perfección y no haya saltos al montar.
  const rotateStart = (index * 47) % 60 - 30;
  const rotateMid = (index * 13) % 20 - 10;
  
  // Ajustamos los keyframes:
  // Inicio en 0.15: Le da tiempo al texto central de ser visible antes de que los comentarios vuelen rápido.
  // Final en 0.80: Asegura que el empaquetado 3D (stack) llegue a formarse antes de que la sección salga de la pantalla.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const x = useTransform(scrollYProgress, [0.15, 0.5, 0.8], [startX, midX, endX]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const y = useTransform(scrollYProgress, [0.15, 0.5, 0.8], [startY, midY, endY]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const scale = useTransform(scrollYProgress, [0.15, 0.5, 0.8], [1.4, 1, endScale]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const rotateZ = useTransform(scrollYProgress, [0.15, 0.5, 0.8], [rotateStart, rotateMid, endRotate]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const opacity = useTransform(scrollYProgress, [0.1, 0.25, 0.8], [0, 1, 1]); // Entran más suave
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const bgOpacity = useTransform(scrollYProgress, [0.15, 0.5, 0.8], [0.35, 0.35, 1]); // Opacidad de capa de fondo compatible con tema
  
  const zIndex = index + 10; // Para stack visual natural

  return (
    <motion.blockquote
      style={{
        x, y, scale, rotateZ, opacity, zIndex
      }}
      className={cn(
        "absolute top-1/2 left-1/2 -mt-[140px] -ml-[160px] md:-mt-[160px] md:-ml-[200px]",
        "w-[320px] md:w-[400px] h-[280px] md:h-[320px] rounded-3xl flex flex-col gap-4 backdrop-blur-2xl overflow-hidden",
        "border border-[var(--nb-light)]/10 shadow-[0_15px_35px_rgba(0,0,0,0.6)] will-change-transform",
        "hover:border-[var(--nb-primary)]/40 hover:shadow-[0_15px_35px_rgba(38,109,211,0.2)] transition-colors transition-shadow duration-300 group cursor-default"
      )}
    >
      {/* Dynamic Background layer compatiple con Light/Dark modes */}
      <motion.div 
         style={{ opacity: bgOpacity }}
         className="absolute inset-0 z-0 bg-[var(--nb-dark-surface)] pointer-events-none" 
      />

      <div className="relative z-10 p-6 md:p-8 flex flex-col h-full">
        <Quote size={30} className="text-[var(--nb-primary)]/40 absolute top-6 right-6 group-hover:text-[var(--nb-primary)]/80 transition-colors" />
        <div className="flex gap-1">
          {[...Array(5)].map((_, si) => (
            <Star key={si} size={14} className="fill-[var(--nb-primary)] text-[var(--nb-primary)]" />
          ))}
        </div>
        <p className="text-[var(--nb-light)] text-sm md:text-base leading-relaxed line-clamp-4 mt-4 font-medium">
          &ldquo;{item.content}&rdquo;
        </p>
        <footer className="flex items-center gap-4 mt-auto pt-4 border-t border-[var(--nb-light)]/5 group-hover:border-[var(--nb-light)]/20 transition-colors">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center shadow-lg`}>
            <span className="text-white font-bold text-base">{item.name.charAt(0)}</span>
          </div>
          <div className="flex flex-col">
            <div className="text-[var(--nb-light)] font-bold text-sm md:text-base group-hover:text-[var(--nb-primary-light)] transition-colors">{item.name}</div>
            <div className="text-[var(--nb-light)]/50 text-xs md:text-sm">{item.role}</div>
          </div>
        </footer>
      </div>
    </motion.blockquote>
  );
}

export default function TestimonialsSection({ dict }: TestimonialsSectionProps) {
  const { testimonials } = dict;
  const containerRef = useRef<HTMLDivElement>(null);
  const totalItems = testimonials.items.length;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = scrollYProgress; // Sincronizado directo con scroll

  // Título principal en el centro
  // Retrasamos su movimiento inicial (0.1) y aceleramos su salida (0.75) para que no entorpezca las cartas agrupadas al final.
  const titleScale = useTransform(smoothProgress, [0.1, 0.3, 0.6, 0.75], [1.8, 1.1, 0.85, 0.5]);
  const titleOpacity = useTransform(smoothProgress, [0.1, 0.2, 0.6, 0.75], [1, 1, 1, 0]); // Inicia visible
  const titleY = useTransform(smoothProgress, [0.1, 0.3, 0.6, 0.75], [-40, 0, 0, -80]);
  const titleFilter = useTransform(smoothProgress, [0.1, 0.2, 0.6, 0.75], ["blur(0px)", "blur(0px)", "blur(0px)", "blur(15px)"]);

  // El contenedor debe renderizarse en el primer paso (SSR) para que useScroll hidrate su ref correctamente.

  return (
    <section ref={containerRef} id="testimonials" className="relative bg-[var(--nb-section-deep)] h-[250vh]" style={{ position: "relative" }}>
      {/* Contenedor Sticky: mantiene la pantalla fija permitiendo 400vh de scroll */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* Luces y texturas de fondo */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--nb-dark)]/50 to-[var(--nb-dark)] z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vh] rounded-full blur-[250px] bg-[var(--nb-primary)]/15 pointer-events-none" />
        <div className="absolute inset-0 section-testimonials-bg opacity-30 pointer-events-none mix-blend-screen" />

        {/* Contenedor central 3D */}
        <div className="relative w-full max-w-7xl mx-auto h-full flex items-center justify-center px-4" style={{ perspective: "1500px" }}>
          
          {/* TÍTULO CENTRAL ANIMADO */}
          <motion.div 
            style={{ scale: titleScale, opacity: titleOpacity, y: titleY, filter: titleFilter }}
            className="absolute z-10 flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="text-[var(--nb-primary)] font-bold tracking-[0.2em] uppercase text-xs md:text-sm mb-4 bg-[var(--nb-primary)]/10 px-4 py-1.5 rounded-full border border-[var(--nb-primary)]/20 shadow-[0_0_15px_rgba(38,109,211,0.3)]">
              {testimonials.badge}
            </div>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-[var(--nb-primary)] tracking-tight text-center leading-[1.1] filter drop-shadow-sm">
              {testimonials.title}
            </h2>
          </motion.div>

          {/* CARTAS DE TESTIMONIOS */}
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
            {testimonials.items.map((testimonial, i) => (
              <Card key={testimonial.name} item={testimonial} index={i} total={totalItems} scrollYProgress={smoothProgress} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
