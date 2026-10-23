/** Modelo de datos de ArquitectOS (gestión de personal y proyectos de un despacho de arquitectura). */

export type DepartmentId = "arquitectonico" | "estructural" | "interiores" | "obra" | "administracion";
export type ProjectType = "Residencial" | "Comercial" | "Industrial" | "Interiorismo" | "Hospitalidad";
export type Phase = "Anteproyecto" | "Proyecto ejecutivo" | "Obra" | "Entregado";
export type LeaveType = "Vacaciones" | "Permiso" | "Incapacidad";

export interface Department {
  id: DepartmentId;
  name: string;
}

export interface Employee {
  id: string;
  empNo: string;
  name: string;
  email: string;
  phone: string;
  department: DepartmentId;
  position: string;
  status: "activo" | "inactivo";
  /** Fecha de ingreso «YYYY-MM-DD». */
  hireDate: string;
  /** Costo por hora para el despacho (MXN), para calcular el costo de cada proyecto. */
  hourlyCost: number;
  photo?: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  client: string;
  type: ProjectType;
  phase: Phase;
  /** Horas presupuestadas para todo el proyecto. */
  budgetHours: number;
  /** Horas ya consumidas antes del periodo con registro detallado (historial previo). */
  hoursBefore: number;
  /** Honorarios cobrados al cliente (MXN, sin IVA). */
  fee: number;
  startDate: string;
  dueDate: string;
  leadId: string;
}

/** Dedicación de una persona a un proyecto (porcentaje de su jornada). */
export interface Assignment {
  id: string;
  employeeId: string;
  projectId: string;
  allocation: number;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  projectId: string;
  /** Día «YYYY-MM-DD». */
  date: string;
  hours: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  from: string;
  to: string;
  /** Días hábiles que abarca. */
  days: number;
  note: string;
  status: "pendiente" | "aprobada" | "rechazada";
  createdAt: string;
}

export interface ArqState {
  version: number;
  company: { name: string; offices: string; manager: string };
  /** «Hoy» de la demo al generar los datos (para que el historial sea coherente). */
  seedDate: string;
  departments: Department[];
  employees: Employee[];
  projects: Project[];
  assignments: Assignment[];
  timeEntries: TimeEntry[];
  leaves: LeaveRequest[];
  nextId: number;
}

export const PHASES: Phase[] = ["Anteproyecto", "Proyecto ejecutivo", "Obra", "Entregado"];
