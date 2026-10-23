"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Search, UserCheck, UserX } from "lucide-react";
import { addDays, dayDate, number, weekStart } from "../../shared/format";
import { setEmployeeStatus } from "../actions";
import { hoursBetween, todayKey, utilization, vacationBalance, yearsOfService } from "../calc";
import { EmployeeForm } from "../components/EmployeeForm";
import { Avatar, Badge, Button, EmptyState, inputBase, inputClass, Modal, UtilBadge, ViewHeader } from "../components/ui";
import { useArq } from "../store";
import type { DepartmentId, Employee } from "../types";

/** Directorio del equipo con ficha de la persona (panel fijo en pantallas anchas, modal en las demás). */
export function Team() {
  const { state } = useArq();
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState<DepartmentId | "todos">("todos");
  const [status, setStatus] = useState<"activo" | "inactivo" | "todos">("activo");
  const [selectedId, setSelectedId] = useState<string>(state.employees[0]!.id);
  const [mobileProfile, setMobileProfile] = useState(false);
  const [editing, setEditing] = useState<Employee | "new" | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.employees.filter(
      (e) =>
        (dept === "todos" || e.department === dept) &&
        (status === "todos" || e.status === status) &&
        (!q || e.name.toLowerCase().includes(q) || e.position.toLowerCase().includes(q) || e.empNo.toLowerCase().includes(q))
    );
  }, [state.employees, query, dept, status]);

  const selected = state.employees.find((e) => e.id === selectedId) ?? state.employees[0]!;
  const deptName = (id: DepartmentId) => state.departments.find((d) => d.id === id)?.name ?? id;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ViewHeader
        title="Equipo"
        description={`${state.employees.filter((e) => e.status === "activo").length} colaboradores activos en ${state.company.offices}`}
        actions={
          <Button variant="primary" onClick={() => setEditing("new")}>
            <Plus size={16} /> Agregar persona
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="relative min-w-52 flex-1">
              <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" aria-hidden />
              <input type="search" aria-label="Buscar persona" placeholder="Nombre, puesto o número…" className={`${inputClass} pl-9`} value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <select aria-label="Departamento" className={`${inputBase} w-auto`} value={dept} onChange={(e) => setDept(e.target.value as DepartmentId | "todos")}>
              <option value="todos">Todos los departamentos</option>
              {state.departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select aria-label="Estado" className={`${inputBase} w-auto`} value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
              <option value="activo">Activos</option>
              <option value="inactivo">Dados de baja</option>
              <option value="todos">Todos</option>
            </select>
          </div>

          {rows.length === 0 ? (
            <EmptyState title="Nadie coincide con la búsqueda">Cambia los filtros o agrega a alguien nuevo.</EmptyState>
          ) : (
            <div className="overflow-hidden rounded-xl bg-[#141a2b] ring-1 ring-white/10">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3">Persona</th>
                      <th className="px-4 py-3">Departamento</th>
                      <th className="px-4 py-3">Utilización</th>
                      <th className="px-4 py-3">Ingresó</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rows.map((e) => (
                      <tr
                        key={e.id}
                        onClick={() => {
                          setSelectedId(e.id);
                          // En pantallas anchas la ficha ya está a la derecha; el modal es solo para las demás.
                          if (!window.matchMedia("(min-width: 1280px)").matches) setMobileProfile(true);
                        }}
                        className={`cursor-pointer transition-colors ${e.id === selected.id ? "bg-blue-500/10" : "hover:bg-white/[0.03]"}`}
                      >
                        <td className="px-4 py-3">
                          <button type="button" className="flex items-center gap-3 text-left">
                            <Avatar employee={e} size={36} />
                            <span>
                              <span className="block font-semibold text-slate-100">{e.name}</span>
                              <span className="block text-xs text-slate-400">{e.position}</span>
                            </span>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{deptName(e.department)}</td>
                        <td className="px-4 py-3">{e.status === "activo" ? <UtilBadge value={utilization(state, e.id)} /> : <Badge tone="red">Baja</Badge>}</td>
                        <td className="px-4 py-3 text-slate-400">{dayDate(e.hireDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <aside className="hidden xl:block" aria-label="Ficha de la persona">
          <div className="sticky top-6 rounded-xl bg-[#141a2b] p-5 ring-1 ring-white/10">
            <Profile employee={selected} onEdit={() => setEditing(selected)} />
          </div>
        </aside>
      </div>

      {mobileProfile && (
        <Modal title="Ficha" onClose={() => setMobileProfile(false)}>
          <Profile employee={selected} onEdit={() => setEditing(selected)} />
        </Modal>
      )}

      {editing && (
        <EmployeeForm
          employee={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={(e) => setSelectedId(e.id)}
        />
      )}
    </div>
  );
}

function Profile({ employee: e, onEdit }: { employee: Employee; onEdit: () => void }) {
  const { state, run } = useArq();
  const today = todayKey();
  const util = utilization(state, e.id);
  const assignments = state.assignments.filter((a) => a.employeeId === e.id);
  const vac = vacationBalance(state, e, today);
  const years = yearsOfService(e.hireDate, today);
  const monday = weekStart(today);
  const dept = state.departments.find((d) => d.id === e.department)?.name;

  return (
    <div>
      <div className="flex flex-col items-center text-center">
        <Avatar employee={e} size={88} />
        <p className="mt-3 text-lg font-bold text-white">{e.name}</p>
        <p className="text-sm text-slate-400">{e.position}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
          {e.status === "activo" ? <Badge tone="green">Activo</Badge> : <Badge tone="red">Dado de baja</Badge>}
          <Badge>{dept}</Badge>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Utilización" value={`${util} %`} />
        <Stat label="Horas esta semana" value={`${number(hoursBetween(state, monday, today, e.id))} h`} />
        <Stat label="Horas 4 semanas" value={`${number(hoursBetween(state, addDays(monday, -21), today, e.id))} h`} />
        <Stat label="Vacaciones" value={vac.entitled === 0 ? "Sin derecho aún" : `${vac.available} de ${vac.entitled} días`} />
      </dl>

      <dl className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
        <Row label="Número" value={e.empNo} />
        <Row label="Correo" value={e.email} />
        <Row label="Teléfono" value={e.phone || "Sin registrar"} />
        <Row label="Ingreso" value={`${dayDate(e.hireDate)} (${years === 0 ? "menos de 1 año" : years === 1 ? "1 año" : `${years} años`})`} />
        <Row label="Costo por hora" value={`$${number(e.hourlyCost)}`} />
      </dl>

      <div className="mt-5 border-t border-white/10 pt-4">
        <p className="mb-2 text-sm font-semibold text-slate-300">Proyectos asignados</p>
        {assignments.length === 0 ? (
          <p className="text-sm text-slate-500">Sin proyectos.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {assignments.map((a) => (
              <li key={a.id} className="flex justify-between gap-2">
                <span className="truncate text-slate-200">{state.projects.find((p) => p.id === a.projectId)?.name}</span>
                <span className="tabular-nums text-slate-400">{a.allocation} %</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-5 flex gap-2">
        <Button className="flex-1" onClick={onEdit}>
          <Pencil size={15} /> Editar
        </Button>
        {e.status === "activo" ? (
          <Button
            variant="ghost"
            className="flex-1 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
            onClick={() => run((d) => setEmployeeStatus(d, e.id, "inactivo"), `${e.name} quedó dado de baja y sus asignaciones se liberaron.`)}
          >
            <UserX size={15} /> Dar de baja
          </Button>
        ) : (
          <Button variant="ghost" className="flex-1" onClick={() => run((d) => setEmployeeStatus(d, e.id, "activo"), `${e.name} volvió a estar activo.`)}>
            <UserCheck size={15} /> Reactivar
          </Button>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 px-3 py-2.5">
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-semibold text-white">{value}</dd>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-400">{label}</dt>
      <dd className="truncate text-right text-slate-200">{value}</dd>
    </div>
  );
}
