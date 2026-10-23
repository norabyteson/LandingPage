/** Formatos de los demos: moneda en MXN y fechas en español de México. */

const moneyFmt = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const numberFmt = new Intl.NumberFormat("es-MX");
const dateFmt = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" });
const dayFmt = new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric" });

export const money = (value: number) => moneyFmt.format(value);
export const number = (value: number) => numberFmt.format(value);
export const date = (iso: string) => dateFmt.format(new Date(iso));
export const time = (iso: string) => timeFmt.format(new Date(iso));
export const dateTime = (iso: string) => `${dateFmt.format(new Date(iso))}, ${timeFmt.format(new Date(iso))}`;
export const shortDay = (d: Date) => dayFmt.format(d);

/** Redondeo a centavos (evita 0.30000000000000004 en totales). */
export const round2 = (value: number) => Math.round(value * 100) / 100;

/** ¿La fecha ISO cae en el mismo día local que `ref`? */
export function sameDay(iso: string, ref: Date = new Date()) {
  const d = new Date(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate();
}

/** Inicio del día local (00:00) desplazado `offsetDays` días. */
export function startOfDay(offsetDays = 0, ref: Date = new Date()) {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d;
}

/* ---------- Días como claves «YYYY-MM-DD» (hora local, sin desfases de zona horaria) ---------- */

export function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function fromDayKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}
export function addDays(key: string, days: number) {
  const d = fromDayKey(key);
  d.setDate(d.getDate() + days);
  return dayKey(d);
}
/** Lunes de la semana del día dado. */
export function weekStart(key: string) {
  const d = fromDayKey(key);
  return addDays(key, -((d.getDay() + 6) % 7));
}
export const isWeekend = (key: string) => [0, 6].includes(fromDayKey(key).getDay());
/** Días hábiles (lunes a viernes) entre dos fechas, ambas incluidas. */
export function businessDays(from: string, to: string) {
  let count = 0;
  for (let k = from; k <= to; k = addDays(k, 1)) if (!isWeekend(k)) count++;
  return count;
}
const dayLabelFmt = new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric", month: "short" });
export const dayLabel = (key: string) => dayLabelFmt.format(fromDayKey(key));
export const dayDate = (key: string) => dateFmt.format(fromDayKey(key));

/** Iniciales para avatares: «Valeria Soto» → «VS». */
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
