"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";

type ToastKind = "success" | "error";
interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

const ToastCtx = createContext<{ show: (message: string, kind?: ToastKind) => void } | null>(null);

/** Avisos breves tras cada acción (guardado, error de validación). Se anuncian a lectores de pantalla. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const show = useCallback((message: string, kind: ToastKind = "success") => {
    const id = nextId.current++;
    setItems((list) => [...list.slice(-2), { id, message, kind }]);
    window.setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), kind === "error" ? 5000 : 3200);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 md:right-4 md:bottom-4 md:left-auto md:items-end"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            className={`demo-in pointer-events-auto flex max-w-sm items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ring-1 ${
              t.kind === "error" ? "bg-rose-50 text-rose-800 ring-rose-200" : "bg-slate-900 text-white ring-slate-900"
            }`}
          >
            {t.kind === "error" ? (
              <CircleAlert size={18} className="mt-px shrink-0" aria-hidden />
            ) : (
              <CircleCheck size={18} className="mt-px shrink-0 text-emerald-400" aria-hidden />
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast fuera de ToastProvider");
  return ctx;
}
