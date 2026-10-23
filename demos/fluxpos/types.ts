/** Modelo de datos de FluxPOS (punto de venta de una boutique de ropa). */

export type CategoryId = "tops" | "pantalones" | "chamarras" | "calzado" | "accesorios";
export type PaymentMethod = "efectivo" | "tarjeta" | "transferencia";

export interface Category {
  id: CategoryId;
  name: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: CategoryId;
  /** Precio de venta con IVA incluido. */
  price: number;
  cost: number;
  image?: string;
  /** Tallas en orden de despliegue; «Única» si no aplica. */
  sizes: string[];
  /** Existencias por talla. */
  stock: Record<string, number>;
  /** Por debajo de esto (en total) se marca como «bajo inventario». */
  minStock: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  vip: boolean;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  size: string;
  qty: number;
  /** Precio unitario con IVA al momento de la venta. */
  unitPrice: number;
}

export interface Sale {
  id: string;
  folio: string;
  createdAt: string;
  items: SaleItem[];
  customerId: string | null;
  /** Porcentaje de descuento aplicado (0.1 = 10 %). */
  discountRate: number;
  discount: number;
  /** Total cobrado (con IVA). */
  total: number;
  /** IVA desglosado del total. */
  tax: number;
  method: PaymentMethod;
  received?: number;
  change?: number;
  reference?: string;
  status: "pagada" | "cancelada";
  cancelReason?: string;
  cancelledAt?: string;
  shiftId: string;
}

export interface Shift {
  id: string;
  openedAt: string;
  openingCash: number;
  closedAt?: string;
  /** Efectivo esperado al cerrar (fondo + ventas en efectivo − devoluciones en efectivo). */
  expectedCash?: number;
  countedCash?: number;
  cashier: string;
}

export interface Movement {
  id: string;
  createdAt: string;
  productId: string;
  size: string;
  /** Positivo entra, negativo sale. */
  qty: number;
  type: "venta" | "cancelación" | "entrada" | "ajuste";
  note?: string;
}

export interface PosState {
  version: number;
  store: { name: string; branch: string; terminal: string; cashier: string; cashierAvatar: string };
  settings: { taxRate: number; vipDiscount: number };
  categories: Category[];
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  shifts: Shift[];
  movements: Movement[];
  nextFolio: number;
  nextId: number;
}

/** Línea del carrito antes de cobrar. */
export interface CartLine {
  productId: string;
  size: string;
  qty: number;
}
