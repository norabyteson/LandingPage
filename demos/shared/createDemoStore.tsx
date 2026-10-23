"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useToast } from "./Toast";

interface DemoStoreValue<S> {
  state: S;
  /**
   * Ejecuta una acción sobre una copia del estado. Si lanza un `Error`, no se guarda nada y se
   * muestra su mensaje; si funciona, se guarda y se muestra `success`. Devuelve el resultado.
   */
  run: <T>(action: (draft: S) => T, success?: string | ((result: T) => string)) => T | undefined;
  /** Vuelve a los datos ficticios iniciales. */
  reset: () => void;
}

/**
 * Almacén de un demo: estado en memoria, persistido en `localStorage` bajo `storageKey`.
 * Si lo guardado tiene otra `version`, se descarta y se usa la semilla.
 */
export function createDemoStore<S extends { version: number }>({
  storageKey,
  version,
  buildSeed,
}: {
  storageKey: string;
  version: number;
  buildSeed: () => S;
}) {
  const Ctx = createContext<DemoStoreValue<S> | null>(null);

  function load(): S {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as S;
        if (parsed.version === version) return parsed;
      }
    } catch {
      /* sin almacenamiento o datos dañados: se usa la semilla */
    }
    return buildSeed();
  }

  function Provider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<S>(load);
    const toast = useToast();

    useEffect(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch {
        /* la demo sigue funcionando en memoria */
      }
    }, [state]);

    const run = useCallback<DemoStoreValue<S>["run"]>(
      (action, success) => {
        const draft = structuredClone(state);
        try {
          const result = action(draft);
          setState(draft);
          const message = typeof success === "function" ? success(result) : success;
          if (message) toast.show(message, "success");
          return result;
        } catch (err) {
          toast.show(err instanceof Error ? err.message : "No se pudo completar la acción.", "error");
          return undefined;
        }
      },
      [state, toast]
    );

    const reset = useCallback(() => {
      setState(buildSeed());
      toast.show("Demo restablecida con los datos iniciales.");
    }, [toast]);

    const value = useMemo(() => ({ state, run, reset }), [state, run, reset]);
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
  }

  function useDemoStore() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useDemoStore fuera de su Provider");
    return ctx;
  }

  return { Provider, useDemoStore };
}
