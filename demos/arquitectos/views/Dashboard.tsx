"use client";

import { AlertTriangle, CalendarClock, UserMinus } from "lucide-react";
import { dayDate, dayLabel, number } from "../../shared/format";
import { dashboard, todayKey } from "../calc";
import { Avatar, Button, Meter, Panel, UtilBadge, ViewHeader } from "../components/ui";
import { useArq } from "../store";
import type { View } from "../ArquitectosApp";

/** Resumen del despacho: indicadores, alertas, avance de proyectos y gente disponible. */
export function Dashboard({ onGoTo }: { onGoTo: (view: View) => void }) {
  const { state } = useArq();
  const today = todayKey();
  const d = dashboard(state, today);
  const name = (id: string) => state.employees.find((e) => e.id === id)?.name ?? "";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ViewHeader title="Resumen" description={`${state.company.name} · ${dayLabel(today)}`} />

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Colaboradores activos" value={number(d.activeCount)} />
        <Kpi label="Utilización promedio" value={`${d.avgUtil} %`} />
        <Kpi label="Proyectos en curso" value={number(d.runningCount)} />
        <Kpi label="Horas esta semana" value={number(d.weekHours)} />
      </dl>

      {(d.overBudget.length > 0 || d.pendingLeaves.length > 0 || d.onLeaveToday.length > 0) && (
        <ul className="mt-6 space-y-2" aria-label="Alertas">
          {d.overBudget.map((r) => (
            <Alert key={r.project.id} icon={<AlertTriangle size={18} />} tone={r.share >= 1 ? "red" : "amber"}>
              «{r.project.name}» lleva {Math.round(r.share * 100)} % de sus horas presupuestadas.{" "}
              <button type="button" className="font-semibold underline" onClick={() => onGoTo("proyectos")}>
                Ver proyecto
              </button>
            </Alert>
          ))}
          {d.pendingLeaves.length > 0 && (
            <Alert icon={<CalendarClock size={18} />} tone="blue">
              {d.pendingLeaves.length === 1 ? "Hay 1 solicitud de ausencia" : `Hay ${d.pendingLeaves.length} solicitudes de ausencia`} por responder.{" "}
              <button type="button" className="font-semibold underline" onClick={() => onGoTo("ausencias")}>
                Revisar
              </button>
            </Alert>
          )}
          {d.onLeaveToday.length > 0 && (
            <Alert icon={<UserMinus size={18} />} tone="gray">
              Hoy no están: {d.onLeaveToday.map((e) => e.name).join(", ")}.
            </Alert>
          )}
        </ul>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Panel
          title="Avance de proyectos"
          action={
            <Button size="sm" variant="ghost" onClick={() => onGoTo("proyectos")}>
              Ver todos
            </Button>
          }
        >
          <ul className="divide-y divide-white/5">
            {d.projectRows.map((r) => (
              <li key={r.project.id} className="py-3">
                <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-semibold text-slate-100">{r.project.name}</span>
                  <span className="text-xs text-slate-400">
                    {number(Math.round(r.hours))} / {number(r.project.budgetHours)} h · {r.project.phase}
                  </span>
                </div>
                <Meter value={r.share} label={`Horas consumidas de ${r.project.name}`} />
                <p className={`mt-1.5 text-xs ${r.daysLeft < 0 ? "text-rose-300" : r.daysLeft <= 30 ? "text-amber-300" : "text-slate-500"}`}>
                  {r.daysLeft < 0
                    ? `Entrega vencida hace ${-r.daysLeft} días`
                    : `Entrega ${dayDate(r.project.dueDate)} (${r.daysLeft} días) · líder ${name(r.project.leadId)}`}
                </p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Con tiempo disponible"
          action={
            <Button size="sm" variant="ghost" onClick={() => onGoTo("equipo")}>
              Equipo
            </Button>
          }
        >
          {d.available.length === 0 ? (
            <p className="text-sm text-slate-400">Todo el equipo tiene al menos 60 % asignado.</p>
          ) : (
            <ul className="space-y-3">
              {d.available.map(({ employee, value }) => (
                <li key={employee.id} className="flex items-center gap-3">
                  <Avatar employee={employee} size={36} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-100">{employee.name}</span>
                    <span className="block truncate text-xs text-slate-400">{employee.position}</span>
                  </span>
                  <UtilBadge value={value} />
                </li>
              ))}
            </ul>
          )}
          <p className="mt-5 text-xs text-slate-500">Asigna a estas personas desde el detalle de un proyecto.</p>
        </Panel>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#141a2b] p-4 ring-1 ring-white/10">
      <dt className="text-sm text-slate-400">{label}</dt>
      <dd className="mt-1 text-2xl font-bold tabular-nums text-white">{value}</dd>
    </div>
  );
}

function Alert({ icon, tone, children }: { icon: React.ReactNode; tone: "red" | "amber" | "blue" | "gray"; children: React.ReactNode }) {
  const tones = {
    red: "bg-rose-500/10 text-rose-200 ring-rose-500/25",
    amber: "bg-amber-500/10 text-amber-200 ring-amber-500/25",
    blue: "bg-blue-500/10 text-blue-200 ring-blue-500/25",
    gray: "bg-white/5 text-slate-300 ring-white/10",
  };
  return (
    <li className={`flex items-start gap-3 rounded-lg px-4 py-3 text-sm ring-1 ring-inset ${tones[tone]}`}>
      <span className="mt-px shrink-0" aria-hidden>
        {icon}
      </span>
      <span>{children}</span>
    </li>
  );
}
