import { createRandom } from "../../shared/random";
import { round2, startOfDay } from "../../shared/format";
import type { Customer, PaymentMethod, PosState, Product, Sale, SaleItem, Shift } from "../types";

/** Sube este número si cambia la forma de los datos: lo guardado con otra versión se descarta. */
export const SEED_VERSION = 1;

const IMG = "/demos/custom/assets/fluxpos";
const CLOTHING = ["CH", "M", "G", "XG"];
const WAIST = ["28", "30", "32", "34", "36"];
const SHOES = ["25", "26", "27", "28", "29"];

/** Catálogo: precio con IVA y existencias actuales por talla (algunas bajas o en cero a propósito). */
const PRODUCTS: Omit<Product, "id">[] = [
  { sku: "TOP-1042", name: "Camisa Oxford Slim", category: "tops", price: 899, cost: 380, image: `${IMG}/img-06.webp`, sizes: CLOTHING, stock: { CH: 6, M: 9, G: 7, XG: 3 }, minStock: 8 },
  { sku: "TOP-1108", name: "T-Shirt Signature", category: "tops", price: 449, cost: 160, image: `${IMG}/img-01.webp`, sizes: CLOTHING, stock: { CH: 12, M: 15, G: 11, XG: 6 }, minStock: 12 },
  { sku: "TOP-1215", name: "Sudadera Heavyweight", category: "tops", price: 1099, cost: 470, sizes: CLOTHING, stock: { CH: 2, M: 3, G: 1, XG: 0 }, minStock: 8 },
  { sku: "TOP-1220", name: "Polo Piqué", category: "tops", price: 649, cost: 260, sizes: CLOTHING, stock: { CH: 5, M: 8, G: 6, XG: 4 }, minStock: 8 },
  { sku: "PAN-2031", name: "Pantalón Denim Raw", category: "pantalones", price: 1299, cost: 540, image: `${IMG}/img-09.webp`, sizes: WAIST, stock: { "28": 3, "30": 6, "32": 7, "34": 5, "36": 2 }, minStock: 10 },
  { sku: "PAN-2044", name: "Chino Slim Arena", category: "pantalones", price: 999, cost: 410, sizes: WAIST, stock: { "28": 4, "30": 5, "32": 6, "34": 4, "36": 3 }, minStock: 10 },
  { sku: "PAN-2052", name: "Bermuda de Lino", category: "pantalones", price: 749, cost: 300, sizes: WAIST, stock: { "28": 0, "30": 1, "32": 2, "34": 1, "36": 0 }, minStock: 6 },
  { sku: "CHA-3007", name: "Blazer Lana Virgen", category: "chamarras", price: 3490, cost: 1620, image: `${IMG}/img-08.webp`, sizes: CLOTHING, stock: { CH: 2, M: 4, G: 3, XG: 1 }, minStock: 4 },
  { sku: "CHA-3015", name: "Chamarra Biker de Piel", category: "chamarras", price: 4290, cost: 2050, image: `${IMG}/img-04.webp`, sizes: CLOTHING, stock: { CH: 1, M: 2, G: 2, XG: 1 }, minStock: 4 },
  { sku: "CAL-4012", name: "Loafers de Piel Café", category: "calzado", price: 2190, cost: 960, image: `${IMG}/img-02.webp`, sizes: SHOES, stock: { "25": 2, "26": 3, "27": 4, "28": 3, "29": 1 }, minStock: 6 },
  { sku: "CAL-4020", name: "Tenis Blancos Minimal", category: "calzado", price: 1890, cost: 820, sizes: SHOES, stock: { "25": 3, "26": 5, "27": 6, "28": 4, "29": 2 }, minStock: 8 },
  { sku: "ACC-5003", name: "Cinturón de Piel", category: "accesorios", price: 649, cost: 240, sizes: ["Única"], stock: { Única: 14 }, minStock: 6 },
  { sku: "ACC-5011", name: "Gorra Bordada", category: "accesorios", price: 399, cost: 130, sizes: ["Única"], stock: { Única: 4 }, minStock: 6 },
  { sku: "ACC-5019", name: "Calcetines (pack de 3)", category: "accesorios", price: 249, cost: 80, sizes: ["Única"], stock: { Única: 22 }, minStock: 10 },
];

const CUSTOMERS: Omit<Customer, "id" | "createdAt">[] = [
  { name: "Mariana Castañeda", phone: "662 214 8831", email: "mariana.castaneda@correo.mx", vip: true },
  { name: "Rodrigo Valenzuela", phone: "662 397 1102", email: "rvalenzuela@correo.mx", vip: false },
  { name: "Fernanda Ibarra", phone: "662 158 4470", email: "fer.ibarra@correo.mx", vip: true },
  { name: "Luis Enrique Morales", phone: "662 301 9925", email: "le.morales@correo.mx", vip: false },
  { name: "Daniela Ruiz Quintero", phone: "662 440 2318", email: "daniela.rq@correo.mx", vip: false },
  { name: "Arturo Gámez", phone: "662 172 6654", email: "arturo.gamez@correo.mx", vip: true },
  { name: "Paola Encinas", phone: "662 258 0193", email: "paola.encinas@correo.mx", vip: false },
  { name: "Jesús Armando Soto", phone: "662 329 7781", email: "jasoto@correo.mx", vip: false },
  { name: "Regina Fimbres", phone: "662 116 5502", email: "regina.fimbres@correo.mx", vip: false },
  { name: "Héctor Duarte", phone: "662 487 3360", email: "hduarte@correo.mx", vip: false },
  { name: "Ximena Robles", phone: "662 203 9147", email: "ximena.robles@correo.mx", vip: true },
  { name: "Carlos Aguayo", phone: "662 365 4028", email: "c.aguayo@correo.mx", vip: false },
];

const OPENING_CASH = 1500;

/**
 * Genera el estado inicial. Las fechas son relativas a «hoy» (unas dos semanas de ventas y el
 * turno de hoy abierto), y el aleatorio usa semilla fija: restablecer da siempre la misma demo.
 */
export function buildSeed(now: Date = new Date()): PosState {
  const rnd = createRandom(20261023);
  let id = 1;
  const nextId = (prefix: string) => `${prefix}-${id++}`;

  const products: Product[] = PRODUCTS.map((p) => ({ ...p, id: nextId("prod") }));
  const customers: Customer[] = CUSTOMERS.map((c, i) => ({
    ...c,
    id: nextId("cli"),
    createdAt: startOfDay(-120 + i * 7, now).toISOString(),
  }));

  const sales: Sale[] = [];
  const shifts: Shift[] = [];
  const DAYS = 14;
  const taxRate = 0.16;
  const vipDiscount = 0.1;

  for (let d = DAYS - 1; d >= 0; d--) {
    const day = startOfDay(-d, now);
    const isToday = d === 0;
    const open = new Date(day);
    open.setHours(10, 0, 0, 0);
    const close = new Date(day);
    close.setHours(20, 30, 0, 0);
    // Hoy: el turno abrió hace unas horas y las ventas llegan hasta «ahora».
    const shiftOpen = isToday ? new Date(Math.min(open.getTime(), now.getTime() - 5 * 3600_000)) : open;
    const lastSale = isToday ? now : close;

    const shift: Shift = { id: nextId("turno"), openedAt: shiftOpen.toISOString(), openingCash: OPENING_CASH, cashier: "Valeria Soto" };
    const weekend = day.getDay() === 0 || day.getDay() === 6;
    const count = isToday ? rnd.int(6, 9) : rnd.int(weekend ? 11 : 7, weekend ? 17 : 12);
    const span = lastSale.getTime() - shiftOpen.getTime();

    const times = Array.from({ length: count }, () => shiftOpen.getTime() + rnd.next() * span).sort((a, b) => a - b);
    let cashIn = 0;

    for (const t of times) {
      const items: SaleItem[] = [];
      const lines = rnd.chance(0.55) ? 1 : rnd.chance(0.7) ? 2 : 3;
      for (let l = 0; l < lines; l++) {
        const p = rnd.pick(products);
        const size = rnd.pick(p.sizes);
        const existing = items.find((it) => it.productId === p.id && it.size === size);
        if (existing) existing.qty += 1;
        else items.push({ productId: p.id, name: p.name, size, qty: rnd.chance(0.85) ? 1 : 2, unitPrice: p.price });
      }
      const customer = rnd.chance(0.4) ? rnd.pick(customers) : null;
      const discountRate = customer?.vip ? vipDiscount : 0;
      const gross = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
      const discount = round2(gross * discountRate);
      const total = round2(gross - discount);
      const method: PaymentMethod = rnd.chance(0.45) ? "efectivo" : rnd.chance(0.82) ? "tarjeta" : "transferencia";
      const cancelled = !isToday && rnd.chance(0.03);

      const sale: Sale = {
        id: nextId("venta"),
        folio: "",
        createdAt: new Date(t).toISOString(),
        items,
        customerId: customer?.id ?? null,
        discountRate,
        discount,
        total,
        tax: round2(total - total / (1 + taxRate)),
        method,
        status: cancelled ? "cancelada" : "pagada",
        shiftId: shift.id,
      };
      if (method === "efectivo") {
        sale.received = Math.ceil(total / 100) * 100;
        sale.change = round2(sale.received - total);
        if (!cancelled) cashIn += total;
      } else {
        sale.reference = `${method === "tarjeta" ? "AUT" : "SPEI"}-${rnd.int(100000, 999999)}`;
      }
      if (cancelled) {
        sale.cancelledAt = new Date(t + 20 * 60_000).toISOString();
        sale.cancelReason = "Cliente cambió de opinión";
      }
      sales.push(sale);
    }

    if (!isToday) {
      const expected = round2(OPENING_CASH + cashIn);
      // De vez en cuando el corte no cuadra por unos pesos, como pasa en la vida real.
      const diff = rnd.chance(0.2) ? rnd.pick([-50, -20, 10, 30]) : 0;
      Object.assign(shift, { closedAt: close.toISOString(), expectedCash: expected, countedCash: expected + diff });
    }
    shifts.push(shift);
  }

  sales.forEach((s, i) => (s.folio = `V-${String(i + 1).padStart(5, "0")}`));

  return {
    version: SEED_VERSION,
    store: {
      name: "Boutique Alameda",
      branch: "Sucursal Centro",
      terminal: "Terminal 04",
      cashier: "Valeria Soto",
      cashierAvatar: `${IMG}/img-05.webp`,
    },
    settings: { taxRate, vipDiscount },
    categories: [
      { id: "tops", name: "Tops" },
      { id: "pantalones", name: "Pantalones" },
      { id: "chamarras", name: "Chamarras" },
      { id: "calzado", name: "Calzado" },
      { id: "accesorios", name: "Accesorios" },
    ],
    products,
    customers,
    sales,
    shifts,
    movements: [],
    nextFolio: sales.length + 1,
    nextId: id,
  };
}
