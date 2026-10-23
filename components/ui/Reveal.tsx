"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { markPlayed } from "@/lib/played";
import { cn } from "@/lib/utils";

/**
 * ¿El elemento ya entró en pantalla? Con `once` deja de observar la primera vez (entradas);
 * sin él sigue el estado (p. ej. la sombra de la cabecera). IntersectionObserver y no un
 * listener de scroll: no corre en cada frame.
 */
export function useInView<T extends Element>({
  once = true,
  rootMargin = "0px 0px -12% 0px",
}: { once?: boolean; rootMargin?: string } = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(!once);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry?.isIntersecting === true;
        if (once) {
          if (visible) {
            setInView(true);
            observer.disconnect();
          }
        } else {
          setInView(visible);
        }
      },
      { rootMargin: once ? rootMargin : "0px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [once, rootMargin]);

  return [ref, inView] as const;
}

/**
 * Aparece al entrar en pantalla: sube 1.5rem y gana opacidad, una sola vez por pestaña
 * (lib/played.ts: al volver, ya está en su sitio). Expone `data-shown` para que los hijos
 * encadenen detalles (`group-data-[shown=true]/reveal:` + clase `reveal-detail`).
 * Con «reducir movimiento» del sistema el contenido está visible desde el inicio.
 */
export default function Reveal({
  name,
  children,
  className,
  delay = 0,
}: {
  /** Clave fija y única en la página (`[a-z0-9:-]`) para recordar que ya se animó. */
  name: string;
  children: ReactNode;
  className?: string;
  /** Retraso en ms, para escalonar elementos de una misma lista. */
  delay?: number;
}) {
  const [ref, shown] = useInView<HTMLDivElement>();
  const style: CSSProperties = { transitionDelay: `${delay}ms` };

  useEffect(() => {
    if (shown) markPlayed(name, 1400 + delay);
  }, [shown, name, delay]);

  return (
    <div
      ref={ref}
      style={style}
      data-reveal={name}
      data-shown={shown}
      className={cn(
        "group/reveal transition-[opacity,translate] duration-700 ease-standard motion-reduce:transition-none",
        !shown && "motion-safe:translate-y-6 motion-safe:opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
}
