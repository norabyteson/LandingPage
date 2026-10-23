import type { Metadata } from "next";
import ArquitectosClient from "@/demos/arquitectos/ArquitectosClient";

export const metadata: Metadata = {
  title: "ArquitectOS",
  description: "Gestión de personal y proyectos de un despacho, funcional con datos ficticios: equipo, horas, ausencias y avance.",
};

export default function ArquitectosPage() {
  return <ArquitectosClient />;
}
