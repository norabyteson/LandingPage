"use client";

import { useState } from "react";
import Image from "next/image";
import { Boxes, Contact, LayoutDashboard, Landmark, RotateCcw, ShoppingBag, Truck, type LucideIcon } from "lucide-react";
import { ToastProvider } from "../shared/Toast";
import { receivables, todayKey } from "./calc";
import { Button, Modal } from "./components/ui";
import { ErpStoreProvider, useErp } from "./store";
import { Contacts } from "./views/Contacts";
import { Dashboard } from "./views/Dashboard";
import { Finance } from "./views/Finance";
import { Inventory } from "./views/Inventory";
import { Purchases } from "./views/Purchases";
import { Sales } from "./views/Sales";

export type View = "panel" | "ventas" | "compras" | "inventario" | "finanzas" | "contactos";

const NAV: { id: View; label: string; icon: LucideIcon }[] = [
  { id: "panel", label: "Panel", icon: LayoutDashboard },
  { id: "ventas", label: "Ventas", icon: ShoppingBag },
  { id: "compras", label: "Compras", icon: Truck },
  { id: "inventario", label: "Inventario", icon: Boxes },
  { id: "finanzas", label: "Finanzas", icon: Landmark },
  { id: "contactos", label: "Contactos", icon: Contact },
];

/** NexusERP: ERP de una distribuidora (ventas, compras, inventario y finanzas) con datos ficticios. */
export default function NexusApp() {
  return (
    <ToastProvider>
      <ErpStoreProvider>
        <Shell />
      </ErpStoreProvider>
    </ToastProvider>
  );
}

function Shell() {
  const { state, reset } = useErp();
  const [view, setView] = useState<View>("panel");
  const [confirmReset, setConfirmReset] = useState(false);
  const today = todayKey();
  const badges: Partial<Record<View, number>> = {
    ventas: state.orders.filter((o) => o.status === "borrador" || o.status === "confirmado").length,
    finanzas: receivables(state).filter((i) => i.dueDate < today).length,
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50">
      <aside className="hidden w-60 shrink-0 flex-col bg-[#1E1E2E] text-slate-300 md:flex">
        <div className="flex items-center gap-3 px-5 pt-6 pb-8">
          <span className="flex size-9 items-center justify-center rounded-lg bg-[#0053db] text-sm font-bold text-white">NX</span>
          <span>
            <span className="block text-lg font-bold tracking-tight text-white">NexusERP</span>
            <span className="block text-xs text-slate-400">Sistema ERP</span>
          </span>
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
                    view === id ? "bg-[#0053db] text-white" : "hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={18} aria-hidden />
                  {label}
                  {!!badges[id] && (
                    <span className={`ml-auto rounded-full px-1.5 text-xs font-bold ${id === "finanzas" ? "bg-rose-500 text-white" : "bg-white/15 text-white"}`}>
                      {badges[id]}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <span className="relative size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-white/10">
              <Image src={state.company.userAvatar} alt="" fill sizes="40px" className="object-cover" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-white">{state.company.user}</span>
              <span className="block text-xs text-slate-400">{state.company.userRole}</span>
            </span>
          </div>
          <p className="mt-4 text-[11px] text-slate-500">NexusERP · desarrollado por NORABYTE</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4">
          <p className="text-base font-bold text-[#0053db] md:hidden">NexusERP</p>
          <p className="hidden truncate text-sm text-slate-600 md:block">
            <span className="font-semibold text-slate-900">{state.company.name}</span> · {state.company.city}
          </p>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-slate-600 lg:inline">Datos ficticios</span>
            <Button size="sm" variant="ghost" onClick={() => setConfirmReset(true)}>
              <RotateCcw size={15} /> <span className="hidden sm:inline">Restablecer demo</span>
            </Button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto pb-16 md:pb-0">
          {view === "panel" && <Dashboard onGoTo={setView} />}
          {view === "ventas" && <Sales />}
          {view === "compras" && <Purchases />}
          {view === "inventario" && <Inventory onGoTo={() => setView("compras")} />}
          {view === "finanzas" && <Finance />}
          {view === "contactos" && <Contacts />}
        </main>
      </div>

      <nav aria-label="Secciones" className="fixed inset-x-0 bottom-0 z-20 grid h-16 grid-cols-6 border-t border-slate-200 bg-white md:hidden">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-current={view === id ? "page" : undefined}
            onClick={() => setView(id)}
            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${view === id ? "text-[#0053db]" : "text-slate-500"}`}
          >
            <Icon size={20} aria-hidden />
            {label}
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
                  setView("panel");
                }}
              >
                Restablecer
              </Button>
            </>
          }
        >
          <p className="text-sm text-slate-600">Se borran los pedidos, compras, cobros y cambios que hiciste en este navegador y vuelven los datos de ejemplo.</p>
        </Modal>
      )}
    </div>
  );
}
