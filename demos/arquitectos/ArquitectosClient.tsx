"use client";

import dynamic from "next/dynamic";

/**
 * Monta ArquitectOS solo en el navegador: sus datos dependen de la fecha y de localStorage, así
 * que renderizarlo en el servidor provocaría diferencias de hidratación.
 */
const ArquitectosApp = dynamic(() => import("./ArquitectosApp"), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh items-center justify-center gap-3 bg-[#0b1020] text-sm text-slate-400">
      <span className="size-5 animate-spin rounded-full border-2 border-blue-900 border-t-blue-500" aria-hidden />
      Cargando ArquitectOS…
    </div>
  ),
});

export default function ArquitectosClient() {
  return <ArquitectosApp />;
}
