"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValueItem {
  title: string;
  description: string;
}

interface ValuePropsSectionProps {
  dict: {
    valueProps: {
      badge: string;
      title: string;
      subtitle: string;
      items: ValueItem[];
    };
  };
}

const cardAccents = [
  "from-[#266DD3] to-[#4A8FE8]",
  "from-[#1A4F9A] to-[#266DD3]",
  "from-[#4A8FE8] to-[#7EB0F5]",
];

function ValueCard({
  item,
  index,
  total,
  scrollYProgress,
}: {
  item: ValueItem;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const angle = (index / total) * Math.PI * 2 + Math.PI / 4;
  const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;
  const radiusX = isMobile ? 180 : 500;
  const radiusY = isMobile ? 250 : 350;
  const midX = Math.cos(angle) * radiusX;
  const midY = Math.sin(angle) * radiusY;
  const startX = midX * 3.5;
  const startY = midY * 3.5;
  const centerOffset = index - (total - 1) / 2;
  const stackSpreadX = isMobile ? 28 : 56;
  const endX = centerOffset * stackSpreadX;
  const endY = Math.abs(centerOffset) * 10 + centerOffset * 6;
  const endScale = 1 - Math.abs(centerOffset) * 0.03;
  const endRotate = centerOffset * 5;
  const rotateStart = (index * 47) % 60 - 30;
  const rotateMid = (index * 13) % 20 - 10;

  const x = useTransform(scrollYProgress, [0.15, 0.5, 0.8], [startX, midX, endX]);
  const y = useTransform(scrollYProgress, [0.15, 0.5, 0.8], [startY, midY, endY]);
  const scale = useTransform(scrollYProgress, [0.15, 0.5, 0.8], [1.35, 1, endScale]);
  const rotateZ = useTransform(scrollYProgress, [0.15, 0.5, 0.8], [rotateStart, rotateMid, endRotate]);
  const opacity = useTransform(scrollYProgress, [0.1, 0.25, 0.8], [0, 1, 1]);
  const bgOpacity = useTransform(scrollYProgress, [0.15, 0.5, 0.8], [0.35, 0.35, 1]);
  const zIndex = index + 10;

  return (
    <motion.article
      style={{ x, y, scale, rotateZ, opacity, zIndex }}
      className={cn(
        "absolute top-1/2 left-1/2 -mt-[150px] -ml-[165px] md:-mt-[165px] md:-ml-[205px]",
        "w-[330px] md:w-[410px] h-[290px] md:h-[330px] rounded-3xl flex flex-col gap-3 backdrop-blur-2xl overflow-hidden",
        "border border-[var(--nb-light)]/10 shadow-[0_15px_35px_rgba(0,0,0,0.6)] will-change-transform",
        "hover:border-[var(--nb-primary)]/40 hover:shadow-[0_15px_35px_rgba(38,109,211,0.2)] transition-colors transition-shadow duration-300 group cursor-default"
      )}
    >
      <motion.div
        style={{ opacity: bgOpacity }}
        className="absolute inset-0 z-0 bg-[var(--nb-dark-surface)] pointer-events-none"
      />

      <div className="relative z-10 p-6 md:p-8 flex flex-col h-full">
        <div
          className={cn(
            "w-11 h-11 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg shrink-0",
            cardAccents[index % cardAccents.length]
          )}
        >
          <Sparkles size={22} className="text-white/95" aria-hidden="true" />
        </div>
        <h3 className="text-[var(--nb-light)] font-bold text-base md:text-lg mt-4 group-hover:text-[var(--nb-primary-light)] transition-colors leading-snug">
          {item.title}
        </h3>
        <p className="text-[var(--nb-light)]/70 text-sm md:text-[0.95rem] leading-relaxed mt-2 flex-1">
          {item.description}
        </p>
      </div>
    </motion.article>
  );
}

export default function ValuePropsSection({ dict }: ValuePropsSectionProps) {
  const { valueProps } = dict;
  const containerRef = useRef<HTMLDivElement>(null);
  const totalItems = valueProps.items.length;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = scrollYProgress;
  const titleScale = useTransform(smoothProgress, [0.1, 0.3, 0.6, 0.75], [1.65, 1.08, 0.88, 0.5]);
  const titleOpacity = useTransform(smoothProgress, [0.1, 0.2, 0.6, 0.75], [1, 1, 1, 0]);
  const titleY = useTransform(smoothProgress, [0.1, 0.3, 0.6, 0.75], [-36, 0, 0, -72]);
  const titleFilter = useTransform(smoothProgress, [0.1, 0.2, 0.6, 0.75], ["blur(0px)", "blur(0px)", "blur(0px)", "blur(15px)"]);

  return (
    <section
      ref={containerRef}
      id="why-norabyte"
      className="relative bg-[var(--nb-section-deep)] h-[250vh]"
      style={{ position: "relative" }}
      aria-labelledby="why-norabyte-title"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--nb-dark)]/50 to-[var(--nb-dark)] z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vh] rounded-full blur-[250px] bg-[var(--nb-primary)]/15 pointer-events-none" />
        <div className="absolute inset-0 section-testimonials-bg opacity-30 pointer-events-none mix-blend-screen" />

        <div className="relative w-full max-w-7xl mx-auto h-full flex items-center justify-center px-4" style={{ perspective: "1500px" }}>
          <motion.div
            style={{ scale: titleScale, opacity: titleOpacity, y: titleY, filter: titleFilter }}
            className="absolute z-10 flex flex-col items-center justify-center pointer-events-none max-w-3xl px-4 text-center"
          >
            <p className="text-[var(--nb-primary)] font-bold tracking-[0.2em] uppercase text-xs md:text-sm mb-4 bg-[var(--nb-primary)]/10 px-4 py-1.5 rounded-full border border-[var(--nb-primary)]/20 shadow-[0_0_15px_rgba(38,109,211,0.3)]">
              {valueProps.badge}
            </p>
            <h2
              id="why-norabyte-title"
              className="text-4xl md:text-6xl lg:text-7xl font-black text-[var(--nb-primary)] tracking-tight leading-[1.1] filter drop-shadow-sm"
            >
              {valueProps.title}
            </h2>
            {valueProps.subtitle?.trim() ? (
              <p className="mt-5 max-w-xl text-[var(--nb-light)]/60 text-sm md:text-base leading-relaxed font-medium">
                {valueProps.subtitle}
              </p>
            ) : null}
          </motion.div>

          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
            {valueProps.items.map((item, i) => (
              <ValueCard
                key={item.title}
                item={item}
                index={i}
                total={totalItems}
                scrollYProgress={smoothProgress}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
