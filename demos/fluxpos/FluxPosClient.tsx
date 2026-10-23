"use client";

import dynamic from "next/dynamic";

/**
 * Monta FluxPOS solo en el navegador: sus datos dependen de la fecha y de localStorage, así que
 * renderizarlo en el servidor provocaría diferencias de hidratación.
 */
const FluxPosApp = dynamic(() => import("./FluxPosApp"), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh items-center justify-center gap-3 bg-slate-100 text-sm text-slate-500">
      <span className="size-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" aria-hidden />
      Cargando FluxPOS…
    </div>
  ),
});

export default function FluxPosClient() {
  return <FluxPosApp />;
}
