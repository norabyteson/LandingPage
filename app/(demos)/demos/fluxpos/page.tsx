import type { Metadata } from "next";
import FluxPosClient from "@/demos/fluxpos/FluxPosClient";

export const metadata: Metadata = {
  title: "FluxPOS",
  description: "Punto de venta funcional con datos ficticios: caja, inventario, clientes, ventas y corte de caja.",
};

export default function FluxPosPage() {
  return <FluxPosClient />;
}
