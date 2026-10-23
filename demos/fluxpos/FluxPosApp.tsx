"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BarChart3, Package, Receipt, RotateCcw, ShoppingCart, Users, Wallet, type LucideIcon } from "lucide-react";
import { ToastProvider } from "../shared/Toast";
import { openShift } from "./calc";
import { Button, Modal } from "./components/ui";
import { PosStoreProvider, usePos } from "./store";
import { CashClose } from "./views/CashClose";
import { Customers } from "./views/Customers";
import { Inventory } from "./views/Inventory";
import { Register } from "./views/Register";
import { Reports } from "./views/Reports";
import { Sales } from "./views/Sales";

type View = "caja" | "ventas" | "inventario" | "clientes" | "reportes" | "corte";

const NAV: { id: View; label: string; short: string; icon: LucideIcon }[] = [
  { id: "caja", label: "Caja", short: "Caja", icon: ShoppingCart },
  { id: "ventas", label: "Ventas", short: "Ventas", icon: Receipt },
  { id: "inventario", label: "Inventario", short: "Inventario", icon: Package },
  { id: "clientes", label: "Clientes", short: "Clientes", icon: Users },
  { id: "reportes", label: "Reportes", short: "Reportes", icon: BarChart3 },
  { id: "corte", label: "Corte de caja", short: "Corte", icon: Wallet },
];

/** FluxPOS: punto de venta funcional con datos ficticios guardados en el navegador. */
export default function FluxPosApp() {
  return (
    <ToastProvider>
      <PosStoreProvider>
        <Shell />
      </PosStoreProvider>
    </ToastProvider>
  );
}

function Shell() {
  const { state, reset } = usePos();
  const [view, setView] = useState<View>("caja");
  const [confirmReset, setConfirmReset] = useState(false);
  const shift = openShift(state);
  const clock = useClock();

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-100">
      {/* ---- Barra lateral (escritorio) ---- */}
      <aside className="hidden w-60 shrink-0 flex-col bg-indigo-950 text-indigo-100 md:flex">
        <div className="px-5 pt-6 pb-8">
          <p className="text-xl font-bold tracking-tight text-white">FluxPOS</p>
          <p className="text-xs text-indigo-300">Punto de venta</p>
        </div>
        <nav aria-label="Secciones" className="flex-1 px-3">
          <ul className="space-y-1">
            {NAV.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  type="button"
                  aria-current={view === id ? "page" : undefined}
                  onClick={() => setView(id)}
                  className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors ${
                    view === id ? "bg-indigo-600 text-white" : "text-indigo-200 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={18} aria-hidden />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <span className="relative size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-indigo-400/40">
              <Image src={state.store.cashierAvatar} alt="" fill sizes="40px" className="object-cover" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-white">{state.store.cashier}</span>
              <span className="block text-xs text-indigo-300">Cajera · {state.store.terminal}</span>
            </span>
          </div>
          <p className="mt-4 text-[11px] text-indigo-300/80">FluxPOS · desarrollado por NORABYTE</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* ---- Barra superior ---- */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4">
          <div className="flex min-w-0 items-center gap-3">
            <p className="text-base font-bold text-indigo-700 md:hidden">FluxPOS</p>
            <p className="hidden truncate text-sm text-slate-600 sm:block">
              <span className="font-semibold text-slate-900">{state.store.name}</span> · {state.store.branch} · {clock}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {shift ? (
              <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-emerald-700 ring-1 ring-emerald-200 sm:inline">Turno abierto</span>
            ) : (
              <button type="button" onClick={() => setView("corte")} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                Sin turno
              </button>
            )}
            <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-slate-600 xl:inline">Datos ficticios</span>
            <Button size="sm" variant="ghost" onClick={() => setConfirmReset(true)}>
              <RotateCcw size={15} /> <span className="hidden sm:inline">Restablecer demo</span>
            </Button>
          </div>
        </header>

        <main className={`min-h-0 flex-1 ${view === "caja" ? "" : "overflow-y-auto pb-16 md:pb-0"}`}>
          {view === "caja" && <Register onGoTo={setView} />}
          {view === "ventas" && <Sales />}
          {view === "inventario" && <Inventory />}
          {view === "clientes" && <Customers />}
          {view === "reportes" && <Reports />}
          {view === "corte" && <CashClose />}
        </main>
      </div>

      {/* ---- Navegación inferior (móvil) ---- */}
      <nav aria-label="Secciones" className="fixed inset-x-0 bottom-0 z-20 grid h-16 grid-cols-6 border-t border-slate-200 bg-white md:hidden">
        {NAV.map(({ id, short, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-current={view === id ? "page" : undefined}
            onClick={() => setView(id)}
            className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${view === id ? "text-indigo-700" : "text-slate-500"}`}
          >
            <Icon size={20} aria-hidden />
            {short}
          </button>
        ))}
      </nav>

      {confirmReset && (
        <Modal
          title="¿Restablecer la demo?"
          onClose={() => setConfirmReset(false)}
          footer={
            <>
              <Button onClick={() => setConfirmReset(false)}>Cancelar</Button>
              <Button
                variant="danger"
                onClick={() => {
                  reset();
                  setConfirmReset(false);
                  setView("caja");
                }}
              >
                Restablecer
              </Button>
            </>
          }
        >
          <p className="text-sm text-slate-600">
            Se borran las ventas, clientes y productos que agregaste en este navegador y vuelven los datos de ejemplo.
          </p>
        </Modal>
      )}
    </div>
  );
}

/** Hora actual, actualizada cada 30 s. */
function useClock() {
  const format = () => new Date().toLocaleString("es-MX", { weekday: "long", hour: "2-digit", minute: "2-digit" });
  const [value, setValue] = useState(format);
  useEffect(() => {
    const id = window.setInterval(() => setValue(format()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return value;
}
