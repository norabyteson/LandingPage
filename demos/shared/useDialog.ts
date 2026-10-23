"use client";

import { useEffect, useRef } from "react";

/**
 * Conducta común de los diálogos de los demos (el estilo lo pone cada demo): al abrir, el foco
 * entra al primer campo o botón; Escape cierra; al cerrar, el foco vuelve a donde estaba.
 * `onClose` se guarda en una referencia: el padre suele pasar una función nueva en cada render
 * y el efecto que mueve el foco debe correr una sola vez.
 */
export function useDialog<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const first = ref.current?.querySelector<HTMLElement>("input, select, textarea, button:not([data-close])");
    (first ?? ref.current)?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseRef.current();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, []);

  return ref;
}
