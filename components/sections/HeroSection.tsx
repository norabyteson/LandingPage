"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import type { Locale } from "@/types/i18n";
import SectionBadge from "@/components/ui/SectionBadge";

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

export default function HeroSection({ dict, lang }: HeroSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Smooth scroll logic
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Mouse parallax logic for the 3D object
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const springConfig = { damping: 25, stiffness: 150 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 20; // max rotation degrees
      const y = (e.clientY / innerHeight - 0.5) * -20;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const { hero } = dict;

  return (
    <section
      ref={ref}
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ position: "relative" }}
      aria-label="Sección principal"
    >
      {/* Fondo sólido y limpio */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 pointer-events-none bg-[var(--nb-dark)]"
        aria-hidden="true"
      />

      {/* Contenido principal */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        <div ref={containerRef} className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[85vh] py-24">

          {/* Columna izquierda — Texto (Sin animaciones de entrada para carga instantánea) */}
          <div className="flex flex-col items-start z-20 relative">
            {/* Badge Limpio */}
            <div className="mb-6">
               <SectionBadge>{hero.badge}</SectionBadge>
            </div>

            {/* Titular principal */}
            <h1 className="heading-xl text-[var(--nb-light)] mb-6 drop-shadow-sm">
              {hero.headline.split(" ").slice(0, 3).join(" ")}{" "}
              <span className="gradient-text">
                {hero.headline.split(" ").slice(3).join(" ")}
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="text-[var(--nb-light)]/65 text-[1.1rem] md:text-[1.15rem] leading-relaxed max-w-lg mb-10 drop-shadow-sm">
              {hero.subheadline}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <a
                href={`/${lang}#contact`}
                className="btn-primary group"
                aria-label={hero.ctaPrimary}
              >
                {hero.ctaPrimary}
                <ArrowRight
                  size={16}
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </a>
              <a
                href={`/${lang}#services`}
                className="btn-ghost"
                aria-label={hero.ctaSecondary}
              >
                {hero.ctaSecondary}
              </a>
            </div>
          </div>

          {/* Columna derecha — 3D Parallax */}
          <div
            className="relative flex items-center justify-center lg:justify-end perspective-1000 z-10 w-full mt-8 lg:mt-0"
            style={{ perspective: "1200px" }}
            aria-hidden="true"
          >
            {/* Contenedor 3D Interactivo (Responsive: escala en móvil, full en desktop) */}
            <motion.div
              style={{ rotateY: mouseX, rotateX: mouseY }}
              className="relative w-full max-w-lg lg:w-[125%] lg:max-w-3xl lg:-mr-[15%] transform-style-3d shadow-[0_30px_60px_rgba(0,0,0,0.4)] rounded-2xl"
            >
              {/* Frame de dispositivo Limpio (Eliminado hover:scale para evitar saltos) */}
              <div className="glass rounded-2xl overflow-hidden border border-[var(--nb-light)]/10 shadow-2xl bg-[var(--nb-dark-surface)] transition-colors duration-200">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[var(--nb-light)]/5 bg-[var(--nb-dark)]/50">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                  <div className="flex-1 mx-3 h-5 rounded bg-[var(--nb-light)]/5 flex items-center px-3 justify-center">
                    <span className="text-[10px] text-[var(--nb-light)]/40 tracking-widest font-mono font-bold">NORABYTE SYSTEM</span>
                  </div>
                </div>
                <div className="relative w-full aspect-[16/10]">
                  <Image
                    src="https://placehold.co/1200x750/191716/266DD3?text=NORABYTE+Dashboard&font=raleway"
                    alt="Dashboard profesional de NORABYTE"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 60vw"
                    priority
                    unoptimized
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Flecha de scroll */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        aria-hidden="true"
      >
        <a
          href={`/${lang}#services`}
          className="flex flex-col items-center gap-1 text-[var(--nb-light)]/30 hover:text-[var(--nb-light)]/60 transition-colors cursor-pointer group"
          aria-label="Ir a servicios"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={24} className="group-hover:text-[var(--nb-primary-light)] transition-colors" />
          </motion.div>
        </a>
      </motion.div>
    </section>
  );
}
