"use client";

import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { addDays, businessDays, dayDate } from "../../shared/format";
import { decideLeave, requestLeave } from "../actions";
import { todayKey, vacationBalance, yearsOfService } from "../calc";
import { Avatar, Badge, Button, EmptyState, Field, inputClass, Modal, Panel, ViewHeader } from "../components/ui";
import { useArq } from "../store";
import type { Employee, LeaveRequest, LeaveType } from "../types";

const STATUS_TONE = { pendiente: "amber", aprobada: "green", rechazada: "red" } as const;

/** Ausencias: solicitudes con aprobación y saldos de vacaciones según la ley. */
export function Leaves() {
  const { state, run } = useArq();
  const [creating, setCreating] = useState(false);
  const person = (id: string) => state.employees.find((e) => e.id === id)!;

  const pending = state.leaves.filter((l) => l.status === "pendiente").sort((a, b) => a.from.localeCompare(b.from));
  const history = state.leaves.filter((l) => l.status !== "pendiente").sort((a, b) => b.from.localeCompare(a.from)).slice(0, 15);
  const today = todayKey();

  const decide = (l: LeaveRequest, status: "aprobada" | "rechazada") =>
    run(
      (d) => decideLeave(d, l.id, status),
      (r) => `Solicitud de ${r.leave.type.toLowerCase()} de ${r.employee.name} ${status}.`
    );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ViewHeader
        title="Ausencias"
        description="Vacaciones según la Ley Federal del Trabajo: 12 días el primer año, +2 por año hasta 20 y +2 cada 5 años después."
        actions={
          <Button variant="primary" onClick={() => setCreating(true)}>
            <Plus size={16} /> Nueva solicitud
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Panel title={`Por responder (${pending.length})`}>
            {pending.length === 0 ? (
              <EmptyState title="Nada pendiente">Las solicitudes nuevas aparecerán aquí.</EmptyState>
            ) : (
              <ul className="space-y-3">
                {pending.map((l) => (
                  <li key={l.id} className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
                    <LeaveLine leave={l} employee={person(l.employeeId)} />
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="primary" onClick={() => decide(l, "aprobada")}>
                        <Check size={14} /> Aprobar
                      </Button>
                      <Button size="sm" onClick={() => decide(l, "rechazada")}>
                        <X size={14} /> Rechazar
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Historial">
            <ul className="divide-y divide-white/5">
              {history.map((l) => (
                <li key={l.id} className="py-3">
                  <LeaveLine leave={l} employee={person(l.employeeId)} />
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel title={`Saldos de vacaciones ${today.slice(0, 4)}`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[460px] text-sm">
              <thead className="text-xs text-slate-400">
                <tr className="border-b border-white/10">
                  <th className="py-2 text-left font-semibold">Persona</th>
                  <th className="py-2 text-right font-semibold">Antigüedad</th>
                  <th className="py-2 text-right font-semibold">Por ley</th>
                  <th className="py-2 text-right font-semibold">Usados</th>
                  <th className="py-2 text-right font-semibold">Disponibles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {state.employees
                  .filter((e) => e.status === "activo")
                  .map((e) => {
                    const b = vacationBalance(state, e, today);
                    const years = yearsOfService(e.hireDate, today);
                    return (
                      <tr key={e.id}>
                        <td className="py-2 pr-2 text-slate-200">{e.name}</td>
                        <td className="py-2 text-right text-slate-400">{years === 0 ? "< 1 año" : `${years} ${years === 1 ? "año" : "años"}`}</td>
                        <td className="py-2 text-right tabular-nums text-slate-300">{b.entitled}</td>
                        <td className="py-2 text-right tabular-nums text-slate-300">
                          {b.used}
                          {b.pending > 0 && <span className="text-amber-300"> +{b.pending}</span>}
                        </td>
                        <td className={`py-2 text-right font-semibold tabular-nums ${b.available <= 2 ? "text-amber-300" : "text-white"}`}>{b.available}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-500">Los días pendientes de aprobar (+) ya se descuentan de los disponibles.</p>
        </Panel>
      </div>

      {creating && <RequestModal onClose={() => setCreating(false)} />}
    </div>
  );
}

function LeaveLine({ leave: l, employee }: { leave: LeaveRequest; employee: Employee }) {
  return (
    <div className="flex items-start gap-3">
      <Avatar employee={employee} size={34} />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-100">{employee.name}</span>
          <Badge tone={STATUS_TONE[l.status]}>{l.status[0]!.toUpperCase() + l.status.slice(1)}</Badge>
        </p>
        <p className="text-sm text-slate-300">
          {l.type} · {l.from === l.to ? dayDate(l.from) : `${dayDate(l.from)} a ${dayDate(l.to)}`} · {l.days} {l.days === 1 ? "día hábil" : "días hábiles"}
        </p>
        {l.note && <p className="text-sm text-slate-500">{l.note}</p>}
      </div>
    </div>
  );
}

function RequestModal({ onClose }: { onClose: () => void }) {
  const { state, run } = useArq();
  const today = todayKey();
  const active = state.employees.filter((e) => e.status === "activo");
  const [form, setForm] = useState({ employeeId: active[0]!.id, type: "Vacaciones" as LeaveType, from: addDays(today, 7), to: addDays(today, 9), note: "" });
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));
  const employee = state.employees.find((e) => e.id === form.employeeId)!;
  const balance = vacationBalance(state, employee, today);
  const days = form.from && form.to && form.to >= form.from ? businessDays(form.from, form.to) : 0;

  return (
    <Modal
      title="Nueva solicitud de ausencia"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="leave-form">
            Enviar solicitud
          </Button>
        </>
      }
    >
      <form
        id="leave-form"
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const ok = run((d) => requestLeave(d, form), (l) => `Solicitud registrada: ${l.days} ${l.days === 1 ? "día" : "días"} de ${l.type.toLowerCase()}.`);
          if (ok) onClose();
        }}
      >
        <Field label="Persona">
          <select className={inputClass} value={form.employeeId} onChange={(e) => set({ employeeId: e.target.value })}>
            {active.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tipo">
          <select className={inputClass} value={form.type} onChange={(e) => set({ type: e.target.value as LeaveType })}>
            <option>Vacaciones</option>
            <option>Permiso</option>
            <option>Incapacidad</option>
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Desde">
            <input className={inputClass} type="date" value={form.from} onChange={(e) => set({ from: e.target.value })} />
          </Field>
          <Field label="Hasta">
            <input className={inputClass} type="date" value={form.to} min={form.from} onChange={(e) => set({ to: e.target.value })} />
          </Field>
        </div>
        <p aria-live="polite" className="rounded-lg bg-white/5 px-3 py-2.5 text-sm text-slate-300">
          {days} {days === 1 ? "día hábil" : "días hábiles"}
          {form.type === "Vacaciones" &&
            (balance.entitled === 0
              ? ". Aún no cumple un año: la ley le da vacaciones a partir del primero."
              : `. Le quedan ${balance.available} de ${balance.entitled} días este año.`)}
        </p>
        <Field label="Motivo (opcional)">
          <input className={inputClass} value={form.note} onChange={(e) => set({ note: e.target.value })} />
        </Field>
      </form>
    </Modal>
  );
}
