import { addDays, businessDays, dayKey, isWeekend, weekStart } from "../../shared/format";
import { createRandom } from "../../shared/random";
import type { ArqState, Assignment, Employee, LeaveRequest, Project, TimeEntry } from "../types";

/** Sube este número si cambia la forma de los datos: lo guardado con otra versión se descarta. */
export const SEED_VERSION = 1;

const IMG = "/demos/custom/assets/arquitectos";

/** `months`/`days` atrás desde hoy, como clave de día. */
const ago = (today: string, { years = 0, months = 0, days = 0 }) => {
  const [y, m, d] = today.split("-").map(Number);
  return dayKey(new Date(y! - years, m! - 1 - months, d! - days));
};

/**
 * Genera el estado inicial, relativo a «hoy»: cuatro semanas de horas registradas, ausencias
 * pasadas y futuras. Aleatorio con semilla fija: restablecer da siempre la misma demo.
 */
export function buildSeed(now: Date = new Date()): ArqState {
  const today = dayKey(now);
  const rnd = createRandom(20261023);
  let id = 1;
  const nextId = (prefix: string) => `${prefix}-${id++}`;

  const people: Omit<Employee, "id" | "email">[] = [
    { empNo: "EMP-9021", name: "Julián Vargas", phone: "662 218 4410", department: "estructural", position: "Arquitecto principal", status: "activo", hireDate: ago(today, { years: 5, months: 1 }), hourlyCost: 650, photo: `${IMG}/img-05.webp` },
    { empNo: "EMP-4482", name: "Sara Domínguez", phone: "662 301 7725", department: "interiores", position: "Líder de diseño", status: "activo", hireDate: ago(today, { years: 2, months: 7 }), hourlyCost: 520, photo: `${IMG}/img-01.webp` },
    { empNo: "EMP-1129", name: "Marcos Torres", phone: "662 144 9083", department: "obra", position: "Ingeniero de proyectos", status: "inactivo", hireDate: ago(today, { years: 3, months: 9 }), hourlyCost: 430, photo: `${IMG}/img-03.webp` },
    { empNo: "EMP-3381", name: "Elena Rodríguez", phone: "662 255 3017", department: "administracion", position: "Gerente de operaciones", status: "activo", hireDate: ago(today, { years: 2, months: 4 }), hourlyCost: 560, photo: `${IMG}/img-02.webp` },
    { empNo: "EMP-5106", name: "Andrés Cota", phone: "662 187 6620", department: "arquitectonico", position: "Arquitecto proyectista", status: "activo", hireDate: ago(today, { years: 4, months: 2 }), hourlyCost: 410, photo: `${IMG}/img-04.webp` },
    { empNo: "EMP-5233", name: "Lucía Valdez", phone: "662 342 1196", department: "arquitectonico", position: "Arquitecta sénior", status: "activo", hireDate: ago(today, { years: 6, months: 5 }), hourlyCost: 540 },
    { empNo: "EMP-5341", name: "Daniela Ochoa", phone: "662 119 4472", department: "arquitectonico", position: "Arquitecta proyectista", status: "activo", hireDate: ago(today, { years: 1, months: 10 }), hourlyCost: 380 },
    { empNo: "EMP-5418", name: "Iván Moreno", phone: "662 276 0581", department: "arquitectonico", position: "Modelador BIM", status: "activo", hireDate: ago(today, { years: 3, months: 1 }), hourlyCost: 330 },
    { empNo: "EMP-5590", name: "Valeria Montaño", phone: "662 408 3329", department: "arquitectonico", position: "Arquitecta junior", status: "activo", hireDate: ago(today, { months: 4 }), hourlyCost: 240 },
    { empNo: "EMP-6012", name: "Rafael Encinas", phone: "662 233 8804", department: "estructural", position: "Ingeniero estructurista", status: "activo", hireDate: ago(today, { years: 7, months: 3 }), hourlyCost: 590 },
    { empNo: "EMP-6075", name: "Mónica Leyva", phone: "662 160 2247", department: "estructural", position: "Calculista", status: "activo", hireDate: ago(today, { years: 2, months: 1 }), hourlyCost: 410 },
    { empNo: "EMP-7031", name: "Paulina Gaxiola", phone: "662 389 5510", department: "interiores", position: "Diseñadora de interiores", status: "activo", hireDate: ago(today, { years: 1, months: 6 }), hourlyCost: 360 },
    { empNo: "EMP-7088", name: "Tomás Félix", phone: "662 212 7743", department: "interiores", position: "Visualizador 3D", status: "activo", hireDate: ago(today, { years: 2, months: 9 }), hourlyCost: 340 },
    { empNo: "EMP-8014", name: "Gerardo Bojórquez", phone: "662 174 9935", department: "obra", position: "Residente de obra", status: "activo", hireDate: ago(today, { years: 4, months: 8 }), hourlyCost: 420 },
    { empNo: "EMP-8052", name: "Karla Navarro", phone: "662 325 4168", department: "obra", position: "Supervisora de obra", status: "activo", hireDate: ago(today, { years: 3, months: 6 }), hourlyCost: 450 },
    { empNo: "EMP-8097", name: "Esteban Ruiz", phone: "662 197 0326", department: "obra", position: "Residente de obra", status: "activo", hireDate: ago(today, { years: 1, months: 2 }), hourlyCost: 370 },
    { empNo: "EMP-9105", name: "Natalia Corral", phone: "662 264 8851", department: "administracion", position: "Coordinadora de proyectos", status: "activo", hireDate: ago(today, { years: 3, months: 11 }), hourlyCost: 400 },
    { empNo: "EMP-9140", name: "Joaquín Peralta", phone: "662 138 2290", department: "administracion", position: "Contador", status: "activo", hireDate: ago(today, { years: 5, months: 7 }), hourlyCost: 380 },
  ];
  const slug = (name: string) =>
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .split(" ")
      .map((w, i) => (i === 0 ? w : w[0]))
      .join(".");
  const employees: Employee[] = people.map((p) => ({ ...p, id: nextId("emp"), email: `${slug(p.name)}@tallerpitic.mx` }));
  const emp = (name: string) => employees.find((e) => e.name === name)!.id;

  const projectRows: Omit<Project, "id">[] = [
    { code: "TP-24-031", name: "Residencia Las Lomas", client: "Familia Robles Gutiérrez", type: "Residencial", phase: "Proyecto ejecutivo", budgetHours: 1200, hoursBefore: 610, fee: 1450000, startDate: ago(today, { months: 5 }), dueDate: ago(today, { months: -2, days: 6 }), leadId: emp("Lucía Valdez") },
    { code: "TP-25-004", name: "Torre Corporativa Kino", client: "Grupo Kino Desarrollos", type: "Comercial", phase: "Anteproyecto", budgetHours: 3200, hoursBefore: 380, fee: 4800000, startDate: ago(today, { months: 2 }), dueDate: ago(today, { months: -9 }), leadId: emp("Julián Vargas") },
    { code: "TP-24-047", name: "Clínica DentaLux Pitic", client: "DentaLux Clínicas", type: "Interiorismo", phase: "Obra", budgetHours: 640, hoursBefore: 260, fee: 720000, startDate: ago(today, { months: 6 }), dueDate: ago(today, { days: -24 }), leadId: emp("Sara Domínguez") },
    { code: "TP-24-052", name: "Nave Industrial Parque Norte", client: "Logística del Pacífico", type: "Industrial", phase: "Obra", budgetHours: 900, hoursBefore: 470, fee: 980000, startDate: ago(today, { months: 7 }), dueDate: ago(today, { months: -1, days: 12 }), leadId: emp("Rafael Encinas") },
    { code: "TP-25-009", name: "Hotel Alameda (remodelación)", client: "Hoteles Alameda", type: "Hospitalidad", phase: "Proyecto ejecutivo", budgetHours: 1800, hoursBefore: 540, fee: 2350000, startDate: ago(today, { months: 3 }), dueDate: ago(today, { months: -5 }), leadId: emp("Andrés Cota") },
    { code: "TP-24-018", name: "Casa Club Altares", client: "Residencial Altares", type: "Residencial", phase: "Entregado", budgetHours: 700, hoursBefore: 688, fee: 860000, startDate: ago(today, { months: 11 }), dueDate: ago(today, { months: 1, days: 3 }), leadId: emp("Daniela Ochoa") },
    { code: "TP-25-014", name: "Plaza Bulevar Morelos", client: "Inmobiliaria Morelos", type: "Comercial", phase: "Anteproyecto", budgetHours: 1500, hoursBefore: 60, fee: 1900000, startDate: ago(today, { days: 34 }), dueDate: ago(today, { months: -7 }), leadId: emp("Lucía Valdez") },
  ];
  const projects: Project[] = projectRows.map((p) => ({ ...p, id: nextId("proy") }));
  const proj = (name: string) => projects.find((p) => p.name === name)!.id;

  /** [persona, proyecto, % de su jornada] */
  const plan: [string, string, number][] = [
    ["Julián Vargas", "Torre Corporativa Kino", 60],
    ["Julián Vargas", "Nave Industrial Parque Norte", 40],
    ["Sara Domínguez", "Clínica DentaLux Pitic", 50],
    ["Sara Domínguez", "Hotel Alameda (remodelación)", 50],
    ["Elena Rodríguez", "Torre Corporativa Kino", 20],
    ["Andrés Cota", "Hotel Alameda (remodelación)", 70],
    ["Andrés Cota", "Plaza Bulevar Morelos", 30],
    ["Lucía Valdez", "Residencia Las Lomas", 60],
    ["Lucía Valdez", "Plaza Bulevar Morelos", 40],
    ["Daniela Ochoa", "Residencia Las Lomas", 50],
    ["Iván Moreno", "Torre Corporativa Kino", 50],
    ["Iván Moreno", "Residencia Las Lomas", 50],
    ["Valeria Montaño", "Plaza Bulevar Morelos", 40],
    ["Rafael Encinas", "Nave Industrial Parque Norte", 50],
    ["Rafael Encinas", "Torre Corporativa Kino", 30],
    ["Mónica Leyva", "Nave Industrial Parque Norte", 40],
    ["Mónica Leyva", "Residencia Las Lomas", 30],
    ["Paulina Gaxiola", "Clínica DentaLux Pitic", 60],
    ["Paulina Gaxiola", "Hotel Alameda (remodelación)", 40],
    ["Tomás Félix", "Hotel Alameda (remodelación)", 50],
    ["Gerardo Bojórquez", "Nave Industrial Parque Norte", 100],
    ["Karla Navarro", "Clínica DentaLux Pitic", 60],
    ["Esteban Ruiz", "Clínica DentaLux Pitic", 40],
    ["Natalia Corral", "Torre Corporativa Kino", 30],
    ["Natalia Corral", "Hotel Alameda (remodelación)", 30],
  ];
  const assignments: Assignment[] = plan.map(([e, p, allocation]) => ({ id: nextId("asig"), employeeId: emp(e), projectId: proj(p), allocation }));

  /* ---- Ausencias: una de vacaciones a principio de año por persona y algunas recientes/próximas ---- */
  const leaves: LeaveRequest[] = [];
  const addLeave = (name: string, type: LeaveRequest["type"], from: string, to: string, status: LeaveRequest["status"], note: string) =>
    leaves.push({ id: nextId("aus"), employeeId: emp(name), type, from, to, days: businessDays(from, to), note, status, createdAt: addDays(from, -10) });

  const yearStart = `${today.slice(0, 4)}-01-01`;
  for (const e of employees) {
    if (e.hireDate > ago(today, { years: 1 })) continue; // sin derecho todavía
    let from = addDays(yearStart, rnd.int(20, 200));
    if (from >= addDays(today, -40)) from = addDays(today, -rnd.int(60, 120));
    while (isWeekend(from)) from = addDays(from, 1);
    const to = addDays(from, rnd.int(2, 6));
    addLeave(e.name, "Vacaciones", from, to, "aprobada", "Vacaciones programadas");
  }
  const thisMonday = weekStart(today);
  addLeave("Paulina Gaxiola", "Vacaciones", addDays(thisMonday, -7), addDays(thisMonday, -6), "aprobada", "Boda de un familiar");
  addLeave("Esteban Ruiz", "Incapacidad", addDays(thisMonday, -14), addDays(thisMonday, -12), "aprobada", "Incapacidad IMSS por gripe");
  addLeave("Iván Moreno", "Vacaciones", addDays(thisMonday, 7), addDays(thisMonday, 9), "pendiente", "Viaje a Guadalajara");
  addLeave("Karla Navarro", "Permiso", addDays(thisMonday, 11), addDays(thisMonday, 11), "pendiente", "Trámite escolar de su hija");
  addLeave("Tomás Félix", "Vacaciones", addDays(thisMonday, 14), addDays(thisMonday, 18), "rechazada", "Coincide con la entrega del Hotel Alameda");

  /* ---- Horas: cuatro semanas, de lunes a viernes, hasta hoy ---- */
  const timeEntries: TimeEntry[] = [];
  const onLeave = (employeeId: string, day: string) =>
    leaves.some((l) => l.employeeId === employeeId && l.status === "aprobada" && l.from <= day && day <= l.to);
  for (let day = addDays(thisMonday, -21); day <= today; day = addDays(day, 1)) {
    if (isWeekend(day)) continue;
    for (const a of assignments) {
      const e = employees.find((x) => x.id === a.employeeId)!;
      if (e.status !== "activo" || onLeave(e.id, day)) continue;
      // Hoy, solo algunas personas ya registraron su día.
      if (day === today && rnd.chance(0.5)) continue;
      const hours = Math.round(((a.allocation / 100) * 8 * (0.85 + rnd.next() * 0.25)) * 2) / 2;
      if (hours > 0) timeEntries.push({ id: nextId("hrs"), employeeId: e.id, projectId: a.projectId, date: day, hours });
    }
  }

  return {
    version: SEED_VERSION,
    company: { name: "Taller Pitic Arquitectos", offices: "Hermosillo, Sonora", manager: "Elena Rodríguez" },
    seedDate: today,
    departments: [
      { id: "arquitectonico", name: "Diseño arquitectónico" },
      { id: "estructural", name: "Diseño estructural" },
      { id: "interiores", name: "Diseño de interiores" },
      { id: "obra", name: "Gestión de obra" },
      { id: "administracion", name: "Administración" },
    ],
    employees,
    projects,
    assignments,
    timeEntries,
    leaves,
    nextId: id,
  };
}
