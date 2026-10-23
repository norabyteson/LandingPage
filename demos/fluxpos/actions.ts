import { money, round2 } from "../shared/format";
import { cartTotals, openShift } from "./calc";
import type { CartLine, CategoryId, Customer, PaymentMethod, PosState, Product, Sale } from "./types";

/**
 * Operaciones de FluxPOS. Reciben una copia del estado (`run(draft => …)`), la modifican y
 * lanzan `Error` con un mensaje para la persona usuaria si algo no se puede hacer.
 */

const newId = (d: PosState, prefix: string) => `${prefix}-${d.nextId++}`;
const nowIso = () => new Date().toISOString();

function product(d: PosState, id: string) {
  const p = d.products.find((x) => x.id === id);
  if (!p) throw new Error("El producto ya no existe.");
  return p;
}

export function checkout(
  d: PosState,
  input: { lines: CartLine[]; customerId: string | null; method: PaymentMethod; received?: number; reference?: string }
): Sale {
  const shift = openShift(d);
  if (!shift) throw new Error("No hay un turno abierto. Ábrelo en «Corte de caja» para poder cobrar.");
  if (input.lines.length === 0) throw new Error("El carrito está vacío.");

  for (const l of input.lines) {
    const p = product(d, l.productId);
    const available = p.stock[l.size] ?? 0;
    if (l.qty > available)
      throw new Error(`Solo quedan ${available} de ${p.name} (talla ${l.size}).`);
  }

  const customer = d.customers.find((c) => c.id === input.customerId) ?? null;
  const discountRate = customer?.vip ? d.settings.vipDiscount : 0;
  const totals = cartTotals(input.lines, d.products, discountRate, d.settings.taxRate);

  if (input.method === "efectivo") {
    if (input.received === undefined || Number.isNaN(input.received))
      throw new Error("Indica con cuánto paga el cliente.");
    if (input.received < totals.total)
      throw new Error(`El efectivo recibido no alcanza: faltan ${money(round2(totals.total - input.received))}.`);
  }

  const createdAt = nowIso();
  const sale: Sale = {
    id: newId(d, "venta"),
    folio: `V-${String(d.nextFolio++).padStart(5, "0")}`,
    createdAt,
    items: input.lines.map((l) => {
      const p = product(d, l.productId);
      return { productId: p.id, name: p.name, size: l.size, qty: l.qty, unitPrice: p.price };
    }),
    customerId: customer?.id ?? null,
    discountRate,
    discount: totals.discount,
    total: totals.total,
    tax: totals.tax,
    method: input.method,
    status: "pagada",
    shiftId: shift.id,
  };
  if (input.method === "efectivo") {
    sale.received = round2(input.received!);
    sale.change = round2(input.received! - totals.total);
  } else {
    sale.reference = input.reference?.trim() || `${input.method === "tarjeta" ? "AUT" : "SPEI"}-${Math.floor(100000 + Math.random() * 900000)}`;
  }

  for (const it of sale.items) {
    product(d, it.productId).stock[it.size] -= it.qty;
    d.movements.unshift({ id: newId(d, "mov"), createdAt, productId: it.productId, size: it.size, qty: -it.qty, type: "venta", note: sale.folio });
  }
  d.sales.push(sale);
  return sale;
}

export function cancelSale(d: PosState, saleId: string, reason: string) {
  const sale = d.sales.find((s) => s.id === saleId);
  if (!sale) throw new Error("La venta no existe.");
  if (sale.status === "cancelada") throw new Error("Esta venta ya estaba cancelada.");
  if (!reason.trim()) throw new Error("Escribe el motivo de la cancelación.");
  const shift = d.shifts.find((s) => s.id === sale.shiftId);
  if (shift?.closedAt) throw new Error("No se puede cancelar: el turno de esa venta ya tiene corte de caja.");

  const createdAt = nowIso();
  sale.status = "cancelada";
  sale.cancelReason = reason.trim();
  sale.cancelledAt = createdAt;
  for (const it of sale.items) {
    const p = d.products.find((x) => x.id === it.productId);
    if (!p) continue;
    p.stock[it.size] = (p.stock[it.size] ?? 0) + it.qty;
    d.movements.unshift({ id: newId(d, "mov"), createdAt, productId: p.id, size: it.size, qty: it.qty, type: "cancelación", note: sale.folio });
  }
  return sale;
}

export function receiveStock(d: PosState, productId: string, size: string, qty: number, note: string) {
  if (!Number.isInteger(qty) || qty <= 0) throw new Error("La cantidad debe ser un número entero mayor a cero.");
  const p = product(d, productId);
  if (!p.sizes.includes(size)) throw new Error("Elige una talla válida.");
  p.stock[size] = (p.stock[size] ?? 0) + qty;
  d.movements.unshift({ id: newId(d, "mov"), createdAt: nowIso(), productId, size, qty, type: "entrada", note: note.trim() || undefined });
  return p;
}

export function updateProduct(d: PosState, productId: string, patch: { name: string; price: number; minStock: number }) {
  const p = product(d, productId);
  if (!patch.name.trim()) throw new Error("El nombre no puede quedar vacío.");
  if (!(patch.price > 0)) throw new Error("El precio debe ser mayor a cero.");
  if (!Number.isInteger(patch.minStock) || patch.minStock < 0) throw new Error("El mínimo debe ser un entero de 0 o más.");
  Object.assign(p, { name: patch.name.trim(), price: round2(patch.price), minStock: patch.minStock });
  return p;
}

export function createProduct(
  d: PosState,
  input: { name: string; sku: string; category: CategoryId; price: number; cost: number; sizes: string[]; minStock: number }
): Product {
  if (!input.name.trim()) throw new Error("Escribe el nombre del producto.");
  const sku = input.sku.trim().toUpperCase();
  if (!sku) throw new Error("Escribe el SKU.");
  if (d.products.some((p) => p.sku === sku)) throw new Error(`Ya existe un producto con el SKU ${sku}.`);
  if (!(input.price > 0)) throw new Error("El precio debe ser mayor a cero.");
  if (input.sizes.length === 0) throw new Error("Agrega al menos una talla (o «Única»).");
  const p: Product = {
    id: newId(d, "prod"),
    sku,
    name: input.name.trim(),
    category: input.category,
    price: round2(input.price),
    cost: round2(input.cost || 0),
    sizes: input.sizes,
    stock: Object.fromEntries(input.sizes.map((s) => [s, 0])),
    minStock: input.minStock,
  };
  d.products.push(p);
  return p;
}

export function createCustomer(d: PosState, input: { name: string; phone: string; email: string; vip: boolean }): Customer {
  if (input.name.trim().length < 3) throw new Error("Escribe el nombre completo del cliente.");
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) throw new Error("El correo no es válido.");
  const c: Customer = {
    id: newId(d, "cli"),
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email.trim(),
    vip: input.vip,
    createdAt: nowIso(),
  };
  d.customers.push(c);
  return c;
}

export function toggleVip(d: PosState, customerId: string) {
  const c = d.customers.find((x) => x.id === customerId);
  if (!c) throw new Error("El cliente no existe.");
  c.vip = !c.vip;
  return c;
}

export function closeShift(d: PosState, countedCash: number, expectedCash: number) {
  const shift = openShift(d);
  if (!shift) throw new Error("No hay un turno abierto.");
  if (Number.isNaN(countedCash) || countedCash < 0) throw new Error("Escribe el efectivo contado en caja.");
  Object.assign(shift, { closedAt: nowIso(), countedCash: round2(countedCash), expectedCash });
  return shift;
}

export function startShift(d: PosState, openingCash: number) {
  if (openShift(d)) throw new Error("Ya hay un turno abierto.");
  if (Number.isNaN(openingCash) || openingCash < 0) throw new Error("Escribe el fondo inicial de caja.");
  const shift = { id: newId(d, "turno"), openedAt: nowIso(), openingCash: round2(openingCash), cashier: d.store.cashier };
  d.shifts.push(shift);
  return shift;
}
