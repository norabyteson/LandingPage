/**
 * Botones de la landing (enlaces o <button> con el mismo aspecto).
 * - `primary`: la acción principal de cada zona (una por zona).
 * - `secondary`: acciones de apoyo.
 * - `ghost`: acciones discretas (navegación, utilidades de la cabecera).
 *
 * Forma de la página: controles `rounded-xl`, tarjetas e imágenes `rounded-3xl`.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand text-on-brand shadow-card hover:bg-brand-hover",
  secondary:
    "border border-line-strong/40 bg-surface text-ink shadow-card hover:border-line-strong/70 hover:bg-surface-hover",
  ghost: "text-ink-muted hover:bg-surface-hover hover:text-ink",
};

const SIZES: Record<ButtonSize, string> = {
  md: "min-h-11 gap-2 px-4 text-sm [&_svg]:size-4",
  lg: "min-h-12 gap-2 px-5 text-base [&_svg]:size-5",
};

export const buttonClasses = (variant: ButtonVariant = "primary", size: ButtonSize = "md") =>
  `inline-flex shrink-0 items-center justify-center rounded-xl font-semibold whitespace-nowrap transition-[color,background-color,border-color,scale] duration-150 ease-standard select-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 [&_svg]:shrink-0 ${SIZES[size]} ${VARIANTS[variant]}`;

/** La flecha de los botones se adelanta un poco al pasar el puntero. */
export const arrowNudge =
  "transition-transform duration-200 ease-standard group-hover:translate-x-1 motion-reduce:transition-none";
