"use client";

import dynamic from "next/dynamic";

/**
 * Monta NexusERP solo en el navegador: sus datos dependen de la fecha y de localStorage, así
 * que renderizarlo en el servidor provocaría diferencias de hidratación.
 */
const NexusApp = dynamic(() => import("./NexusApp"), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh items-center justify-center gap-3 bg-slate-50 text-sm text-slate-500">
      <span className="size-5 animate-spin rounded-full border-2 border-blue-200 border-t-[#0053db]" aria-hidden />
      Cargando NexusERP…
    </div>
  ),
});

export default function NexusClient() {
  return <NexusApp />;
}
