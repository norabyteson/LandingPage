"use client";

import { useState } from "react";
import { CalendarDays, Clock, FolderKanban, LayoutDashboard, RotateCcw, Users, type LucideIcon } from "lucide-react";
import { ToastProvider } from "../shared/Toast";
import { Avatar, Button, Modal } from "./components/ui";
import { ArqStoreProvider, useArq } from "./store";
import { Dashboard } from "./views/Dashboard";
import { Leaves } from "./views/Leaves";
import { Projects } from "./views/Projects";
import { Team } from "./views/Team";
import { Timesheets } from "./views/Timesheets";

export type View = "resumen" | "equipo" | "proyectos" | "horas" | "ausencias";

const NAV: { id: View; label: string; icon: LucideIcon }[] = [
  { id: "resumen", label: "Resumen", icon: LayoutDashboard },
  { id: "equipo", label: "Equipo", icon: Users },
  { id: "proyectos", label: "Proyectos", icon: FolderKanban },
  { id: "horas", label: "Horas", icon: Clock },
  { id: "ausencias", label: "Ausencias", icon: CalendarDays },
];

/** ArquitectOS: gestión de personal y proyectos de un despacho, con datos ficticios en el navegador. */
export default function ArquitectosApp() {
  return (
    <ToastProvider>
      <ArqStoreProvider>
        <Shell />
      </ArqStoreProvider>
    </ToastProvider>
  );
}

function Shell() {
  const { state, reset } = useArq();
  const [view, setView] = useState<View>("resumen");
  const [confirmReset, setConfirmReset] = useState(false);
  const manager = state.employees.find((e) => e.name === state.company.manager) ?? state.employees[0]!;
  const pending = state.leaves.filter((l) => l.status === "pendiente").length;

  return (
    <div className="flex h-dvh overflow-hidden bg-[#0b1020] text-slate-100 [color-scheme:dark]">
      {/* ---- Barra lateral (escritorio) ---- */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/10 bg-[#0e1321] md:flex">
        <div className="px-5 pt-6 pb-8">
          <p className="text-xl font-bold tracking-tight text-white">ArquitectOS</p>
          <p className="text-xs text-slate-400">{state.company.name}</p>
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
                    view === id ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={18} aria-hidden />
                  {label}
                  {id === "ausencias" && pending > 0 && (
                    <span className="ml-auto rounded-full bg-amber-400 px-1.5 text-xs font-bold text-slate-900" aria-label={`${pending} pendientes`}>
                      {pending}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <Avatar employee={manager} size={40} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-white">{manager.name}</span>
              <span className="block truncate text-xs text-slate-400">{manager.position}</span>
            </span>
          </div>
          <p className="mt-4 text-[11px] text-slate-500">ArquitectOS · desarrollado por NORABYTE</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#0e1321] px-4">
          <p className="text-base font-bold text-white md:hidden">ArquitectOS</p>
          <p className="hidden truncate text-sm text-slate-400 md:block">
            <span className="font-semibold text-slate-200">{state.company.name}</span> · {state.company.offices}
          </p>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-slate-400 ring-1 ring-white/10 lg:inline">Datos ficticios</span>
            <Button size="sm" variant="ghost" onClick={() => setConfirmReset(true)}>
              <RotateCcw size={15} /> <span className="hidden sm:inline">Restablecer demo</span>
            </Button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto pb-16 md:pb-0">
          {view === "resumen" && <Dashboard onGoTo={setView} />}
          {view === "equipo" && <Team />}
          {view === "proyectos" && <Projects />}
          {view === "horas" && <Timesheets />}
          {view === "ausencias" && <Leaves />}
        </main>
      </div>

      {/* ---- Navegación inferior (móvil) ---- */}
      <nav aria-label="Secciones" className="fixed inset-x-0 bottom-0 z-20 grid h-16 grid-cols-5 border-t border-white/10 bg-[#0e1321] md:hidden">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-current={view === id ? "page" : undefined}
            onClick={() => setView(id)}
            className={`relative flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${view === id ? "text-blue-400" : "text-slate-400"}`}
          >
            <Icon size={20} aria-hidden />
            {label}
            {id === "ausencias" && pending > 0 && <span className="absolute top-2 right-[calc(50%-18px)] size-2 rounded-full bg-amber-400" aria-hidden />}
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
                  setView("resumen");
                }}
              >
                Restablecer
              </Button>
            </>
          }
        >
          <p className="text-sm text-slate-300">Se borran las personas, proyectos, horas y ausencias que cambiaste en este navegador y vuelven los datos de ejemplo.</p>
        </Modal>
      )}
    </div>
  );
}
