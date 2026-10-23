import { round2, sameDay, startOfDay } from "../shared/format";
import type { CartLine, CategoryId, PaymentMethod, PosState, Product, Sale, Shift } from "./types";

/** Totales del carrito. Los precios ya incluyen IVA; el IVA se desglosa del total. */
export function cartTotals(lines: CartLine[], products: Product[], discountRate: number, taxRate: number) {
  const gross = round2(
    lines.reduce((sum, l) => sum + l.qty * (products.find((p) => p.id === l.productId)?.price ?? 0), 0)
  );
  const discount = round2(gross * discountRate);
  const total = round2(gross - discount);
  const tax = round2(total - total / (1 + taxRate));
  const count = lines.reduce((sum, l) => sum + l.qty, 0);
  return { gross, discount, total, tax, subtotal: round2(total - tax), count };
}

export const totalStock = (p: Product) => Object.values(p.stock).reduce((a, b) => a + b, 0);

export function stockStatus(p: Product): "agotado" | "bajo" | "ok" {
  const total = totalStock(p);
  if (total === 0) return "agotado";
  return total < p.minStock ? "bajo" : "ok";
}

/** Turno abierto (sin cierre), si hay. */
export const openShift = (state: PosState): Shift | undefined => state.shifts.find((s) => !s.closedAt);

/** Resumen de un turno para el corte de caja. */
export function shiftSummary(state: PosState, shift: Shift) {
  const sales = state.sales.filter((s) => s.shiftId === shift.id);
  const paid = sales.filter((s) => s.status === "pagada");
  const sumBy = (m: PaymentMethod) => round2(paid.filter((s) => s.method === m).reduce((a, s) => a + s.total, 0));
  const cash = sumBy("efectivo");
  return {
    sales,
    paidCount: paid.length,
    cancelledCount: sales.length - paid.length,
    cash,
    card: sumBy("tarjeta"),
    transfer: sumBy("transferencia"),
    total: round2(paid.reduce((a, s) => a + s.total, 0)),
    expectedCash: round2(shift.openingCash + cash),
  };
}

export const paidSales = (state: PosState) => state.sales.filter((s) => s.status === "pagada");

/** Ventas pagadas desde hace `days` días (incluye hoy). */
export function salesSince(state: PosState, days: number, now = new Date()) {
  const from = startOfDay(-(days - 1), now).getTime();
  return paidSales(state).filter((s) => new Date(s.createdAt).getTime() >= from);
}

export function kpis(sales: Sale[]) {
  const total = round2(sales.reduce((a, s) => a + s.total, 0));
  const items = sales.reduce((a, s) => a + s.items.reduce((b, it) => b + it.qty, 0), 0);
  return { total, count: sales.length, items, average: sales.length ? round2(total / sales.length) : 0 };
}

/** Total vendido por día, del más antiguo a hoy. */
export function salesByDay(state: PosState, days: number, now = new Date()) {
  return Array.from({ length: days }, (_, i) => {
    const day = startOfDay(-(days - 1 - i), now);
    const total = round2(paidSales(state).filter((s) => sameDay(s.createdAt, day)).reduce((a, s) => a + s.total, 0));
    return { day, total };
  });
}

export function salesByMethod(sales: Sale[]) {
  const methods: PaymentMethod[] = ["efectivo", "tarjeta", "transferencia"];
  return methods.map((method) => ({
    method,
    total: round2(sales.filter((s) => s.method === method).reduce((a, s) => a + s.total, 0)),
  }));
}

/** Productos más vendidos por unidades (el importe se aproxima con el precio de lista). */
export function topProducts(sales: Sale[], limit = 5) {
  const map = new Map<string, { name: string; qty: number; amount: number }>();
  for (const s of sales)
    for (const it of s.items) {
      const row = map.get(it.productId) ?? { name: it.name, qty: 0, amount: 0 };
      row.qty += it.qty;
      row.amount = round2(row.amount + it.qty * it.unitPrice * (1 - s.discountRate));
      map.set(it.productId, row);
    }
  return [...map.entries()]
    .map(([productId, row]) => ({ productId, ...row }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, limit);
}

export function salesByCategory(state: PosState, sales: Sale[]) {
  const totals = new Map<CategoryId, number>();
  for (const s of sales)
    for (const it of s.items) {
      const cat = state.products.find((p) => p.id === it.productId)?.category;
      if (!cat) continue;
      totals.set(cat, round2((totals.get(cat) ?? 0) + it.qty * it.unitPrice * (1 - s.discountRate)));
    }
  return state.categories.map((c) => ({ ...c, total: totals.get(c.id) ?? 0 }));
}

export const METHOD_LABEL: Record<PaymentMethod, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
};
