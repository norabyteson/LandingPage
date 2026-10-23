import { addDays, dayKey, fromDayKey, round2, weekStart } from "../shared/format";
import type { ArqState, Employee, Project } from "./types";

export const todayKey = () => dayKey(new Date());

/** Proyectos en curso (los entregados ya no reciben asignaciones). */
export const isActiveProject = (p: Project) => p.phase !== "Entregado";

/** Suma de dedicaciones de la persona en proyectos en curso (100 = jornada completa). */
export function utilization(state: ArqState, employeeId: string) {
  return state.assignments
    .filter((a) => a.employeeId === employeeId && isActiveProject(state.projects.find((p) => p.id === a.projectId)!))
    .reduce((sum, a) => sum + a.allocation, 0);
}

export function projectHours(state: ArqState, projectId: string) {
  const p = state.projects.find((x) => x.id === projectId);
  const logged = state.timeEntries.filter((t) => t.projectId === projectId).reduce((a, t) => a + t.hours, 0);
  return round2((p?.hoursBefore ?? 0) + logged);
}

/** Costo de mano de obra: horas registradas × costo por hora; el historial previo, a una tarifa promedio. */
export function projectCost(state: ArqState, projectId: string) {
  const p = state.projects.find((x) => x.id === projectId);
  const logged = state.timeEntries
    .filter((t) => t.projectId === projectId)
    .reduce((a, t) => a + t.hours * (state.employees.find((e) => e.id === t.employeeId)?.hourlyCost ?? 0), 0);
  return round2(logged + (p?.hoursBefore ?? 0) * 420);
}

export const weekDays = (monday: string) => Array.from({ length: 5 }, (_, i) => addDays(monday, i));

export function hoursBetween(state: ArqState, from: string, to: string, employeeId?: string) {
  return round2(
    state.timeEntries
      .filter((t) => t.date >= from && t.date <= to && (!employeeId || t.employeeId === employeeId))
      .reduce((a, t) => a + t.hours, 0)
  );
}

/* ---------- Vacaciones (Ley Federal del Trabajo, reforma 2023) ---------- */

export function yearsOfService(hireDate: string, today = todayKey()) {
  const h = fromDayKey(hireDate);
  const t = fromDayKey(today);
  let years = t.getFullYear() - h.getFullYear();
  if (t.getMonth() < h.getMonth() || (t.getMonth() === h.getMonth() && t.getDate() < h.getDate())) years--;
  return Math.max(0, years);
}

/** Días de vacaciones por año: 12 el primero, +2 por año hasta 20 (5.º año) y +2 cada 5 años después. */
export function vacationEntitlement(hireDate: string, today = todayKey()) {
  const years = yearsOfService(hireDate, today);
  if (years < 1) return 0;
  if (years <= 5) return 10 + years * 2;
  return 22 + Math.floor((years - 6) / 5) * 2;
}

export function vacationBalance(state: ArqState, employee: Employee, today = todayKey()) {
  const year = today.slice(0, 4);
  const mine = state.leaves.filter((l) => l.employeeId === employee.id && l.type === "Vacaciones" && l.from.startsWith(year));
  const used = mine.filter((l) => l.status === "aprobada").reduce((a, l) => a + l.days, 0);
  const pending = mine.filter((l) => l.status === "pendiente").reduce((a, l) => a + l.days, 0);
  const entitled = vacationEntitlement(employee.hireDate, today);
  return { entitled, used, pending, available: entitled - used - pending };
}

/** ¿La persona tiene una ausencia aprobada ese día? */
export const leaveOn = (state: ArqState, employeeId: string, day: string) =>
  state.leaves.find((l) => l.employeeId === employeeId && l.status === "aprobada" && l.from <= day && day <= l.to);

/* ---------- Resumen ---------- */

export function dashboard(state: ArqState, today = todayKey()) {
  const active = state.employees.filter((e) => e.status === "activo");
  const monday = weekStart(today);
  const utilizations = active.map((e) => ({ employee: e, value: utilization(state, e.id) }));
  const avgUtil = utilizations.length ? Math.round(utilizations.reduce((a, u) => a + u.value, 0) / utilizations.length) : 0;
  const runningProjects = state.projects.filter(isActiveProject);
  const projectRows = runningProjects.map((p) => {
    const hours = projectHours(state, p.id);
    return { project: p, hours, share: hours / p.budgetHours, daysLeft: Math.round((fromDayKey(p.dueDate).getTime() - fromDayKey(today).getTime()) / 86_400_000) };
  });
  const onLeaveToday = active.filter((e) => leaveOn(state, e.id, today));
  return {
    activeCount: active.length,
    avgUtil,
    runningCount: runningProjects.length,
    weekHours: hoursBetween(state, monday, today),
    pendingLeaves: state.leaves.filter((l) => l.status === "pendiente"),
    projectRows: projectRows.sort((a, b) => b.share - a.share),
    available: utilizations.filter((u) => u.value < 60).sort((a, b) => a.value - b.value),
    overBudget: projectRows.filter((r) => r.share >= 0.9),
    onLeaveToday,
  };
}

export const money0 = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
