"use client";

import { useId, type ButtonHTMLAttributes, type ReactNode } from "react";
import Image from "next/image";
import { useDialog } from "../../shared/useDialog";
import { Footprints, Gem, Shirt, X, type LucideIcon } from "lucide-react";
import type { CategoryId, Product } from "../types";

/* ---------- Botones ---------- */

type Variant = "primary" | "secondary" | "ghost" | "danger";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
  secondary: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 shadow-sm",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
};

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-9 px-3 text-sm gap-1.5", md: "h-10 px-4 text-sm gap-2", lg: "h-12 px-5 text-base gap-2" };
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center rounded-lg font-semibold whitespace-nowrap transition-[background-color,scale] duration-150 select-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 [&_svg]:shrink-0 ${sizes[size]} ${VARIANTS[variant]} ${className}`}
    />
  );
}

/* ---------- Modal ---------- */

/** Diálogo modal: Escape y clic fuera cierran; el foco entra al abrir y vuelve al cerrar. */
export function Modal({
  title,
  onClose,
  children,
  footer,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  const ref = useDialog<HTMLDivElement>(onClose);
  const titleId = useId();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`demo-in flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl outline-none sm:rounded-2xl ${wide ? "sm:max-w-2xl" : "sm:max-w-md"}`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <h2 id={titleId} className="text-lg font-bold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            data-close
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- Campos ---------- */

/** Campo sin ancho: para filtros que se ajustan a su contenido (`${inputBase} w-auto`). */
export const inputBase =
  "h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none";
export const inputClass = `${inputBase} w-full`;

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {children}
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

/* ---------- Etiquetas ---------- */

const TONES = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  red: "bg-rose-50 text-rose-700 ring-rose-200",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  gray: "bg-slate-100 text-slate-600 ring-slate-200",
};
export function Badge({ tone = "gray", children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${TONES[tone]}`}>
      {children}
    </span>
  );
}

/* ---------- Producto ---------- */

const CATEGORY_ICON: Record<CategoryId, LucideIcon> = {
  tops: Shirt,
  pantalones: Shirt,
  chamarras: Shirt,
  calzado: Footprints,
  accesorios: Gem,
};

/** Foto del producto o, si no tiene, un mosaico con el icono de su categoría. */
export function ProductThumb({ product, className = "" }: { product: Product; className?: string }) {
  const Icon = CATEGORY_ICON[product.category];
  return (
    <span className={`relative block overflow-hidden bg-slate-100 ${className}`}>
      {product.image ? (
        <Image src={product.image} alt="" fill sizes="200px" className="object-cover" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-slate-400">
          <Icon size={28} strokeWidth={1.5} aria-hidden />
        </span>
      )}
    </span>
  );
}

/* ---------- Encabezado de vista ---------- */

export function ViewHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <p className="font-semibold text-slate-800">{title}</p>
      {children && <div className="mt-1 text-sm text-slate-500">{children}</div>}
    </div>
  );
}
