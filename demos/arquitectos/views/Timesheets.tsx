"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { addDays, dayDate, dayLabel, number, round2, weekStart } from "../../shared/format";
import { saveWeek } from "../actions";
import { hoursBetween, isActiveProject, leaveOn, todayKey, utilization, weekDays } from "../calc";
import { Avatar, Badge, Button, inputBase, Panel, ViewHeader } from "../components/ui";
import { useArq } from "../store";

/** Captura semanal de horas por persona y avance de captura del equipo. */
export function Timesheets() {
  const { state } = useArq();
  const today = todayKey();
  const thisMonday = weekStart(today);
  const active = state.employees.filter((e) => e.status === "activo");
  const [employeeId, setEmployeeId] = useState(active[0]!.id);
  const [monday, setMonday] = useState(thisMonday);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ViewHeader title="Horas" description="Captura de lunes a viernes, en medias horas. Meta: 40 h por semana con jornada completa." />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <select aria-label="Persona" className={`${inputBase} w-auto min-w-56`} value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
          {active.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1 rounded-lg bg-white/5 p-1 ring-1 ring-white/10">
          <Button size="sm" variant="ghost" aria-label="Semana anterior" onClick={() => setMonday(addDays(monday, -7))}>
            <ChevronLeft size={16} />
          </Button>
          <span className="px-2 text-sm font-semibold text-slate-200 tabular-nums">
            {dayDate(monday)} a {dayDate(addDays(monday, 4))}
          </span>
          <Button size="sm" variant="ghost" aria-label="Semana siguiente" disabled={monday >= thisMonday} onClick={() => setMonday(addDays(monday, 7))}>
            <ChevronRight size={16} />
          </Button>
        </div>
        {monday !== thisMonday && (
          <Button size="sm" onClick={() => setMonday(thisMonday)}>
            Esta semana
          </Button>
        )}
      </div>

      {/* `key`: al cambiar de persona o semana, la cuadrícula se reinicia con lo guardado. */}
      <WeekGrid key={`${employeeId}-${monday}`} employeeId={employeeId} monday={monday} />

      <TeamWeek monday={monday} onPick={setEmployeeId} />
    </div>
  );
}

function WeekGrid({ employeeId, monday }: { employeeId: string; monday: string }) {
  const { state, run } = useArq();
  const today = todayKey();
  const days = weekDays(monday);
  const employee = state.employees.find((e) => e.id === employeeId)!;

  const initialRows = [
    ...new Set([
      ...state.assignments.filter((a) => a.employeeId === employeeId).map((a) => a.projectId),
      ...state.timeEntries.filter((t) => t.employeeId === employeeId && days.includes(t.date)).map((t) => t.projectId),
    ]),
  ];
  const [rows, setRows] = useState<string[]>(initialRows);
  const [grid, setGrid] = useState<Record<string, Record<string, string>>>(() =>
    Object.fromEntries(
      initialRows.map((pid) => [
        pid,
        Object.fromEntries(
          days.map((day) => {
            const h = state.timeEntries
              .filter((t) => t.employeeId === employeeId && t.projectId === pid && t.date === day)
              .reduce((a, t) => a + t.hours, 0);
            return [day, h ? String(h) : ""];
          })
        ),
      ])
    )
  );
  const [dirty, setDirty] = useState(false);
  const [extra, setExtra] = useState("");

  const value = (pid: string, day: string) => Number(grid[pid]?.[day] || 0) || 0;
  const dayTotal = (day: string) => round2(rows.reduce((a, pid) => a + value(pid, day), 0));
  const rowTotal = (pid: string) => round2(days.reduce((a, day) => a + value(pid, day), 0));
  const weekTotal = round2(days.reduce((a, day) => a + dayTotal(day), 0));
  const target = Math.round((utilization(state, employeeId) / 100) * 40);

  const setCell = (pid: string, day: string, v: string) => {
    setGrid((g) => ({ ...g, [pid]: { ...g[pid], [day]: v } }));
    setDirty(true);
  };

  const others = state.projects.filter((p) => isActiveProject(p) && !rows.includes(p.id));

  return (
    <Panel
      title={`Semana de ${employee.name}`}
      action={
        <span className="text-sm text-slate-400">
          <span className={`font-bold tabular-nums ${weekTotal >= target && target > 0 ? "text-emerald-300" : "text-white"}`}>{number(weekTotal)} h</span> de {target} h esperadas
        </span>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const numeric = Object.fromEntries(rows.map((pid) => [pid, Object.fromEntries(days.map((d) => [d, value(pid, d)]))]));
          const saved = run((d) => saveWeek(d, employeeId, monday, numeric), (h) => `Semana guardada: ${number(h)} h.`);
          if (saved !== undefined) setDirty(false);
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-xs text-slate-400">
                <th className="py-2 pr-3 text-left font-semibold">Proyecto</th>
                {days.map((day) => {
                  const leave = leaveOn(state, employeeId, day);
                  return (
                    <th key={day} className={`px-1 py-2 text-center font-semibold ${day === today ? "text-blue-300" : ""}`}>
                      {dayLabel(day)}
                      {leave && <span className="block font-normal text-amber-300">{leave.type}</span>}
                    </th>
                  );
                })}
                <th className="py-2 pl-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    Sin proyectos asignados. Agrega uno abajo para registrar horas.
                  </td>
                </tr>
              )}
              {rows.map((pid) => {
                const p = state.projects.find((x) => x.id === pid);
                return (
                  <tr key={pid}>
                    <td className="max-w-48 truncate py-2 pr-3 font-semibold text-slate-200">{p?.name}</td>
                    {days.map((day) => {
                      const locked = day > today || !!leaveOn(state, employeeId, day);
                      return (
                        <td key={day} className="px-1 py-2">
                          <input
                            aria-label={`${p?.name}, ${dayLabel(day)}`}
                            type="number"
                            min={0}
                            max={12}
                            step={0.5}
                            inputMode="decimal"
                            disabled={locked}
                            value={grid[pid]?.[day] ?? ""}
                            onChange={(e) => setCell(pid, day, e.target.value)}
                            className={`${inputBase} h-9 w-full min-w-14 text-center tabular-nums disabled:cursor-not-allowed disabled:opacity-30`}
                          />
                        </td>
                      );
                    })}
                    <td className="py-2 pl-3 text-right font-semibold tabular-nums text-slate-200">{number(rowTotal(pid))}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10 text-xs">
                <td className="py-2 pr-3 font-semibold text-slate-400">Total del día</td>
                {days.map((day) => {
                  const t = dayTotal(day);
                  return (
                    <td key={day} className={`py-2 text-center font-semibold tabular-nums ${t > 12 ? "text-rose-300" : t > 0 ? "text-slate-200" : "text-slate-600"}`}>
                      {number(t)}
                    </td>
                  );
                })}
                <td className="py-2 pl-3 text-right font-bold tabular-nums text-white">{number(weekTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <select aria-label="Agregar otro proyecto" className={`${inputBase} w-auto`} value={extra} onChange={(e) => setExtra(e.target.value)}>
            <option value="">Otro proyecto…</option>
            {others.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            disabled={!extra}
            onClick={() => {
              setRows((r) => [...r, extra]);
              setGrid((g) => ({ ...g, [extra]: {} }));
              setExtra("");
            }}
          >
            Agregar fila
          </Button>
          <span className="ml-auto flex items-center gap-3">
            {dirty && <span className="text-xs text-amber-300">Cambios sin guardar</span>}
            <Button variant="primary" type="submit" disabled={!dirty}>
              <Save size={16} /> Guardar semana
            </Button>
          </span>
        </div>
      </form>
    </Panel>
  );
}

/** Cuánto capturó cada persona en la semana contra lo esperado por su dedicación. */
function TeamWeek({ monday, onPick }: { monday: string; onPick: (id: string) => void }) {
  const { state } = useArq();
  const today = todayKey();
  const end = addDays(monday, 4) < today ? addDays(monday, 4) : today;
  const daysElapsed = weekDays(monday).filter((d) => d <= today).length;

  const rows = state.employees
    .filter((e) => e.status === "activo")
    .map((e) => {
      const expected = Math.round((utilization(state, e.id) / 100) * 8 * daysElapsed);
      const logged = hoursBetween(state, monday, end, e.id);
      return { e, logged, expected };
    })
    .sort((a, b) => a.logged / Math.max(a.expected, 1) - b.logged / Math.max(b.expected, 1));

  return (
    <Panel title="Captura del equipo esta semana" className="mt-6">
      <ul className="grid gap-x-6 gap-y-2 md:grid-cols-2">
        {rows.map(({ e, logged, expected }) => {
          const behind = expected > 0 && logged < expected * 0.8;
          return (
            <li key={e.id}>
              <button type="button" onClick={() => onPick(e.id)} className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-white/5">
                <Avatar employee={e} size={30} />
                <span className="min-w-0 flex-1 truncate text-sm text-slate-200">{e.name}</span>
                <span className="text-sm tabular-nums text-slate-400">
                  {number(logged)} / {expected} h
                </span>
                {behind ? <Badge tone="amber">Atrasado</Badge> : expected === 0 ? <Badge>Sin asignar</Badge> : <Badge tone="green">Al día</Badge>}
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
