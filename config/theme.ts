/**
 * NORABYTE — Configuración central del tema
 * ==========================================
 * Este es el ÚNICO archivo que debes editar para cambiar la paleta,
 * animaciones, superficies y colores de sección en toda la aplicación.
 *
 * Los cambios aquí se aplican en runtime vía ThemeVarsInjector,
 * que inyecta las variables CSS en document.documentElement.
 *
 * PALETA BASE:
 *   dark    → #191716  (oscuro)
 *   primary → #266DD3  (azul de marca)
 *   light   → #F0F0F0  (claro)
 */

export const theme = {
  colors: {
    /** Color oscuro oficial */
    dark: "#191716",

    /** Principal oficial */
    primary: "#266DD3",

    /** Claro oficial */
    light: "#F0F0F0",

    /** Variantes del primario usando opacidades o oscureciéndolo (para hover/active) */
    primaryLight: "#3B7BE0", 
    primaryDark:  "#1D5BB5",

    /** Superficies (utilizamos el mismo oscuro pero con distinto fondo visual si es necesario, o colores sólidos basados en requerimiento) */
    darkMuted:   "#191716",
    darkSurface: "#191716",
  },

  /**
   * Colores semánticos por modo
   * ─────────────────────────────
   * bg      → fondo principal de la página
   * fg      → texto principal
   * surface → superficies elevadas (cards, inputs)
   * muted   → superficies secundarias / más oscuras
   * glassBg → fondo del efecto liquid-glass
   */
  modes: {
    dark: {
      bg:           "#191716",
      fg:           "#F0F0F0",
      surface:      "#191716", /* Igual al bg pero será diferenciado por border sólido */
      muted:        "#191716",
      glassBg:      "rgba(25, 23, 22, 0.7)",
      glassBorder:  "rgba(240, 240, 240, 0.15)",
      glassShadow:  "rgba(38, 109, 211, 0.3)",
    },
    light: {
      bg:           "#F0F0F0",
      fg:           "#191716",
      surface:      "#FFFFFF", // El modo claro puede usar blanco puro para tarjetas
      muted:        "#E0E0E0", // Un gris sólido para modo claro
      glassBg:      "rgba(240, 240, 240, 0.9)",
      glassBorder:  "rgba(25, 23, 22, 0.15)",
      glassShadow:  "rgba(38, 109, 211, 0.2)",
    },
  },

  /**
   * Fondos de sección diferenciados
   * ─────────────────────────────────
   * Derivados de la paleta con suficiente contraste para distinguir
   * secciones sin necesidad de líneas divisoras.
   *
   * Modo claro: tonos con tinte de color pronunciado (no grises suaves).
   */
  sections: {
    // Reduciendo totalmente la cantidad de colores a cortes sólidos con la paleta estricta.
    dark: {
      navy:    "#191716", 
      deep:    "#121110", // Apenas diferenciable, solo para separar
      warm:    "#191716",
      mid:     "#191716",
      contact: "#266DD3", // Contacto va a color predominante azul
    },
    light: {
      navy:    "#F0F0F0",
      deep:    "#E5E5E5", // Apenas diferenciable del claro
      warm:    "#F0F0F0",
      mid:     "#F0F0F0",
      contact: "#266DD3", // Fuerte para destacar en claro también
    },
  },

  /**
   * Efecto Liquid Glass — ajusta blur, opacidad y bordes
   */
  glass: {
    blur:        "16px",
    opacity:     "0.08",
    border:      "rgba(240, 240, 240, 0.10)",
    shadowLight: "rgba(38, 109, 211, 0.15)",
    shadowDark:  "rgba(0, 0, 0, 0.4)",
  },

  /**
   * Tipografía
   */
  fonts: {
    sans: "var(--font-geist-sans), 'Inter', system-ui, sans-serif",
    mono: "var(--font-geist-mono), 'JetBrains Mono', monospace",
  },

  /**
   * Radios de borde
   */
  radii: {
    sm:   "0.5rem",
    md:   "0.75rem",
    lg:   "1.25rem",
    xl:   "2rem",
    full: "9999px",
  },

  /**
   * Duraciones de animación
   * ─────────────────────────
   * Mantén estos valores bajos para que el UI se sienta ágil.
   * fast   → micro-interacciones (hover, focus)
   * normal → transiciones de estado
   * slow   → entradas de sección / animaciones decorativas
   */
  animation: {
    fast:   "100ms",
    normal: "180ms",
    slow:   "300ms",
    spring: { stiffness: 380, damping: 36 },
  },

  /**
   * Breakpoints (deben coincidir con los de Tailwind)
   */
  breakpoints: {
    sm:   "640px",
    md:   "768px",
    lg:   "1024px",
    xl:   "1280px",
    "2xl": "1536px",
  },
} as const;

export type Theme = typeof theme;
