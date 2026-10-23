import { addDays, dayKey, fromDayKey, round2 } from "../shared/format";
import type { ErpState, Invoice, Line, OrderStatus, PurchaseStatus } from "./types";

export const todayKey = () => dayKey(new Date());
export const money0 = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

/** Subtotal, IVA y total de unas partidas (precios sin IVA). */
export function totals(lines: Line[], taxRate: number) {
  const subtotal = round2(lines.reduce((a, l) => a + l.qty * l.unitPrice, 0));
  const tax = round2(subtotal * taxRate);
  return { subtotal, tax, total: round2(subtotal + tax) };
}

export const balance = (inv: Invoice) => round2(inv.total - inv.paid);

export type InvoiceStatus = "pagada" | "vencida" | "parcial" | "pendiente";
export function invoiceStatus(inv: Invoice, today = todayKey()): InvoiceStatus {
  if (balance(inv) <= 0.005) return "pagada";
  if (inv.dueDate < today) return "vencida";
  return inv.paid > 0 ? "parcial" : "pendiente";
}

export const daysBetween = (from: string, to: string) =>
  Math.round((fromDayKey(to).getTime() - fromDayKey(from).getTime()) / 86_400_000);

/** Saldo del banco: apertura + cobros − pagos a proveedores. */
export function bankBalance(state: ErpState) {
  let total = state.openingBank;
  for (const p of state.payments) {
    const inv = state.invoices.find((i) => i.id === p.invoiceId);
    total += inv?.kind === "pagar" ? -p.amount : p.amount;
  }
  return round2(total);
}

const open = (state: ErpState, kind: Invoice["kind"]) => state.invoices.filter((i) => i.kind === kind && balance(i) > 0.005);

export const receivables = (state: ErpState) => open(state, "cobrar");
export const payables = (state: ErpState) => open(state, "pagar");

/** Lo que el cliente debe (facturas abiertas) más lo apartado en pedidos aún sin facturar. */
export function creditExposure(state: ErpState, customerId: string) {
  const owed = receivables(state)
    .filter((i) => i.partyId === customerId)
    .reduce((a, i) => a + balance(i), 0);
  const pending = state.orders
    .filter((o) => o.customerId === customerId && (o.status === "confirmado" || o.status === "enviado"))
    .reduce((a, o) => a + totals(o.lines, state.taxRate).total, 0);
  return { owed: round2(owed), pending: round2(pending), total: round2(owed + pending) };
}

/** Antigüedad de saldos: al corriente y vencido por rangos de días. */
export function aging(invoices: Invoice[], today = todayKey()) {
  const buckets = { corriente: 0, d30: 0, d60: 0, d90: 0 };
  for (const i of invoices) {
    const late = daysBetween(i.dueDate, today);
    const b = balance(i);
    if (late <= 0) buckets.corriente += b;
    else if (late <= 30) buckets.d30 += b;
    else if (late <= 60) buckets.d60 += b;
    else buckets.d90 += b;
  }
  return Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, round2(v)])) as typeof buckets;
}

/** Ventas facturadas (sin IVA) por mes, del más antiguo al actual. */
export function monthlySales(state: ErpState, months: number, today = todayKey()) {
  const ref = fromDayKey(today);
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(ref.getFullYear(), ref.getMonth() - (months - 1 - i), 1);
    const prefix = dayKey(d).slice(0, 7);
    const total = state.invoices
      .filter((inv) => inv.kind === "cobrar" && inv.date.startsWith(prefix))
      .reduce((a, inv) => a + inv.total / (1 + state.taxRate), 0);
    return { label: d.toLocaleDateString("es-MX", { month: "short" }), total: round2(total), current: i === months - 1 };
  });
}

/**
 * Ventas facturadas (sin IVA) del mes en curso hasta hoy, y del mes anterior hasta el mismo día:
 * comparar el mes a medias contra uno completo daría una caída falsa.
 */
export function monthToDate(state: ErpState, today = todayKey()) {
  const ref = fromDayKey(today);
  const sum = (from: string, to: string) =>
    round2(
      state.invoices
        .filter((i) => i.kind === "cobrar" && i.date >= from && i.date <= to)
        .reduce((a, i) => a + i.total / (1 + state.taxRate), 0)
    );
  const current = sum(dayKey(new Date(ref.getFullYear(), ref.getMonth(), 1)), today);
  const prevEnd = new Date(ref.getFullYear(), ref.getMonth() - 1, Math.min(ref.getDate(), new Date(ref.getFullYear(), ref.getMonth(), 0).getDate()));
  const previous = sum(dayKey(new Date(ref.getFullYear(), ref.getMonth() - 1, 1)), dayKey(prevEnd));
  return { current, previous, change: previous ? Math.round(((current - previous) / previous) * 100) : 0 };
}

export function salesByCategory(state: ErpState, sinceDays: number, today = todayKey()) {
  const from = addDays(today, -sinceDays);
  const map = new Map<string, number>();
  for (const o of state.orders) {
    if (o.status !== "facturado" || o.date < from) continue;
    for (const l of o.lines) {
      const cat = state.products.find((p) => p.id === l.productId)?.category;
      if (cat) map.set(cat, (map.get(cat) ?? 0) + l.qty * l.unitPrice);
    }
  }
  return state.categories.map((c) => ({ ...c, total: round2(map.get(c.id) ?? 0) })).sort((a, b) => b.total - a.total);
}

export function topCustomers(state: ErpState, sinceDays: number, today = todayKey()) {
  const from = addDays(today, -sinceDays);
  return state.customers
    .map((c) => ({
      customer: c,
      total: round2(
        state.invoices.filter((i) => i.kind === "cobrar" && i.partyId === c.id && i.date >= from).reduce((a, i) => a + i.total / (1 + state.taxRate), 0)
      ),
    }))
    .sort((a, b) => b.total - a.total);
}

export const lowStock = (state: ErpState) => state.products.filter((p) => p.stock < p.minStock);

export const ORDER_LABEL: Record<OrderStatus, string> = {
  borrador: "Borrador",
  confirmado: "Confirmado",
  enviado: "Enviado",
  facturado: "Facturado",
  cancelado: "Cancelado",
};
export const PURCHASE_LABEL: Record<PurchaseStatus, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  recibida: "Recibida",
  cancelada: "Cancelada",
};
