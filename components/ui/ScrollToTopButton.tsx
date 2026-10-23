"use client";

import { ArrowUp } from "lucide-react";
import { useInView } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

/**
 * Botón fijo «Volver arriba» (como el de Auxia): aparece cuando ya se bajó bastante.
 * Lo decide un marcador invisible de 150vh en lo alto del documento con IntersectionObserver
 * (sin escuchar el scroll): mientras se ve, el botón está oculto.
 * Redondo a propósito: es el único botón flotante; los demás controles son `rounded-xl`.
 */
export default function ScrollToTopButton({ label }: { label: string }) {
  const [markerRef, nearTop] = useInView<HTMLDivElement>({ once: false });
  const visible = !nearTop;

  const scrollToTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = (window as typeof window & {
      __lenis?: { scrollTo(target: number, opts?: { immediate?: boolean }): void };
    }).__lenis;
    if (lenis) lenis.scrollTo(0, { immediate: reduced });
    else window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    // El botón se oculta al llegar arriba: el foco pasa al contenido para no perderse.
    document.getElementById("main-content")?.focus({ preventScroll: true });
  };

  return (
    <>
      <div ref={markerRef} aria-hidden="true" className="pointer-events-none absolute top-0 left-0 h-[150vh] w-px" />
      <button
        type="button"
        aria-label={label}
        onClick={scrollToTop}
        inert={!visible}
        className={cn(
          "fixed right-4 bottom-4 z-[90] flex size-12 items-center justify-center rounded-full bg-brand text-on-brand shadow-lift sm:right-6 sm:bottom-6",
          "transition-[opacity,translate,background-color,scale] duration-300 ease-standard hover:bg-brand-hover active:scale-95 motion-reduce:transition-none",
          visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        )}
      >
        <ArrowUp size={20} strokeWidth={2.5} aria-hidden="true" />
      </button>
    </>
  );
}
