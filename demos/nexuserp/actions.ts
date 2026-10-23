import { addDays, money, round2 } from "../shared/format";
import { balance, bankBalance, creditExposure, todayKey, totals } from "./calc";
import type { Customer, ErpState, Invoice, Line, Payment, PurchaseOrder, SalesOrder } from "./types";

/**
 * Operaciones de NexusERP. Reciben una copia del estado (`run(draft => …)`), la modifican y
 * lanzan `Error` con un mensaje para la persona usuaria si algo no se puede hacer.
 */

const newId = (d: ErpState, prefix: string) => `${prefix}-${d.nextId++}`;

const find = <T extends { id: string }>(list: T[], id: string, what: string) => {
  const x = list.find((i) => i.id === id);
  if (!x) throw new Error(`${what} ya no existe.`);
  return x;
};

function validateLines(lines: Line[]) {
  if (lines.length === 0) throw new Error("Agrega al menos un producto.");
  for (const l of lines) if (!Number.isInteger(l.qty) || l.qty <= 0) throw new Error("Las cantidades deben ser enteros mayores a cero.");
}

/* ---------- Ventas ---------- */

export function createOrder(d: ErpState, input: { customerId: string; lines: { productId: string; qty: number }[]; note: string }) {
  find(d.customers, input.customerId, "El cliente");
  const lines = input.lines.map((l) => ({ ...l, unitPrice: find(d.products, l.productId, "Un producto").price }));
  validateLines(lines);
  const order: SalesOrder = {
    id: newId(d, "ped"),
    folio: `PED-${d.counters.order++}`,
    customerId: input.customerId,
    date: todayKey(),
    lines,
    status: "borrador",
    note: input.note.trim() || undefined,
  };
  d.orders.push(order);
  return order;
}

/** Confirma: valida crédito y existencias, y aparta el inventario. */
export function confirmOrder(d: ErpState, id: string) {
  const o = find(d.orders, id, "El pedido");
  if (o.status !== "borrador") throw new Error("Solo se confirman pedidos en borrador.");
  const customer = find(d.customers, o.customerId, "El cliente");
  for (const l of o.lines) {
    const p = find(d.products, l.productId, "Un producto");
    if (l.qty > p.stock) throw new Error(`No alcanza ${p.name}: hay ${p.stock}, el pedido pide ${l.qty}.`);
  }
  const { total } = totals(o.lines, d.taxRate);
  const exposure = creditExposure(d, customer.id);
  if (exposure.total + total > customer.creditLimit)
    throw new Error(
      `Excede el crédito de ${customer.name}: debe ${money(exposure.total)} y su límite es ${money(customer.creditLimit)}. Registra un cobro o ajusta su límite.`
    );
  for (const l of o.lines) find(d.products, l.productId, "Un producto").stock -= l.qty;
  o.status = "confirmado";
  return o;
}

export function shipOrder(d: ErpState, id: string) {
  const o = find(d.orders, id, "El pedido");
  if (o.status !== "confirmado") throw new Error("Solo se envían pedidos confirmados.");
  o.status = "enviado";
  return o;
}

/** Factura el pedido: genera la cuenta por cobrar con vencimiento según el crédito del cliente. */
export function invoiceOrder(d: ErpState, id: string): Invoice {
  const o = find(d.orders, id, "El pedido");
  if (o.status !== "enviado" && o.status !== "confirmado") throw new Error("Solo se facturan pedidos confirmados o enviados.");
  const customer = find(d.customers, o.customerId, "El cliente");
  const date = todayKey();
  const inv: Invoice = {
    id: newId(d, "fac"),
    folio: `FAC-A ${d.counters.invoice++}`,
    kind: "cobrar",
    partyId: customer.id,
    orderId: o.id,
    date,
    dueDate: addDays(date, customer.creditDays),
    total: totals(o.lines, d.taxRate).total,
    paid: 0,
  };
  d.invoices.push(inv);
  o.status = "facturado";
  o.invoiceId = inv.id;
  return inv;
}

export function cancelOrder(d: ErpState, id: string) {
  const o = find(d.orders, id, "El pedido");
  if (o.status === "facturado") throw new Error("Un pedido facturado no se cancela; emite una nota de crédito.");
  if (o.status === "cancelado") throw new Error("El pedido ya estaba cancelado.");
  if (o.status === "confirmado" || o.status === "enviado")
    for (const l of o.lines) {
      const p = d.products.find((x) => x.id === l.productId);
      if (p) p.stock += l.qty;
    }
  o.status = "cancelado";
  return o;
}

/* ---------- Compras ---------- */

export function createPurchase(d: ErpState, input: { supplierId: string; lines: { productId: string; qty: number }[] }) {
  find(d.suppliers, input.supplierId, "El proveedor");
  const lines = input.lines.map((l) => ({ ...l, unitPrice: find(d.products, l.productId, "Un producto").cost }));
  validateLines(lines);
  const po: PurchaseOrder = { id: newId(d, "oc"), folio: `OC-${d.counters.purchase++}`, supplierId: input.supplierId, date: todayKey(), lines, status: "borrador" };
  d.purchases.push(po);
  return po;
}

/** Una orden en borrador por proveedor con lo que está por debajo del mínimo (hasta 2× el mínimo). */
export function createSuggestedPurchases(d: ErpState) {
  const low = d.products.filter((p) => p.stock < p.minStock);
  if (low.length === 0) throw new Error("No hay productos por debajo del mínimo.");
  const bySupplier = new Map<string, { productId: string; qty: number }[]>();
  for (const p of low) {
    const pendingQty = d.purchases
      .filter((po) => po.status === "borrador" || po.status === "enviada")
      .flatMap((po) => po.lines)
      .filter((l) => l.productId === p.id)
      .reduce((a, l) => a + l.qty, 0);
    const qty = p.minStock * 2 - p.stock - pendingQty;
    if (qty > 0) bySupplier.set(p.supplierId, [...(bySupplier.get(p.supplierId) ?? []), { productId: p.id, qty }]);
  }
  if (bySupplier.size === 0) throw new Error("Lo que falta ya está pedido en órdenes abiertas.");
  return [...bySupplier.entries()].map(([supplierId, lines]) => createPurchase(d, { supplierId, lines }));
}

export function sendPurchase(d: ErpState, id: string) {
  const po = find(d.purchases, id, "La orden de compra");
  if (po.status !== "borrador") throw new Error("Solo se envían órdenes en borrador.");
  po.status = "enviada";
  return po;
}

/** Recibe la mercancía: suma existencias, actualiza el último costo y genera la cuenta por pagar. */
export function receivePurchase(d: ErpState, id: string, supplierInvoice: string) {
  const po = find(d.purchases, id, "La orden de compra");
  if (po.status !== "enviada") throw new Error("Solo se reciben órdenes enviadas al proveedor.");
  const supplier = find(d.suppliers, po.supplierId, "El proveedor");
  const date = todayKey();
  for (const l of po.lines) {
    const p = find(d.products, l.productId, "Un producto");
    p.stock += l.qty;
    p.cost = l.unitPrice;
  }
  const bill: Invoice = {
    id: newId(d, "cxp"),
    folio: supplierInvoice.trim() || `PROV-${d.counters.bill++}`,
    kind: "pagar",
    partyId: supplier.id,
    orderId: po.id,
    date,
    dueDate: addDays(date, supplier.creditDays),
    total: totals(po.lines, d.taxRate).total,
    paid: 0,
  };
  d.invoices.push(bill);
  Object.assign(po, { status: "recibida", receivedDate: date, billId: bill.id });
  return { po, bill };
}

export function cancelPurchase(d: ErpState, id: string) {
  const po = find(d.purchases, id, "La orden de compra");
  if (po.status === "recibida") throw new Error("Una orden recibida no se cancela.");
  if (po.status === "cancelada") throw new Error("La orden ya estaba cancelada.");
  po.status = "cancelada";
  return po;
}

/* ---------- Finanzas ---------- */

export function registerPayment(d: ErpState, invoiceId: string, amount: number, method: Payment["method"]) {
  const inv = find(d.invoices, invoiceId, "La factura");
  const due = balance(inv);
  if (!(amount > 0)) throw new Error("El monto debe ser mayor a cero.");
  if (round2(amount) > due) throw new Error(`El saldo de ${inv.folio} es ${money(due)}; no se puede aplicar más.`);
  if (inv.kind === "pagar" && amount > bankBalance(d)) throw new Error(`Saldo insuficiente en banco (${money(bankBalance(d))}).`);
  d.payments.push({ id: newId(d, "pago"), invoiceId, date: todayKey(), amount: round2(amount), method });
  inv.paid = round2(inv.paid + amount);
  return inv;
}

/* ---------- Inventario y contactos ---------- */

export function adjustStock(d: ErpState, productId: string, counted: number, reason: string) {
  const p = find(d.products, productId, "El producto");
  if (!Number.isInteger(counted) || counted < 0) throw new Error("El conteo debe ser un entero de 0 o más.");
  if (!reason.trim()) throw new Error("Escribe el motivo del ajuste.");
  const diff = counted - p.stock;
  p.stock = counted;
  return { product: p, diff };
}

export function updatePrice(d: ErpState, productId: string, price: number, minStock: number) {
  const p = find(d.products, productId, "El producto");
  if (!(price > 0)) throw new Error("El precio debe ser mayor a cero.");
  if (price < p.cost) throw new Error(`El precio no puede quedar por debajo del costo (${money(p.cost)}).`);
  if (!Number.isInteger(minStock) || minStock < 0) throw new Error("El mínimo debe ser un entero de 0 o más.");
  Object.assign(p, { price: round2(price), minStock });
  return p;
}

export function createCustomer(d: ErpState, input: Omit<Customer, "id">) {
  if (input.name.trim().length < 3) throw new Error("Escribe la razón social.");
  if (!/^[A-ZÑ&]{3,4}-?\d{6}-?[A-Z0-9]{3}$/i.test(input.rfc.trim())) throw new Error("El RFC no tiene un formato válido (p. ej. ABC-123456-XY1).");
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) throw new Error("El correo no es válido.");
  if (!(input.creditLimit >= 0)) throw new Error("El límite de crédito no puede ser negativo.");
  const c: Customer = { ...input, id: newId(d, "cli"), name: input.name.trim(), rfc: input.rfc.trim().toUpperCase() };
  d.customers.push(c);
  return c;
}

export function updateCredit(d: ErpState, customerId: string, creditLimit: number, creditDays: number) {
  const c = find(d.customers, customerId, "El cliente");
  if (!(creditLimit >= 0)) throw new Error("El límite de crédito no puede ser negativo.");
  if (![0, 15, 30, 45, 60].includes(creditDays)) throw new Error("Los días de crédito deben ser 0, 15, 30, 45 o 60.");
  Object.assign(c, { creditLimit: Math.round(creditLimit), creditDays });
  return c;
}
