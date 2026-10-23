import type { InvoiceStatus } from "../calc";
import type { OrderStatus, PurchaseStatus } from "../types";
import type { Tone } from "./ui";

/** Color de cada estado, igual en todas las vistas. */
export const ORDER_TONE: Record<OrderStatus, Tone> = {
  borrador: "gray",
  confirmado: "blue",
  enviado: "violet",
  facturado: "green",
  cancelado: "red",
};

export const PURCHASE_TONE: Record<PurchaseStatus, Tone> = {
  borrador: "gray",
  enviada: "blue",
  recibida: "green",
  cancelada: "red",
};

export const INVOICE_TONE: Record<InvoiceStatus, Tone> = {
  pagada: "green",
  vencida: "red",
  parcial: "amber",
  pendiente: "blue",
};

export const capitalize = (s: string) => s[0]!.toUpperCase() + s.slice(1);

/** "1 pedido abierto", "3 pedidos abiertos". */
export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Unidad de venta en plural ("5 paquetes", "2 pares"). */
export const units = (n: number, unit: string) => plural(n, unit, unit === "par" ? "pares" : `${unit}s`);
