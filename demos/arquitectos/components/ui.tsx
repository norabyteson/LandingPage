"use client";

import { useId, type ButtonHTMLAttributes, type ReactNode } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { initials } from "../../shared/format";
import { useDialog } from "../../shared/useDialog";
import type { Employee } from "../types";

/* Paleta de ArquitectOS: azul eléctrico sobre azul noche (como el mockup original). */

type Variant = "primary" | "secondary" | "ghost" | "danger";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-500 shadow-sm shadow-blue-950",
  secondary: "bg-white/5 text-slate-100 ring-1 ring-inset ring-white/10 hover:bg-white/10",
  ghost: "text-slate-300 hover:bg-white/5 hover:text-white",
  danger: "bg-rose-600 text-white hover:bg-rose-500",
};

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" }) {
  const sizes = { sm: "h-8 px-3 text-xs gap-1.5", md: "h-10 px-4 text-sm gap-2" };
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center rounded-lg font-semibold whitespace-nowrap transition-[background-color,scale] duration-150 select-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 [&_svg]:shrink-0 ${sizes[size]} ${VARIANTS[variant]} ${className}`}
    />
  );
}

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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`demo-in flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-[#141a2b] text-slate-100 shadow-2xl ring-1 ring-white/10 outline-none sm:rounded-2xl ${wide ? "sm:max-w-3xl" : "sm:max-w-md"}`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <h2 id={titleId} className="text-lg font-bold">
            {title}
          </h2>
          <button
            type="button"
            data-close
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 bg-black/20 px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

/** Campo sin ancho (filtros); `inputClass` ocupa todo el ancho. */
export const inputBase =
  "h-10 rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 focus:outline-none";
export const inputClass = `${inputBase} w-full`;

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-slate-300">{label}</span>
      {children}
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

const TONES = {
  green: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/25",
  amber: "bg-amber-500/10 text-amber-300 ring-amber-500/25",
  red: "bg-rose-500/10 text-rose-300 ring-rose-500/25",
  blue: "bg-blue-500/10 text-blue-300 ring-blue-500/25",
  gray: "bg-white/5 text-slate-300 ring-white/10",
};
export function Badge({ tone = "gray", children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset ${TONES[tone]}`}>
      {children}
    </span>
  );
}

export function Avatar({ employee, size = 40 }: { employee: Employee; size?: number }) {
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-500/15 font-bold text-blue-200 ring-1 ring-white/10"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {employee.photo ? (
        <Image src={employee.photo} alt="" fill sizes={`${size}px`} className="object-cover" />
      ) : (
        initials(employee.name)
      )}
    </span>
  );
}

export function Panel({ title, action, children, className = "" }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl bg-[#141a2b] p-5 ring-1 ring-white/10 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-bold text-white">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function ViewHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 px-6 py-10 text-center">
      <p className="font-semibold text-slate-200">{title}</p>
      {children && <div className="mt-1 text-sm text-slate-400">{children}</div>}
    </div>
  );
}

/** Barra de avance con su valor para lectores de pantalla. */
export function Meter({ value, label }: { value: number; label: string }) {
  const pct = Math.min(100, Math.round(value * 100));
  const color = value >= 1 ? "bg-rose-400" : value >= 0.9 ? "bg-amber-400" : "bg-blue-500";
  return (
    <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} className="h-1.5 w-full rounded-full bg-white/10">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Etiqueta de la utilización de una persona: sin asignar, disponible, ocupada o completa (100 %). */
export function UtilBadge({ value }: { value: number }) {
  if (value === 0) return <Badge tone="gray">Sin asignar</Badge>;
  if (value < 60) return <Badge tone="amber">{value} % · disponible</Badge>;
  if (value < 100) return <Badge tone="blue">{value} %</Badge>;
  return <Badge tone="green">100 % · completa</Badge>;
}
