"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import SectionBadge from "@/components/ui/SectionBadge";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { cn } from "@/lib/utils";
import { MessageSquare, Eye, Code2, ShieldCheck, GraduationCap, Headphones, CheckCircle2 } from "lucide-react";

interface ProcessStep {
  number: string;
  title: string;
  description: string;
  short?: string;
}

interface ProcessSectionProps {
  dict: {
    process: {
      badge: string;
      title: string;
      subtitle: string;
      steps: ProcessStep[];
    };
  };
}

export default function ProcessSection({ dict }: ProcessSectionProps) {
  const { process } = dict;
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgHeight, setSvgHeight] = useState(0);

  // Observador para mantener el SVG del tamaño exacto del contenedor derecho
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setSvgHeight(entry.contentRect.height);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // La animación principal basada en el scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  // Usamos el progreso directo para que esté sincronizado al 100% con el scroll
  const smoothProgress = scrollYProgress;

  return (
    <section
      id="process"
      ref={sectionRef}
      className="section-padding relative overflow-hidden bg-[#161413]"
      aria-labelledby="process-title"
    >
      {/* Background Lighting */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[160px] bg-[var(--nb-primary)]/10" aria-hidden="true" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[160px] bg-[#4A8FE8]/5" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Principal */}
        <div className="flex flex-col mb-16 gap-5 max-w-2xl">
          <SectionBadge className="text-white/60 before:bg-white/20">{process.badge}</SectionBadge>
          <AnimatedSection delay={0.1}>
            <h2 id="process-title" className="heading-lg text-white leading-tight">
              {process.title}
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="text-white/60 text-lg leading-relaxed">
              {process.subtitle}
            </p>
          </AnimatedSection>
        </div>

        {/* Layout Profesional: 2 Columnas (Sticky Image + Scrolling Path) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 relative">
          
          {/* Col 1: Panel Interactivo (Distribuido) */}
          <div className="lg:col-span-5 h-full relative z-20">
            <AnimatedSection delay={0.3}>
              {/* Contenedor que abarca el 100% del alto de la sección para alinearse con el timeline */}
              <div className="relative w-full h-[1000px] lg:h-[1300px] flex items-center justify-center -mx-4 lg:mx-0 z-20">
                
                {/* Iluminación de fondo general */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(38,109,211,0.08)_0%,transparent_70%)] pointer-events-none" />

                <div className="relative w-full h-full">
                  {[
                     { 
                       icon: MessageSquare, color: "from-blue-500/10 to-transparent", border: "border-blue-500/20",
                       position: { top: "0%", left: "0%" }, delay: 0.1,
                       visual: (
                         <div className="mt-4 flex gap-2">
                           <div className="w-8 h-8 rounded-full bg-blue-500/20 flex-shrink-0" />
                           <div className="space-y-1.5 flex-1">
                             <div className="w-full h-2 bg-white/20 rounded-full" />
                             <div className="w-2/3 h-2 bg-white/10 rounded-full" />
                           </div>
                         </div>
                       )
                     },
                     { 
                       icon: Eye, color: "from-purple-500/10 to-transparent", border: "border-purple-500/20",
                       position: { top: "17%", right: "0%" }, delay: 0.2,
                       visual: (
                         <div className="mt-4 w-full h-12 border border-purple-500/30 bg-purple-500/10 rounded-lg flex items-center justify-between px-3">
                           <div className="w-5 h-5 rounded bg-purple-400/50" />
                           <div className="w-16 h-2 bg-white/20 rounded-full" />
                           <div className="w-5 h-5 rounded-full bg-white/10" />
                         </div>
                       )
                     },
                     { 
                       icon: Code2, color: "from-green-500/10 to-transparent", border: "border-green-500/20",
                       position: { top: "34%", left: "5%" }, delay: 0.3,
                       visual: (
                         <div className="mt-4 space-y-2">
                           <div className="flex justify-between items-center text-[10px] text-green-400 font-mono">
                             <span>Build Process</span> <span>[======&gt;  ] 75%</span>
                           </div>
                           <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                             <div className="w-[75%] h-full bg-green-500 rounded-full" />
                           </div>
                         </div>
                       )
                     },
                     { 
                       icon: ShieldCheck, color: "from-amber-500/10 to-transparent", border: "border-amber-500/20",
                       position: { top: "51%", right: "5%" }, delay: 0.4,
                       visual: (
                         <div className="mt-4 flex gap-2">
                           {[1,2,3].map(i => (
                             <div key={i} className="flex-1 h-8 rounded-lg bg-white/5 border border-amber-500/20 flex items-center justify-center">
                               <CheckCircle2 size={12} className="text-amber-500" />
                             </div>
                           ))}
                         </div>
                       )
                     },
                     { 
                       icon: GraduationCap, color: "from-rose-500/10 to-transparent", border: "border-rose-500/20",
                       position: { top: "68%", left: "0%" }, delay: 0.5,
                       visual: (
                         <div className="mt-4 flex items-center gap-3 bg-[#1A1A1A] p-2 rounded border border-rose-500/20">
                           <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                           <div className="text-[10px] text-white/70 font-mono">SERVER_ONLINE_200</div>
                         </div>
                       )
                     },
                     { 
                       icon: Headphones, color: "from-cyan-500/10 to-transparent", border: "border-cyan-500/20",
                       position: { top: "85%", right: "0%" }, delay: 0.6,
                       visual: (
                         <div className="mt-4 grid grid-cols-2 gap-2">
                           <div className="h-6 bg-cyan-500/10 border border-cyan-500/20 rounded flex items-center justify-center text-[9px] text-cyan-400">99.9% Uptime</div>
                           <div className="h-6 bg-cyan-500/10 border border-cyan-500/20 rounded flex items-center justify-center text-[9px] text-cyan-400">Soporte 24/7</div>
                         </div>
                       )
                     },
                  ].map((step, i) => {
                    const dictStep = process.steps[i];
                    const Icon = step.icon;
                    return (
                      <motion.div
                        key={dictStep.number}
                        drag
                        dragSnapToOrigin={true}
                        dragElastic={0.4}
                        dragTransition={{ bounceStiffness: 400, bounceDamping: 25 }}
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: step.delay, ease: "easeOut" }}
                        whileHover={{ 
                          scale: 1.05,
                          rotateX: 5,
                          rotateY: -5,
                          cursor: "grab",
                          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.4)",
                          zIndex: 50
                        }}
                        whileDrag={{ 
                          scale: 1.08,
                          rotateX: 10,
                          rotateY: -10,
                          cursor: "grabbing",
                          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                          zIndex: 60
                        }}
                        style={{
                          willChange: "transform, opacity",
                          ...step.position
                        }}
                        className={cn(
                          "absolute w-[240px] sm:w-[260px] bg-[#141414] rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex flex-col overflow-hidden border",
                          step.border
                        )}
                      >
                         {/* Gradiente sutil interno */}
                         <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none", step.color)} />
                         
                         {/* Header de la tarjeta */}
                         <div className="flex items-center justify-between relative z-10 mb-3">
                           <div className="flex items-center gap-3">
                             <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border bg-black/40", step.border)}>
                               <Icon size={16} className="text-white/80" />
                             </div>
                             <span className="text-xl font-black text-white/10 tracking-tighter">
                               {dictStep.number}
                             </span>
                           </div>
                         </div>
                         
                         {/* Contenido Concepto (No duplicado) */}
                         <div className="relative z-10">
                           <h3 className="text-white font-bold text-base mb-1">
                             {dictStep.title}
                           </h3>
                           <p className="text-[var(--nb-primary-light)]/80 text-xs font-medium uppercase tracking-wider mb-2">
                             {dictStep.short}
                           </p>
                           
                           {/* Representación Visual Única */}
                           {step.visual}
                         </div>
                         
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Col 2: Pasos y Mapa SVG Interconectado */}
          <div className="lg:col-span-7 relative" ref={containerRef} style={{ position: "relative" }}>
            
            {/* Camino de fondo SVG (Sólo Desktop) */}
            <div className="absolute left-[36px] top-8 bottom-0 w-32 hidden md:block z-0 pointer-events-none">
              <svg 
                width="100%" 
                height={svgHeight} 
                viewBox={`0 0 100 ${svgHeight || 800}`} 
                preserveAspectRatio="none" 
                className="overflow-visible"
              >
                <defs>
                  <linearGradient id="pathGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#266DD3" />
                    <stop offset="50%" stopColor="#7EB0F5" />
                    <stop offset="100%" stopColor="#266DD3" />
                  </linearGradient>
                  <filter id="pathGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Este 'd' dibuja un camino curveado que va bajando e intercalando, adaptado a cualquier altura */}
                <path
                  d={`M 0 0 C 80 150, -40 250, 0 ${svgHeight * 0.33} C 60 ${svgHeight * 0.5}, -20 ${svgHeight * 0.66}, 0 ${svgHeight}`}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="2"
                  strokeDasharray="8 8"
                />

                <motion.path
                  d={`M 0 0 C 80 150, -40 250, 0 ${svgHeight * 0.33} C 60 ${svgHeight * 0.5}, -20 ${svgHeight * 0.66}, 0 ${svgHeight}`}
                  fill="none"
                  stroke="url(#pathGradient)"
                  strokeWidth="4"
                  filter="url(#pathGlow)"
                  style={{ pathLength: smoothProgress }}
                />
              </svg>
            </div>

            {/* Alternativa móvil simple vertical */}
            <div className="absolute left-[26px] top-8 bottom-12 w-[2px] bg-white/10 md:hidden z-0" />
            <motion.div
              style={{ scaleY: smoothProgress, transformOrigin: "top" }}
              className="absolute left-[26px] top-8 bottom-12 w-[3px] md:hidden bg-gradient-to-b from-[#266DD3] via-[#7EB0F5] to-[#266DD3] z-0 shadow-[0_0_15px_rgba(38,109,211,0.6)]"
            />

            {/* Pasos */}
            <div className="flex flex-col gap-16 md:gap-24 relative z-10 py-6">
              {process.steps.map((step, i) => {
                const isEven = i % 2 === 0;
                
                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={cn(
                      "flex gap-6 md:gap-12",
                      "pl-8 sm:pl-12 md:pl-0", // Padding móvil para librar la linea
                      isEven ? "md:ml-0" : "md:ml-12" // Offset alternado en desktop
                    )}
                  >
                    {/* Botón númerico */}
                    <div className="flex-shrink-0 relative">
                      <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#1A1817] border-2 border-[var(--nb-primary)]/40 flex items-center justify-center shadow-lg group-hover:border-[var(--nb-primary)] transition-colors duration-300 relative z-20">
                        <span className="text-white font-mono font-bold text-sm md:text-base tracking-widest">
                          {step.number.padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    {/* Texto del paso */}
                    <div className="flex flex-col gap-3 group">
                      <h3 className="text-white font-bold text-xl md:text-2xl group-hover:text-[var(--nb-primary-light)] transition-colors duration-300">
                        {step.title}
                      </h3>
                      <p className="text-white/65 text-sm md:text-base leading-relaxed max-w-lg">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
