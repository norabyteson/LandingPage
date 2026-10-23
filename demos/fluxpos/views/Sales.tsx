"use client";

import { useMemo, useState } from "react";
import { Printer, Search } from "lucide-react";
import { dateTime, money, sameDay, startOfDay } from "../../shared/format";
import { cancelSale } from "../actions";
import { METHOD_LABEL } from "../calc";
import { Ticket } from "../components/Ticket";
import { Badge, Button, EmptyState, Field, inputBase, inputClass, Modal, ViewHeader } from "../components/ui";
import { usePos } from "../store";
import type { PaymentMethod, Sale } from "../types";

type Range = "hoy" | "7d" | "todo";

/** Historial de ventas con filtros; el detalle permite reimprimir o cancelar. */
export function Sales() {
  const { state, run } = usePos();
  const [range, setRange] = useState<Range>("hoy");
  const [method, setMethod] = useState<PaymentMethod | "todos">("todos");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState("");

  const names = useMemo(() => new Map(state.customers.map((c) => [c.id, c.name])), [state.customers]);
  const customerName = (id: string | null) => (id && names.get(id)) || "Público en general";

  const rows = useMemo(() => {
    const from = startOfDay(-6).getTime();
    const q = query.trim().toLowerCase();
    const nameOf = (id: string | null) => ((id && names.get(id)) || "Público en general").toLowerCase();
    return [...state.sales]
      .filter((s) => (range === "hoy" ? sameDay(s.createdAt) : range === "7d" ? new Date(s.createdAt).getTime() >= from : true))
      .filter((s) => method === "todos" || s.method === method)
      .filter((s) => !q || s.folio.toLowerCase().includes(q) || nameOf(s.customerId).includes(q))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [state.sales, names, range, method, query]);

  const paid = rows.filter((s) => s.status === "pagada");
  const total = paid.reduce((a, s) => a + s.total, 0);
  const sale: Sale | undefined = state.sales.find((s) => s.id === selected);

  const closeDetail = () => {
    setSelected(null);
    setCancelling(false);
    setReason("");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ViewHeader
        title="Ventas"
        description={`${paid.length} ventas pagadas · ${money(total)} en el periodo`}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg bg-white p-1 shadow-sm ring-1 ring-slate-200" role="group" aria-label="Periodo">
          {([
            ["hoy", "Hoy"],
            ["7d", "7 días"],
            ["todo", "Todo"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={range === id}
              onClick={() => setRange(id)}
              className={`h-8 rounded-md px-3 text-sm font-semibold ${range === id ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <select aria-label="Método de pago" className={`${inputBase} w-auto`} value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod | "todos")}>
          <option value="todos">Todos los métodos</option>
          {(Object.keys(METHOD_LABEL) as PaymentMethod[]).map((m) => (
            <option key={m} value={m}>
              {METHOD_LABEL[m]}
            </option>
          ))}
        </select>
        <div className="relative min-w-56 flex-1">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" aria-hidden />
          <input type="search" aria-label="Buscar venta" placeholder="Folio o cliente…" className={`${inputClass} pl-9`} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Sin ventas en este periodo">Cobra una venta en Caja o cambia el filtro.</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Folio</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Método</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.slice(0, 150).map((s) => (
                  <tr key={s.id} className="cursor-pointer hover:bg-indigo-50/50" onClick={() => setSelected(s.id)}>
                    <td className="px-4 py-3">
                      <button type="button" className="font-mono font-semibold text-indigo-700 hover:underline" onClick={() => setSelected(s.id)}>
                        {s.folio}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{dateTime(s.createdAt)}</td>
                    <td className="px-4 py-3">{customerName(s.customerId)}</td>
                    <td className="px-4 py-3 text-slate-600">{METHOD_LABEL[s.method]}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{money(s.total)}</td>
                    <td className="px-4 py-3">{s.status === "pagada" ? <Badge tone="green">Pagada</Badge> : <Badge tone="red">Cancelada</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 150 && <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">Mostrando las 150 más recientes.</p>}
        </div>
      )}

      {sale && (
        <Modal
          title={`Venta ${sale.folio}`}
          onClose={closeDetail}
          footer={
            cancelling ? (
              <>
                <Button onClick={() => setCancelling(false)}>Volver</Button>
                <Button
                  variant="danger"
                  type="submit"
                  form="cancel-form"
                >
                  Confirmar cancelación
                </Button>
              </>
            ) : (
              <>
                {sale.status === "pagada" && (
                  <Button variant="ghost" className="mr-auto text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => setCancelling(true)}>
                    Cancelar venta
                  </Button>
                )}
                <Button onClick={() => window.print()}>
                  <Printer size={16} /> Reimprimir
                </Button>
                <Button variant="primary" onClick={closeDetail}>
                  Listo
                </Button>
              </>
            )
          }
        >
          {cancelling ? (
            <form
              id="cancel-form"
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const done = run((d) => cancelSale(d, sale.id, reason), `Venta ${sale.folio} cancelada; las prendas regresaron al inventario.`);
                if (done) closeDetail();
              }}
            >
              <p className="text-sm text-slate-600">
                Se cancelará {sale.folio} por {money(sale.total)}. Las prendas regresan al inventario
                {sale.method === "efectivo" ? " y el efectivo sale de la caja." : "."}
              </p>
              <Field label="Motivo">
                <input className={inputClass} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ej. cambio de talla, error de cobro" />
              </Field>
            </form>
          ) : (
            <>
              {sale.status === "cancelada" && sale.cancelReason && (
                <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">
                  Cancelada: {sale.cancelReason}
                </p>
              )}
              <Ticket state={state} sale={sale} />
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
