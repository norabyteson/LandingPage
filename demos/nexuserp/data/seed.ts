import { addDays, dayKey, isWeekend, round2 } from "../../shared/format";
import { createRandom } from "../../shared/random";
import type { Customer, ErpState, Invoice, Line, Payment, Product, PurchaseOrder, SalesOrder, Supplier } from "../types";

/** Sube este número si cambia la forma de los datos: lo guardado con otra versión se descarta. */
export const SEED_VERSION = 1;

const TAX = 0.16;
const WEEKS = 52;

const SUPPLIERS: Omit<Supplier, "id">[] = [
  { name: "Corrugados del Pacífico", rfc: "CPA-120614-HT3", contact: "Rosa Elena Quiroz", email: "ventas@corrupacifico.mx", phone: "644 412 8830", city: "Cd. Obregón, Son.", creditDays: 30 },
  { name: "Seguridad Total MX", rfc: "STM-150302-KL8", contact: "Óscar Villegas", email: "pedidos@seguridadtotal.mx", phone: "81 8356 2241", city: "Monterrey, N.L.", creditDays: 45 },
  { name: "Químicos Industriales del Bajío", rfc: "QIB-090817-RS1", contact: "Liliana Paredes", email: "credito@quimicosbajio.mx", phone: "477 715 9902", city: "León, Gto.", creditDays: 30 },
  { name: "Ferretera Mayorista del Norte", rfc: "FMN-110125-QW5", contact: "Rubén Galaz", email: "mayoreo@ferrenorte.mx", phone: "662 289 4410", city: "Hermosillo, Son.", creditDays: 15 },
  { name: "Papelera Noroeste", rfc: "PNO-170930-ZX2", contact: "Claudia Ríos", email: "atencion@papeleranoroeste.mx", phone: "662 258 7731", city: "Hermosillo, Son.", creditDays: 30 },
];

/** [sku, nombre, categoría, unidad, costo, precio, existencias, mínimo, índice del proveedor] */
const CATALOG: [string, string, Product["category"], string, number, number, number, number, number][] = [
  ["EMP-1001", "Caja corrugada 40×30×30 (paq. 25)", "empaque", "paquete", 310, 465, 180, 60, 0],
  ["EMP-1002", "Película stretch 18 in × 1500 ft", "empaque", "rollo", 168, 249, 240, 80, 0],
  ["EMP-1003", "Cinta canela 48 mm (caja 36)", "empaque", "caja", 520, 749, 42, 30, 0],
  ["EMP-1004", "Tarima de madera 1.20 × 1.00 m", "empaque", "pieza", 145, 229, 18, 40, 0],
  ["EMP-1005", "Fleje de polipropileno 1/2 in", "empaque", "rollo", 410, 615, 64, 20, 0],
  ["SEG-2001", "Guantes de nitrilo (caja 100)", "seguridad", "caja", 128, 199, 310, 100, 1],
  ["SEG-2002", "Casco de seguridad clase E", "seguridad", "pieza", 96, 159, 85, 40, 1],
  ["SEG-2003", "Chaleco reflejante clase 2", "seguridad", "pieza", 64, 109, 120, 50, 1],
  ["SEG-2004", "Lentes de seguridad antiempaño", "seguridad", "pieza", 38, 69, 26, 60, 1],
  ["SEG-2005", "Botas dieléctricas casquillo", "seguridad", "par", 640, 989, 34, 15, 1],
  ["LIM-3001", "Desengrasante industrial 20 L", "limpieza", "garrafa", 455, 690, 48, 20, 2],
  ["LIM-3002", "Jabón líquido para manos 20 L", "limpieza", "garrafa", 290, 449, 55, 20, 2],
  ["LIM-3003", "Toalla interdoblada (caja 2000)", "limpieza", "caja", 340, 519, 12, 30, 2],
  ["FER-4001", "Tornillo hexagonal 3/8 in (caja 100)", "ferreteria", "caja", 185, 289, 140, 40, 3],
  ["FER-4002", "Taquete plástico 1/4 in (bolsa 500)", "ferreteria", "bolsa", 92, 149, 95, 30, 3],
  ["FER-4003", "Broca para concreto 1/2 in", "ferreteria", "pieza", 74, 125, 70, 25, 3],
  ["PAP-5001", "Hoja bond carta (caja 5000)", "papeleria", "caja", 610, 879, 38, 15, 4],
  ["PAP-5002", "Etiqueta térmica 4×6 (rollo 250)", "papeleria", "rollo", 88, 139, 260, 80, 4],
];

const CUSTOMERS: Omit<Customer, "id">[] = [
  { name: "Acero del Norte S.A. de C.V.", rfc: "ANO-980514-JK2", contact: "Ing. Federico Salcido", email: "compras@acerodelnorte.mx", phone: "662 236 1180", city: "Hermosillo, Son.", creditLimit: 350000, creditDays: 30 },
  { name: "Blue Water Logística", rfc: "BWL-160822-PL9", contact: "Andrea Maytorena", email: "andrea.m@bluewaterlog.mx", phone: "622 224 5571", city: "Guaymas, Son.", creditLimit: 220000, creditDays: 30 },
  { name: "Global Reach S.A. de C.V.", rfc: "GRE-140911-MN4", contact: "Lic. Mauricio Tapia", email: "mtapia@globalreach.mx", phone: "662 301 4489", city: "Hermosillo, Son.", creditLimit: 0, creditDays: 30 },
  { name: "Next Ventures", rfc: "NVE-190403-QA7", contact: "Sofía Leyva", email: "sofia@nextventures.mx", phone: "662 410 2236", city: "Hermosillo, Son.", creditLimit: 90000, creditDays: 15 },
  { name: "Maquiladora Sonora Tech", rfc: "MST-070219-BB3", contact: "Ing. Alfonso Durazo", email: "almacen@sonoratech.mx", phone: "631 314 8820", city: "Nogales, Son.", creditLimit: 420000, creditDays: 45 },
  { name: "Constructora Pitic", rfc: "CPI-120707-TT1", contact: "Arq. Mónica Félix", email: "mfelix@constructorapitic.mx", phone: "662 215 9034", city: "Hermosillo, Son.", creditLimit: 260000, creditDays: 30 },
  { name: "Agroexportadora del Valle", rfc: "AVA-050630-YY6", contact: "Héctor Ibarra", email: "hibarra@agrovalle.mx", phone: "644 416 2207", city: "Cd. Obregón, Son.", creditLimit: 300000, creditDays: 45 },
  { name: "Hospital San José", rfc: "HSJ-930115-CC8", contact: "Lic. Gabriela Moreno", email: "adquisiciones@hsanjose.mx", phone: "662 289 1600", city: "Hermosillo, Son.", creditLimit: 180000, creditDays: 30 },
];

const lineTotal = (lines: Line[]) => round2(lines.reduce((a, l) => a + l.qty * l.unitPrice, 0) * (1 + TAX));

/**
 * Genera el estado inicial, relativo a «hoy»: seis meses de pedidos, compras, facturas y pagos.
 * Aleatorio con semilla fija: restablecer da siempre la misma demo.
 */
export function buildSeed(now: Date = new Date()): ErpState {
  const today = dayKey(now);
  const rnd = createRandom(20261023);
  let id = 1;
  const nextId = (p: string) => `${p}-${id++}`;

  const suppliers: Supplier[] = SUPPLIERS.map((s) => ({ ...s, id: nextId("prov") }));
  const products: Product[] = CATALOG.map(([sku, name, category, unit, cost, price, stock, minStock, sup]) => ({
    id: nextId("prod"), sku, name, category, unit, cost, price, stock, minStock, supplierId: suppliers[sup]!.id,
  }));
  const customers: Customer[] = CUSTOMERS.map((c) => ({ ...c, id: nextId("cli") }));

  const orders: SalesOrder[] = [];
  const invoices: Invoice[] = [];
  const payments: Payment[] = [];
  let orderNo = 28320;
  let invNo = 4410;
  const soldQty = new Map<string, number>();

  /* ---- Pedidos de venta y facturas por cobrar ---- */
  const start = addDays(today, -WEEKS * 7);
  for (let day = start; day <= today; day = addDays(day, 1)) {

    if (isWeekend(day)) continue;
    const count = rnd.chance(0.6) ? 1 : rnd.chance(0.5) ? 2 : 0;
    for (let n = 0; n < count; n++) {
      const customer = rnd.pick(customers);
      const lines: Line[] = [];
      const lineCount = rnd.int(2, 5);
      for (let l = 0; l < lineCount; l++) {
        const p = rnd.pick(products);
        if (lines.some((x) => x.productId === p.id)) continue;
        const qty = p.price > 600 ? rnd.int(2, 10) : p.price > 200 ? rnd.int(5, 30) : rnd.int(10, 60);
        lines.push({ productId: p.id, qty, unitPrice: p.price });
        soldQty.set(p.id, (soldQty.get(p.id) ?? 0) + qty);
      }
      const age = (new Date(today).getTime() - new Date(day).getTime()) / 86_400_000;
      const order: SalesOrder = { id: nextId("ped"), folio: `PED-${orderNo++}`, customerId: customer.id, date: day, lines, status: "facturado" };
      if (rnd.chance(0.02) && age > 10) order.status = "cancelado";
      else if (age < 3) order.status = rnd.pick(["borrador", "confirmado", "confirmado", "enviado"] as const);
      else if (age < 8) order.status = rnd.chance(0.5) ? "enviado" : "facturado";
      orders.push(order);

      if (order.status === "facturado") {
        const invDate = addDays(day, rnd.int(1, 3)) > today ? today : addDays(day, rnd.int(1, 3));
        const dueDate = addDays(invDate, customer.creditDays);
        const total = lineTotal(lines);
        const inv: Invoice = { id: nextId("fac"), folio: `FAC-A ${invNo++}`, kind: "cobrar", partyId: customer.id, orderId: order.id, date: invDate, dueDate, total, paid: 0 };
        order.invoiceId = inv.id;
        invoices.push(inv);
        // Cobranza: la mayoría paga cerca del vencimiento; algunos tarde, parcial o nunca.
        const overdueBy = (new Date(today).getTime() - new Date(dueDate).getTime()) / 86_400_000;
        const pay = (amount: number, date: string) => {
          if (date > today) date = today;
          payments.push({ id: nextId("pago"), invoiceId: inv.id, date, amount: round2(amount), method: rnd.chance(0.85) ? "transferencia" : "cheque" });
          inv.paid = round2(inv.paid + amount);
        };
        // Lo muy viejo casi siempre ya se cobró (si no, un año de datos acumula cartera irreal).
        if (overdueBy > 60) {
          if (rnd.chance(0.985)) pay(total, addDays(dueDate, rnd.int(-6, 10)));
        } else if (overdueBy > 12) {
          if (rnd.chance(0.9)) pay(total, addDays(dueDate, rnd.int(-6, 10)));
          else if (rnd.chance(0.6)) pay(round2(total * 0.5), addDays(dueDate, rnd.int(0, 8)));
        } else if (overdueBy > 0 && rnd.chance(0.6)) pay(total, addDays(dueDate, -rnd.int(0, 4)));
        else if (overdueBy > -10 && rnd.chance(0.35)) pay(total, addDays(invDate, rnd.int(10, customer.creditDays)));
      }
    }
  }

  /* ---- Global Reach: facturas recientes sin pagar y cerca de su límite de crédito ---- */
  const gr = customers.find((c) => c.name.startsWith("Global Reach"))!;
  const grOpen = invoices.filter((i) => i.partyId === gr.id && i.date >= addDays(today, -50));
  for (const inv of grOpen) {
    for (const p of payments.filter((x) => x.invoiceId === inv.id)) payments.splice(payments.indexOf(p), 1);
    inv.paid = 0;
  }
  const grBalance = invoices.filter((i) => i.partyId === gr.id).reduce((a, i) => a + i.total - i.paid, 0);
  gr.creditLimit = Math.ceil((grBalance + 25000) / 10000) * 10000;

  /* ---- Compras quincenales por proveedor, según lo vendido, y sus facturas por pagar ---- */
  const purchases: PurchaseOrder[] = [];
  let poNo = 1180;
  for (let w = WEEKS - 1; w >= 0; w -= 2) {
    for (const s of suppliers) {
      const day = addDays(today, -w * 7 - rnd.int(0, 4));
      const lines: Line[] = products
        .filter((p) => p.supplierId === s.id)
        .map((p) => ({ productId: p.id, qty: Math.max(5, Math.round(((soldQty.get(p.id) ?? 0) / WEEKS) * 2 * (0.9 + rnd.next() * 0.3))), unitPrice: p.cost }));
      const po: PurchaseOrder = { id: nextId("oc"), folio: `OC-${poNo++}`, supplierId: s.id, date: day, lines, status: "recibida" };
      const age = (new Date(today).getTime() - new Date(day).getTime()) / 86_400_000;
      if (age < 9) {
        po.status = age < 2 ? "borrador" : "enviada";
      } else {
        po.receivedDate = addDays(day, rnd.int(3, 7));
        const total = lineTotal(lines);
        const bill: Invoice = {
          id: nextId("cxp"), folio: `${s.name.split(" ").map((word) => word[0]).join("").slice(0, 3).toUpperCase()}-${rnd.int(10000, 99999)}`,
          kind: "pagar", partyId: s.id, orderId: po.id, date: po.receivedDate, dueDate: addDays(po.receivedDate, s.creditDays), total, paid: 0,
        };
        po.billId = bill.id;
        invoices.push(bill);
        if (bill.dueDate < today || rnd.chance(0.25)) {
          const date = bill.dueDate > today ? today : addDays(bill.dueDate, -rnd.int(0, 5));
          payments.push({ id: nextId("pago"), invoiceId: bill.id, date, amount: total, method: "transferencia" });
          bill.paid = total;
        }
      }
      purchases.push(po);
    }
  }

  return {
    version: SEED_VERSION,
    company: {
      name: "Nexus Distribuciones del Noroeste",
      rfc: "NDN-150810-AB7",
      city: "Hermosillo, Sonora",
      user: "Juan Pérez",
      userRole: "Administrador",
      userAvatar: "/demos/custom/assets/nexuserp/img-01.webp",
    },
    taxRate: TAX,
    openingBank: 1_480_000,
    categories: [
      { id: "empaque", name: "Empaque" },
      { id: "seguridad", name: "Seguridad industrial" },
      { id: "limpieza", name: "Limpieza" },
      { id: "ferreteria", name: "Ferretería" },
      { id: "papeleria", name: "Papelería" },
    ],
    products,
    customers,
    suppliers,
    orders,
    purchases: purchases.sort((a, b) => a.date.localeCompare(b.date)),
    invoices,
    payments,
    counters: { order: orderNo, purchase: poNo, invoice: invNo, bill: 1 },
    nextId: id,
  };
}
