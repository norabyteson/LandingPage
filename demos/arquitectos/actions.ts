import { businessDays, dayLabel, isWeekend, round2, weekStart } from "../shared/format";
import { isActiveProject, leaveOn, todayKey, utilization, vacationBalance, weekDays } from "./calc";
import type { ArqState, DepartmentId, Employee, LeaveRequest, LeaveType, Phase, Project, ProjectType } from "./types";

/**
 * Operaciones de ArquitectOS. Reciben una copia del estado (`run(draft => …)`), la modifican y
 * lanzan `Error` con un mensaje para la persona usuaria si algo no se puede hacer.
 */

const newId = (d: ArqState, prefix: string) => `${prefix}-${d.nextId++}`;

function employee(d: ArqState, id: string) {
  const e = d.employees.find((x) => x.id === id);
  if (!e) throw new Error("La persona ya no existe.");
  return e;
}
function project(d: ArqState, id: string) {
  const p = d.projects.find((x) => x.id === id);
  if (!p) throw new Error("El proyecto ya no existe.");
  return p;
}

/* ---------- Equipo ---------- */

export interface EmployeeInput {
  name: string;
  email: string;
  phone: string;
  department: DepartmentId;
  position: string;
  hourlyCost: number;
  hireDate: string;
}

function validateEmployee(d: ArqState, input: EmployeeInput, selfId?: string) {
  if (input.name.trim().split(/\s+/).length < 2) throw new Error("Escribe nombre y apellido.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) throw new Error("El correo no es válido.");
  if (d.employees.some((e) => e.id !== selfId && e.email.toLowerCase() === input.email.trim().toLowerCase()))
    throw new Error("Ya hay otra persona con ese correo.");
  if (!input.position.trim()) throw new Error("Escribe el puesto.");
  if (!(input.hourlyCost > 0)) throw new Error("El costo por hora debe ser mayor a cero.");
  if (!input.hireDate || input.hireDate > todayKey()) throw new Error("La fecha de ingreso no puede ser futura.");
}

export function createEmployee(d: ArqState, input: EmployeeInput): Employee {
  validateEmployee(d, input);
  const lastNo = Math.max(...d.employees.map((e) => Number(e.empNo.slice(4)) || 0));
  const e: Employee = {
    id: newId(d, "emp"),
    empNo: `EMP-${lastNo + 1}`,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    department: input.department,
    position: input.position.trim(),
    status: "activo",
    hireDate: input.hireDate,
    hourlyCost: round2(input.hourlyCost),
  };
  d.employees.push(e);
  return e;
}

export function updateEmployee(d: ArqState, id: string, input: EmployeeInput) {
  const e = employee(d, id);
  validateEmployee(d, input, id);
  Object.assign(e, {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    department: input.department,
    position: input.position.trim(),
    hourlyCost: round2(input.hourlyCost),
    hireDate: input.hireDate,
  });
  return e;
}

/** Baja o reactivación. Al dar de baja se liberan sus asignaciones. */
export function setEmployeeStatus(d: ArqState, id: string, status: Employee["status"]) {
  const e = employee(d, id);
  if (status === "inactivo") {
    const led = d.projects.find((p) => p.leadId === id && isActiveProject(p));
    if (led) throw new Error(`${e.name} lidera «${led.name}». Asigna otro líder antes de darle de baja.`);
    d.assignments = d.assignments.filter((a) => a.employeeId !== id);
  }
  e.status = status;
  return e;
}

/* ---------- Proyectos y asignaciones ---------- */

export function assign(d: ArqState, employeeId: string, projectId: string, allocation: number) {
  const e = employee(d, employeeId);
  const p = project(d, projectId);
  if (e.status !== "activo") throw new Error(`${e.name} está dado de baja.`);
  if (!isActiveProject(p)) throw new Error("El proyecto ya se entregó; no admite asignaciones.");
  if (!Number.isInteger(allocation) || allocation < 10 || allocation > 100 || allocation % 10 !== 0)
    throw new Error("La dedicación va de 10 % a 100 %, en pasos de 10.");
  const existing = d.assignments.find((a) => a.employeeId === employeeId && a.projectId === projectId);
  const others = utilization(d, employeeId) - (existing?.allocation ?? 0);
  if (others + allocation > 100)
    throw new Error(
      others >= 100
        ? `${e.name} ya tiene su jornada completa. Libera parte de su tiempo en otro proyecto primero.`
        : `${e.name} ya tiene ${others} % asignado; como máximo puede tomar ${100 - others} % más.`
    );
  if (existing) existing.allocation = allocation;
  else d.assignments.push({ id: newId(d, "asig"), employeeId, projectId, allocation });
  return { employee: e, project: p, allocation };
}

export function unassign(d: ArqState, assignmentId: string) {
  const a = d.assignments.find((x) => x.id === assignmentId);
  if (!a) throw new Error("La asignación ya no existe.");
  const p = project(d, a.projectId);
  if (p.leadId === a.employeeId) throw new Error("No puedes quitar a quien lidera el proyecto; cambia el líder primero.");
  d.assignments = d.assignments.filter((x) => x.id !== assignmentId);
  return employee(d, a.employeeId);
}

export interface ProjectInput {
  name: string;
  client: string;
  type: ProjectType;
  budgetHours: number;
  fee: number;
  startDate: string;
  dueDate: string;
  leadId: string;
}

export function createProject(d: ArqState, input: ProjectInput): Project {
  if (!input.name.trim()) throw new Error("Escribe el nombre del proyecto.");
  if (!input.client.trim()) throw new Error("Escribe el cliente.");
  if (!(input.budgetHours > 0)) throw new Error("Las horas presupuestadas deben ser mayores a cero.");
  if (!(input.fee >= 0)) throw new Error("Los honorarios no pueden ser negativos.");
  if (!input.startDate || !input.dueDate || input.dueDate <= input.startDate) throw new Error("La entrega debe ser posterior al inicio.");
  const lead = employee(d, input.leadId);
  if (lead.status !== "activo") throw new Error("El líder debe estar activo.");
  const year = input.startDate.slice(2, 4);
  const count = d.projects.filter((p) => p.code.startsWith(`TP-${year}-`)).length;
  const p: Project = {
    id: newId(d, "proy"),
    code: `TP-${year}-${String(count + 20).padStart(3, "0")}`,
    name: input.name.trim(),
    client: input.client.trim(),
    type: input.type,
    phase: "Anteproyecto",
    budgetHours: Math.round(input.budgetHours),
    hoursBefore: 0,
    fee: round2(input.fee),
    startDate: input.startDate,
    dueDate: input.dueDate,
    leadId: lead.id,
  };
  d.projects.push(p);
  // El líder entra al proyecto con 20 % si tiene espacio.
  if (utilization(d, lead.id) <= 80) d.assignments.push({ id: newId(d, "asig"), employeeId: lead.id, projectId: p.id, allocation: 20 });
  return p;
}

export function setLead(d: ArqState, projectId: string, leadId: string) {
  const p = project(d, projectId);
  const e = employee(d, leadId);
  if (e.status !== "activo") throw new Error("El líder debe estar activo.");
  p.leadId = leadId;
  return e;
}

/** Cambia de fase. Al entregar, el equipo queda libre para otros proyectos. */
export function setPhase(d: ArqState, projectId: string, phase: Phase) {
  const p = project(d, projectId);
  p.phase = phase;
  if (phase === "Entregado") d.assignments = d.assignments.filter((a) => a.projectId !== projectId);
  return p;
}

/* ---------- Horas ---------- */

/** Reemplaza las horas de la persona en esa semana (lunes a viernes) por la cuadrícula dada. */
export function saveWeek(d: ArqState, employeeId: string, monday: string, grid: Record<string, Record<string, number>>) {
  const e = employee(d, employeeId);
  if (e.status !== "activo") throw new Error(`${e.name} está dado de baja.`);
  const days = weekDays(weekStart(monday));
  const today = todayKey();

  for (const day of days) {
    let total = 0;
    for (const [projectId, row] of Object.entries(grid)) {
      const h = row[day] ?? 0;
      if (h === 0) continue;
      if (Number.isNaN(h) || h < 0 || h > 12 || Math.round(h * 2) !== h * 2)
        throw new Error(`Revisa ${dayLabel(day)}: usa horas de 0 a 12 en medias horas (p. ej. 3.5).`);
      if (day > today) throw new Error(`No se pueden registrar horas en un día futuro (${dayLabel(day)}).`);
      if (leaveOn(d, employeeId, day)) throw new Error(`${dayLabel(day)} tiene una ausencia aprobada.`);
      project(d, projectId);
      total += h;
    }
    if (total > 12) throw new Error(`${dayLabel(day)} suma ${total} h; el máximo por día es 12.`);
  }

  d.timeEntries = d.timeEntries.filter((t) => !(t.employeeId === employeeId && days.includes(t.date)));
  let saved = 0;
  for (const [projectId, row] of Object.entries(grid))
    for (const day of days) {
      const h = row[day] ?? 0;
      if (h > 0) {
        d.timeEntries.push({ id: newId(d, "hrs"), employeeId, projectId, date: day, hours: h });
        saved += h;
      }
    }
  return saved;
}

/* ---------- Ausencias ---------- */

export function requestLeave(
  d: ArqState,
  input: { employeeId: string; type: LeaveType; from: string; to: string; note: string }
): LeaveRequest {
  const e = employee(d, input.employeeId);
  if (e.status !== "activo") throw new Error(`${e.name} está dado de baja.`);
  if (!input.from || !input.to || input.to < input.from) throw new Error("La fecha final debe ser igual o posterior a la inicial.");
  const days = businessDays(input.from, input.to);
  if (days === 0) throw new Error("El periodo no tiene días hábiles.");
  const overlap = d.leaves.find(
    (l) => l.employeeId === e.id && l.status !== "rechazada" && l.from <= input.to && input.from <= l.to
  );
  if (overlap) throw new Error(`Se cruza con otra solicitud (${overlap.type.toLowerCase()} del ${dayLabel(overlap.from)}).`);
  if (input.type === "Vacaciones") {
    const balance = vacationBalance(d, e);
    if (balance.entitled === 0) throw new Error(`${e.name} aún no cumple un año; la ley le da vacaciones a partir del primero.`);
    if (days > balance.available) throw new Error(`${e.name} solo tiene ${balance.available} días disponibles (pide ${days}).`);
  }
  const leave: LeaveRequest = {
    id: newId(d, "aus"),
    employeeId: e.id,
    type: input.type,
    from: input.from,
    to: input.to,
    days,
    note: input.note.trim(),
    status: "pendiente",
    createdAt: todayKey(),
  };
  d.leaves.push(leave);
  return leave;
}

export function decideLeave(d: ArqState, leaveId: string, status: "aprobada" | "rechazada") {
  const l = d.leaves.find((x) => x.id === leaveId);
  if (!l) throw new Error("La solicitud ya no existe.");
  if (l.status !== "pendiente") throw new Error("La solicitud ya fue respondida.");
  l.status = status;
  if (status === "aprobada") {
    // Las horas que se hubieran registrado en esos días ya no aplican.
    d.timeEntries = d.timeEntries.filter((t) => !(t.employeeId === l.employeeId && t.date >= l.from && t.date <= l.to && !isWeekend(t.date)));
  }
  return { leave: l, employee: employee(d, l.employeeId) };
}
