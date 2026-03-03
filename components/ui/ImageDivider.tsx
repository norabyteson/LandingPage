"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface ImageDividerProps {
  imageSrc: string;
  title: string;
  subtitle?: string;
}

export default function ImageDivider({ imageSrc, title, subtitle }: ImageDividerProps) {
  return (
    <section className="relative w-full h-[350px] md:h-[450px] overflow-hidden flex items-center justify-center border-y border-white/5">
      <div className="absolute inset-0 z-0">
        <Image 
          src={imageSrc} 
          fill 
          className="object-cover" 
          alt="Visual Divider" 
          priority={false}
        />
        <div className="absolute inset-0 bg-[var(--nb-dark)]/85 backdrop-blur-[2px]" />
        
        {/* Glow sutil central */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[600px] h-[300px] bg-[var(--nb-primary)]/15 blur-[120px] rounded-[100%]" />
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
        whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 text-center px-4 max-w-4xl flex flex-col items-center gap-4"
      >
         <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[var(--nb-light)] tracking-tight">
             {title}
         </h2>
         {subtitle && (
            <p className="text-[var(--nb-light)]/70 text-base md:text-xl max-w-2xl font-medium">
                {subtitle}
            </p>
         )}
      </motion.div>
    </section>
  );
}
