import type { Metadata } from "next";
import NexusClient from "@/demos/nexuserp/NexusClient";

export const metadata: Metadata = {
  title: "NexusERP",
  description: "ERP funcional con datos ficticios: ventas con crédito, compras, inventario, cuentas por cobrar y por pagar.",
};

export default function NexusErpPage() {
  return <NexusClient />;
}
