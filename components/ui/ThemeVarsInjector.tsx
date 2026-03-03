"use client";

import { useEffect } from "react";
import { useTheme } from "@/lib/theme";
import { theme } from "@/config/theme";

/**
 * Sincroniza las variables CSS del documento con config/theme.ts.
 *
 * Al cambiar un valor en theme.ts (y reconstruir / HMR), este componente
 * aplica los nuevos valores como propiedades inline en <html>, que tienen
 * prioridad sobre el CSS base de globals.css.
 *
 * También se re-ejecuta cuando el usuario cambia entre modo oscuro y claro,
 * aplicando el mapeo semántico correcto (modes.dark / modes.light).
 *
 * NO renderiza ningún elemento — devuelve null.
 */
export default function ThemeVarsInjector() {
  const { theme: mode } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    const c = theme.colors;
    const m = theme.modes[mode];
    const s = theme.sections[mode];
    const a = theme.animation;

    // Paleta base — siempre la misma independientemente del modo
    root.style.setProperty("--nb-primary",       c.primary);
    root.style.setProperty("--nb-primary-light",  c.primaryLight);
    root.style.setProperty("--nb-primary-dark",   c.primaryDark);

    // Semánticos — cambian según el modo activo
    root.style.setProperty("--nb-dark",           m.bg);
    root.style.setProperty("--nb-light",          m.fg);
    root.style.setProperty("--nb-dark-surface",   m.surface);
    root.style.setProperty("--nb-dark-muted",     m.muted);
    root.style.setProperty("--glass-bg",          m.glassBg);
    root.style.setProperty("--glass-border",      m.glassBorder);
    root.style.setProperty("--glass-shadow-color", m.glassShadow);

    // Fondos de sección
    root.style.setProperty("--nb-section-navy",    s.navy);
    root.style.setProperty("--nb-section-deep",    s.deep);
    root.style.setProperty("--nb-section-warm",    s.warm);
    root.style.setProperty("--nb-section-mid",     s.mid);
    root.style.setProperty("--nb-section-contact", s.contact);

    // Velocidades de transición
    const ease = "cubic-bezier(0.4, 0, 0.2, 1)";
    root.style.setProperty("--transition-fast",   `${a.fast} ${ease}`);
    root.style.setProperty("--transition-normal", `${a.normal} ${ease}`);
    root.style.setProperty("--transition-slow",   `${a.slow} ${ease}`);
  }, [mode]);

  return null;
}
