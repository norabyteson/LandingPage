"use client";

import Image from "next/image";
import SectionBadge from "@/components/ui/SectionBadge";
import AnimatedSection from "@/components/ui/AnimatedSection";

interface AboutSectionProps {
  dict: {
    about: {
      badge: string;
      title: string;
      description: string;
    };
  };
}

export default function AboutSection({ dict }: AboutSectionProps) {
  const { about } = dict;

  return (
    <section
      id="about"
      className="relative overflow-hidden section-padding text-white"
      aria-labelledby="about-title"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000"
          alt="Abstract tech background"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#0F0D0C]/85 z-10" aria-hidden="true" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      </div>
    </section>
  );
}
