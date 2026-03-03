"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  MessageCircle,
  CalendarCheck,
  TrendingUp,
  Handshake,
} from "lucide-react";
import SectionBadge from "@/components/ui/SectionBadge";
import AnimatedSection from "@/components/ui/AnimatedSection";

interface AboutValue {
  title: string;
  description: string;
}

interface AboutSectionProps {
  dict: {
    about: {
      badge: string;
      title: string;
      description: string;
      values: AboutValue[];
    };
  };
}

const VALUE_ICONS = [MessageCircle, CalendarCheck, TrendingUp, Handshake];

export default function AboutSection({ dict }: AboutSectionProps) {
  const { about } = dict;

  return (
    <section
      id="about"
      className="relative overflow-hidden section-padding text-white"
      aria-labelledby="about-title"
    >
      {/* Fondo de Imagen Oscurecido (Reemplazo de ImageDivider) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000"
          alt="Abstract tech background"
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-[#0F0D0C]/85 z-10" aria-hidden="true" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Cabecera */}
        <div className="flex flex-col items-center text-center mb-16 gap-5 max-w-4xl mx-auto">
          <SectionBadge className="text-white/70 before:bg-[var(--nb-primary)]/40">{about.badge}</SectionBadge>
          <AnimatedSection delay={0.1}>
            <h2 id="about-title" className="heading-lg text-white">
              {about.title}
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed mt-4">
              {about.description}
            </p>
          </AnimatedSection>
        </div>

        {/* Grid de valores */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          role="list"
          aria-label="Nuestros valores"
        >
          {about.values.map((value, i) => {
            const Icon = VALUE_ICONS[i % VALUE_ICONS.length];
            return (
              <motion.div
                key={value.title}
                role="listitem"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="bg-black/30 backdrop-blur-sm group rounded-3xl p-8 border border-white/10 flex flex-col gap-5 hover:-translate-y-2 transition-transform duration-300 shadow-xl"
              >
                {/* Ícono */}
                <div className="w-14 h-14 rounded-2xl bg-[var(--nb-primary)]/20 border border-[var(--nb-primary)]/30 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--nb-primary)] transition-colors duration-300">
                  <Icon
                    size={24}
                    className="text-[var(--nb-primary-light)] group-hover:text-white transition-colors duration-300"
                    aria-hidden="true"
                  />
                </div>
                {/* Texto */}
                <div>
                  <h3 className="text-white font-bold text-lg mb-3 leading-snug">
                    {value.title}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
