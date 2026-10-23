/** Modelo de datos de NexusERP (ERP de una distribuidora B2B de insumos industriales). */

export type CategoryId = "empaque" | "seguridad" | "limpieza" | "ferreteria" | "papeleria";

export interface Category {
  id: CategoryId;
  name: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: CategoryId;
  unit: string;
  /** Costo de compra sin IVA. */
  cost: number;
  /** Precio de venta sin IVA. */
  price: number;
  stock: number;
  minStock: number;
  supplierId: string;
}

export interface Customer {
  id: string;
  name: string;
  rfc: string;
  contact: string;
  email: string;
  phone: string;
  city: string;
  creditLimit: number;
  /** Días de crédito para pagar sus facturas. */
  creditDays: number;
}

export interface Supplier {
  id: string;
  name: string;
  rfc: string;
  contact: string;
  email: string;
  phone: string;
  city: string;
  creditDays: number;
}

export interface Line {
  productId: string;
  qty: number;
  /** Precio unitario sin IVA (venta) o costo unitario (compra). */
  unitPrice: number;
}

export type OrderStatus = "borrador" | "confirmado" | "enviado" | "facturado" | "cancelado";

export interface SalesOrder {
  id: string;
  folio: string;
  customerId: string;
  date: string;
  lines: Line[];
  status: OrderStatus;
  invoiceId?: string;
  note?: string;
}

export type PurchaseStatus = "borrador" | "enviada" | "recibida" | "cancelada";

export interface PurchaseOrder {
  id: string;
  folio: string;
  supplierId: string;
  date: string;
  lines: Line[];
  status: PurchaseStatus;
  receivedDate?: string;
  billId?: string;
}

/** Documento por cobrar (factura a cliente) o por pagar (factura de proveedor). */
export interface Invoice {
  id: string;
  folio: string;
  kind: "cobrar" | "pagar";
  partyId: string;
  orderId: string;
  date: string;
  dueDate: string;
  /** Total con IVA. */
  total: number;
  paid: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  date: string;
  amount: number;
  method: "transferencia" | "cheque" | "efectivo";
}

export interface ErpState {
  version: number;
  company: { name: string; rfc: string; city: string; user: string; userRole: string; userAvatar: string };
  taxRate: number;
  /** Saldo del banco al inicio del periodo de datos; el actual se calcula con los pagos. */
  openingBank: number;
  categories: Category[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  orders: SalesOrder[];
  purchases: PurchaseOrder[];
  invoices: Invoice[];
  payments: Payment[];
  counters: { order: number; purchase: number; invoice: number; bill: number };
  nextId: number;
}
