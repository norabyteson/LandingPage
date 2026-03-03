import { cn } from "@/lib/utils";

interface GlowDividerProps {
  className?: string;
}

/**
 * Barra divisoria entre secciones: línea horizontal con acento primario en el centro.
 * Sustituye el antiguo “glow” por una separación visual clara y profesional.
 */
export default function GlowDivider({ className }: GlowDividerProps) {
  return (
    <div
      role="separator"
      aria-hidden="true"
      className={cn("relative flex items-center justify-center py-3", className)}
    >
      {/* Línea base sutil */}
      <div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--nb-light)]/10 to-transparent"
        aria-hidden="true"
      />
      {/* Barra central con color primario — marca visual clara */}
      <div
        className="relative z-[1] h-0.5 w-32 max-w-[40%] min-w-[6rem] rounded-full bg-gradient-to-r from-transparent via-[var(--nb-primary)]/70 to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}
