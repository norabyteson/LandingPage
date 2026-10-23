"use client";

import { useState } from "react";
import { ChevronRight, Plus, Trash2, UserPlus } from "lucide-react";
import { addDays, dayDate, number } from "../../shared/format";
import { assign, createProject, setLead, setPhase, unassign, type ProjectInput } from "../actions";
import { isActiveProject, money0, projectCost, projectHours, todayKey, utilization } from "../calc";
import { Avatar, Badge, Button, EmptyState, Field, inputBase, inputClass, Meter, Modal, ViewHeader } from "../components/ui";
import { useArq } from "../store";
import { PHASES, type Phase, type Project, type ProjectType } from "../types";

const PHASE_TONE: Record<Phase, "blue" | "amber" | "green" | "gray"> = {
  Anteproyecto: "blue",
  "Proyecto ejecutivo": "amber",
  Obra: "green",
  Entregado: "gray",
};
const ALLOCATIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

/** Proyectos del despacho: fase, horas contra presupuesto, equipo y finanzas. */
export function Projects() {
  const { state } = useArq();
  const [phase, setPhaseFilter] = useState<Phase | "en-curso" | "todas">("en-curso");
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const list = state.projects
    .filter((p) => (phase === "todas" ? true : phase === "en-curso" ? isActiveProject(p) : p.phase === phase))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const open = state.projects.find((p) => p.id === openId);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ViewHeader
        title="Proyectos"
        description={`${state.projects.filter(isActiveProject).length} en curso · ${state.projects.filter((p) => !isActiveProject(p)).length} entregados`}
        actions={
          <Button variant="primary" onClick={() => setCreating(true)}>
            <Plus size={16} /> Nuevo proyecto
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Fase">
        {(["en-curso", ...PHASES, "todas"] as const).map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={phase === f}
            onClick={() => setPhaseFilter(f)}
            className={`h-8 rounded-full px-3.5 text-sm font-semibold transition-colors ${
              phase === f ? "bg-blue-600 text-white" : "bg-white/5 text-slate-300 ring-1 ring-white/10 hover:bg-white/10"
            }`}
          >
            {f === "en-curso" ? "En curso" : f === "todas" ? "Todas" : f}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState title="Ningún proyecto en esta fase" />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {list.map((p) => {
            const hours = projectHours(state, p.id);
            const lead = state.employees.find((e) => e.id === p.leadId);
            const team = state.assignments.filter((a) => a.projectId === p.id).length;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(p.id)}
                  className="flex h-full w-full flex-col rounded-xl bg-[#141a2b] p-5 text-left ring-1 ring-white/10 transition-[box-shadow,translate] hover:-translate-y-0.5 hover:ring-blue-500/50"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-mono text-xs text-slate-500">{p.code}</span>
                    <Badge tone={PHASE_TONE[p.phase]}>{p.phase}</Badge>
                  </span>
                  <span className="mt-2 text-lg font-bold text-white">{p.name}</span>
                  <span className="text-sm text-slate-400">
                    {p.client} · {p.type}
                  </span>
                  <span className="mt-4 mb-1.5 flex justify-between text-xs text-slate-400">
                    <span>Horas</span>
                    <span className="tabular-nums">
                      {number(Math.round(hours))} / {number(p.budgetHours)}
                    </span>
                  </span>
                  <Meter value={hours / p.budgetHours} label={`Horas consumidas de ${p.name}`} />
                  <span className="mt-4 flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 text-slate-300">
                      {lead && <Avatar employee={lead} size={26} />}
                      {lead?.name}
                    </span>
                    <span className="text-slate-400">{team} en equipo</span>
                  </span>
                  <span className="mt-1 text-xs text-slate-500">Entrega {dayDate(p.dueDate)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {open && <ProjectDetail project={open} onClose={() => setOpenId(null)} />}
      {creating && <CreateProject onClose={() => setCreating(false)} onCreated={(p) => setOpenId(p.id)} />}
    </div>
  );
}

function ProjectDetail({ project: p, onClose }: { project: Project; onClose: () => void }) {
  const { state, run } = useArq();
  const [newMember, setNewMember] = useState("");
  const [newAlloc, setNewAlloc] = useState(20);

  const hours = projectHours(state, p.id);
  const cost = projectCost(state, p.id);
  const margin = p.fee ? (p.fee - cost) / p.fee : 0;
  const team = state.assignments.filter((a) => a.projectId === p.id);
  const candidates = state.employees.filter((e) => e.status === "activo" && !team.some((a) => a.employeeId === e.id));
  const phaseIndex = PHASES.indexOf(p.phase);
  const next = PHASES[phaseIndex + 1];
  const running = isActiveProject(p);

  return (
    <Modal
      title={p.name}
      onClose={onClose}
      wide
      footer={
        <>
          {next && (
            <Button
              className="mr-auto"
              onClick={() =>
                run(
                  (d) => setPhase(d, p.id, next),
                  next === "Entregado" ? `«${p.name}» entregado; su equipo quedó libre.` : `«${p.name}» pasó a ${next}.`
                )
              }
            >
              Pasar a {next} <ChevronRight size={16} />
            </Button>
          )}
          <Button variant="primary" onClick={onClose}>
            Listo
          </Button>
        </>
      }
    >
      <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate-400">
        <span className="font-mono">{p.code}</span>·<span>{p.client}</span>·<span>{p.type}</span>·
        <span>
          {dayDate(p.startDate)} a {dayDate(p.dueDate)}
        </span>
      </div>

      <ol className="mb-6 grid grid-cols-4 gap-1.5" aria-label="Fases del proyecto">
        {PHASES.map((ph, i) => (
          <li key={ph} aria-current={ph === p.phase ? "step" : undefined}>
            <div className={`h-1.5 rounded-full ${i <= phaseIndex ? "bg-blue-500" : "bg-white/10"}`} />
            <p className={`mt-1.5 text-xs ${ph === p.phase ? "font-semibold text-white" : "text-slate-500"}`}>{ph}</p>
          </li>
        ))}
      </ol>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Horas" value={`${number(Math.round(hours))} / ${number(p.budgetHours)}`} warn={hours / p.budgetHours >= 0.9} />
        <Stat label="Honorarios" value={money0.format(p.fee)} />
        <Stat label="Costo de equipo" value={money0.format(cost)} />
        <Stat label="Margen" value={`${Math.round(margin * 100)} %`} warn={margin < 0.25} />
      </dl>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <h3 className="font-bold text-white">Equipo</h3>
        <label className="flex items-center gap-2 text-sm text-slate-400">
          Líder
          <select
            className={`${inputBase} w-auto`}
            value={p.leadId}
            onChange={(e) => run((d) => setLead(d, p.id, e.target.value), (x) => `${x.name} ahora lidera el proyecto.`)}
          >
            {state.employees
              .filter((e) => e.status === "activo" || e.id === p.leadId)
              .map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
          </select>
        </label>
      </div>

      {team.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">{running ? "Sin personas asignadas." : "Proyecto entregado: el equipo ya se liberó."}</p>
      ) : (
        <ul className="mt-3 divide-y divide-white/5 rounded-lg ring-1 ring-white/10">
          {team.map((a) => {
            const e = state.employees.find((x) => x.id === a.employeeId)!;
            return (
              <li key={a.id} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
                <Avatar employee={e} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-100">
                    {e.name} {e.id === p.leadId && <Badge tone="blue">Líder</Badge>}
                  </span>
                  <span className="block text-xs text-slate-400">
                    {e.position} · total {utilization(state, e.id)} %
                  </span>
                </span>
                <select
                  aria-label={`Dedicación de ${e.name}`}
                  className={`${inputBase} h-9 w-auto`}
                  value={a.allocation}
                  onChange={(ev) => run((d) => assign(d, e.id, p.id, Number(ev.target.value)), `Dedicación de ${e.name}: ${ev.target.value} %.`)}
                >
                  {ALLOCATIONS.map((v) => (
                    <option key={v} value={v}>
                      {v} %
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  aria-label={`Quitar a ${e.name}`}
                  onClick={() => run((d) => unassign(d, a.id), (x) => `${x.name} salió del proyecto.`)}
                  className="rounded-md p-2 text-slate-500 hover:bg-rose-500/10 hover:text-rose-300"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {running && (
        <form
          className="mt-4 flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newMember) return;
            const ok = run((d) => assign(d, newMember, p.id, newAlloc), (r) => `${r.employee.name} se unió con ${r.allocation} %.`);
            if (ok) setNewMember("");
          }}
        >
          <div className="min-w-56 flex-1">
            <Field label="Agregar al equipo">
              <select className={inputClass} value={newMember} onChange={(e) => setNewMember(e.target.value)}>
                <option value="">Elige una persona…</option>
                {candidates.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} · {utilization(state, e.id)} % asignado
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <select aria-label="Dedicación" className={`${inputBase} w-auto`} value={newAlloc} onChange={(e) => setNewAlloc(Number(e.target.value))}>
            {ALLOCATIONS.map((v) => (
              <option key={v} value={v}>
                {v} %
              </option>
            ))}
          </select>
          <Button type="submit" disabled={!newMember}>
            <UserPlus size={16} /> Agregar
          </Button>
        </form>
      )}
    </Modal>
  );
}

function Stat({ label, value, warn = false }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="rounded-lg bg-white/5 px-3 py-2.5">
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className={`mt-0.5 font-semibold tabular-nums ${warn ? "text-amber-300" : "text-white"}`}>{value}</dd>
    </div>
  );
}

const TYPES: ProjectType[] = ["Residencial", "Comercial", "Industrial", "Interiorismo", "Hospitalidad"];

function CreateProject({ onClose, onCreated }: { onClose: () => void; onCreated: (p: Project) => void }) {
  const { state, run } = useArq();
  const today = todayKey();
  const [form, setForm] = useState({
    name: "",
    client: "",
    type: "Residencial" as ProjectType,
    budgetHours: "800",
    fee: "950000",
    startDate: today,
    dueDate: addDays(today, 150),
    leadId: state.employees.find((e) => e.status === "activo")!.id,
  });
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <Modal
      title="Nuevo proyecto"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="project-form">
            Crear proyecto
          </Button>
        </>
      }
    >
      <form
        id="project-form"
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const input: ProjectInput = { ...form, budgetHours: Number(form.budgetHours), fee: Number(form.fee) };
          const p = run((d) => createProject(d, input), (x) => `Proyecto ${x.code} creado en Anteproyecto.`);
          if (p) {
            onClose();
            onCreated(p);
          }
        }}
      >
        <div className="sm:col-span-2">
          <Field label="Nombre">
            <input className={inputClass} value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Ej. Casa Habitación San Benito" />
          </Field>
        </div>
        <Field label="Cliente">
          <input className={inputClass} value={form.client} onChange={(e) => set({ client: e.target.value })} />
        </Field>
        <Field label="Tipo">
          <select className={inputClass} value={form.type} onChange={(e) => set({ type: e.target.value as ProjectType })}>
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Horas presupuestadas">
          <input className={inputClass} type="number" min={1} value={form.budgetHours} onChange={(e) => set({ budgetHours: e.target.value })} />
        </Field>
        <Field label="Honorarios (MXN, sin IVA)">
          <input className={inputClass} type="number" min={0} value={form.fee} onChange={(e) => set({ fee: e.target.value })} />
        </Field>
        <Field label="Inicio">
          <input className={inputClass} type="date" value={form.startDate} onChange={(e) => set({ startDate: e.target.value })} />
        </Field>
        <Field label="Entrega">
          <input className={inputClass} type="date" value={form.dueDate} onChange={(e) => set({ dueDate: e.target.value })} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Líder del proyecto" hint="Entra al equipo con 20 % si tiene espacio.">
            <select className={inputClass} value={form.leadId} onChange={(e) => set({ leadId: e.target.value })}>
              {state.employees
                .filter((e) => e.status === "activo")
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} · {e.position}
                  </option>
                ))}
            </select>
          </Field>
        </div>
      </form>
    </Modal>
  );
}
