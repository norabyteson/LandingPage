"use client";

import { useEffect } from "react";
import { markPlayed } from "@/lib/played";

/**
 * Para entradas hechas solo con CSS (Hero, páginas legales), que no pasan por `Reveal`:
 * al montarse registra la clave como vista en esta pestaña. El contenedor animado lleva
 * `data-reveal` con la misma clave.
 */
export default function MarkPlayed({ name }: { name: string }) {
  useEffect(() => {
    markPlayed(name);
  }, [name]);
  return null;
}
