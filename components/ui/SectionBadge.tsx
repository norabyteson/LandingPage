"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export default function SectionBadge({ children, className }: SectionBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex items-center gap-3 text-sm font-bold tracking-[0.2em] uppercase text-[var(--nb-primary)]",
        className
      )}
    >
      <span className="w-8 h-px bg-[var(--nb-primary)]/50" aria-hidden="true" />
      {children}
    </motion.div>
  );
}
