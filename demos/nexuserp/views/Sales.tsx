"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { dayDate, money } from "../../shared/format";
import { cancelOrder, confirmOrder, createOrder, invoiceOrder, shipOrder } from "../actions";
import { creditExposure, invoiceStatus, ORDER_LABEL, totals } from "../calc";
import { LineEditor, type DraftLine } from "../components/LineEditor";
import { Badge, Button, ConfirmButton, EmptyState, Field, inputClass, Modal, Segmented, ViewHeader } from "../components/ui";
import { useErp } from "../store";
import type { SalesOrder } from "../types";
import { capitalize, INVOICE_TONE, ORDER_TONE, plural } from "../components/status";

type Filter = "abiertos" | "facturados" | "todos";
const FLOW = ["borrador", "confirmado", "enviado", "facturado"] as const;

/** Pedidos de venta: borrador → confirmado (aparta inventario) → enviado → facturado. */
export function Sales() {
  const { state } = useErp();
  const [filter, setFilter] = useState<Filter>("abiertos");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const names = useMemo(() => new Map(state.customers.map((c) => [c.id, c.name])), [state.customers]);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.orders
      .filter((o) =>
        filter === "abiertos" ? ["borrador", "confirmado", "enviado"].includes(o.status) : filter === "facturados" ? o.status === "facturado" : true
      )
      .filter((o) => !q || o.folio.toLowerCase().includes(q) || (names.get(o.customerId) ?? "").toLowerCase().includes(q))
      .sort((a, b) => b.date.localeCompare(a.date) || b.folio.localeCompare(a.folio));
  }, [state.orders, filter, query, names]);

  const open = state.orders.find((o) => o.id === openId);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ViewHeader
        title="Ventas"
        description={plural(state.orders.filter((o) => ["borrador", "confirmado", "enviado"].includes(o.status)).length, "pedido abierto", "pedidos abiertos")}
        actions={
          <Button variant="primary" onClick={() => setCreating(true)}>
            <Plus size={16} /> Nuevo pedido
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Segmented
          label="Filtro"
          value={filter}
          onChange={setFilter}
          options={[
            { id: "abiertos", label: "Abiertos" },
            { id: "facturados", label: "Facturados" },
            { id: "todos", label: "Todos" },
          ]}
        />
        <div className="relative min-w-56 flex-1">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" aria-hidden />
          <input type="search" aria-label="Buscar pedido" placeholder="Folio o cliente…" className={`${inputClass} pl-9`} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Sin pedidos en esta vista">Crea un pedido nuevo o cambia el filtro.</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Pedido</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.slice(0, 120).map((o) => (
                  <tr key={o.id} className="cursor-pointer hover:bg-blue-50/50" onClick={() => setOpenId(o.id)}>
                    <td className="px-4 py-3">
                      <button type="button" className="font-mono font-semibold whitespace-nowrap text-[#0053db] hover:underline">
                        {o.folio}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-800">{names.get(o.customerId)}</td>
                    <td className="px-4 py-3 text-slate-500">{dayDate(o.date)}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{money(totals(o.lines, state.taxRate).total)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={ORDER_TONE[o.status]}>{ORDER_LABEL[o.status]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {open && <OrderDetail order={open} onClose={() => setOpenId(null)} />}
      {creating && <NewOrder onClose={() => setCreating(false)} onCreated={(o) => setOpenId(o.id)} />}
    </div>
  );
}

function OrderDetail({ order: o, onClose }: { order: SalesOrder; onClose: () => void }) {
  const { state, run } = useErp();
  const customer = state.customers.find((c) => c.id === o.customerId)!;
  const t = totals(o.lines, state.taxRate);
  const exposure = creditExposure(state, customer.id);
  const invoice = state.invoices.find((i) => i.id === o.invoiceId);
  const step = FLOW.indexOf(o.status as (typeof FLOW)[number]);

  return (
    <Modal
      title={`Pedido ${o.folio}`}
      subtitle={`${customer.name} · ${dayDate(o.date)}`}
      onClose={onClose}
      wide
      footer={
        <>
          {!["facturado", "cancelado"].includes(o.status) && (
            <ConfirmButton
              label="Cancelar pedido"
              confirmLabel="Sí, cancelar"
              onConfirm={() => run((d) => cancelOrder(d, o.id), o.status === "borrador" ? `Pedido ${o.folio} cancelado.` : `Pedido ${o.folio} cancelado; la mercancía regresó al inventario.`)}
            />
          )}
          {o.status === "borrador" && (
            <Button variant="primary" onClick={() => run((d) => confirmOrder(d, o.id), `Pedido ${o.folio} confirmado; el inventario quedó apartado.`)}>
              Confirmar
            </Button>
          )}
          {o.status === "confirmado" && (
            <Button variant="primary" onClick={() => run((d) => shipOrder(d, o.id), `Pedido ${o.folio} enviado.`)}>
              Marcar como enviado
            </Button>
          )}
          {(o.status === "confirmado" || o.status === "enviado") && (
            <Button variant={o.status === "enviado" ? "primary" : "secondary"} onClick={() => run((d) => invoiceOrder(d, o.id), (inv) => `Factura ${inv.folio} emitida; vence el ${dayDate(inv.dueDate)}.`)}>
              Facturar
            </Button>
          )}
          {["facturado", "cancelado"].includes(o.status) && (
            <Button variant="primary" onClick={onClose}>
              Listo
            </Button>
          )}
        </>
      }
    >
      {o.status === "cancelado" ? (
        <p className="mb-5 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">Pedido cancelado.</p>
      ) : (
        <ol className="mb-6 grid grid-cols-4 gap-1.5" aria-label="Avance del pedido">
          {FLOW.map((s, i) => (
            <li key={s} aria-current={s === o.status ? "step" : undefined}>
              <div className={`h-1.5 rounded-full ${i <= step ? "bg-[#0053db]" : "bg-slate-200"}`} />
              <p className={`mt-1.5 text-xs ${s === o.status ? "font-semibold text-slate-900" : "text-slate-500"}`}>{ORDER_LABEL[s]}</p>
            </li>
          ))}
        </ol>
      )}

      <div className="overflow-x-auto rounded-lg ring-1 ring-slate-200">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Producto</th>
              <th className="px-3 py-2 text-right font-semibold">Cant.</th>
              <th className="px-3 py-2 text-right font-semibold">P. unitario</th>
              <th className="px-3 py-2 text-right font-semibold">Importe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {o.lines.map((l) => {
              const p = state.products.find((x) => x.id === l.productId);
              return (
                <tr key={l.productId}>
                  <td className="px-3 py-2">
                    <span className="font-medium text-slate-900">{p?.name}</span>
                    {o.status === "borrador" && p && l.qty > p.stock && <span className="ml-2 text-xs font-semibold text-rose-600">solo hay {p.stock}</span>}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{l.qty}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-600">{money(l.unitPrice)}</td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">{money(l.qty * l.unitPrice)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-3 text-sm">
          {invoice ? (
            <>
              <p className="font-semibold text-slate-900">Factura {invoice.folio}</p>
              <p className="text-slate-600">
                Vence {dayDate(invoice.dueDate)} · saldo {money(invoice.total - invoice.paid)}
              </p>
              <p className="mt-1">
                <Badge tone={INVOICE_TONE[invoiceStatus(invoice)]}>{capitalize(invoiceStatus(invoice))}</Badge>
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-slate-900">Crédito de {customer.name}</p>
              <p className="text-slate-600">
                Usado {money(exposure.total)} de {money(customer.creditLimit)} · {customer.creditDays} días
              </p>
            </>
          )}
        </div>
        <dl className="space-y-1 text-sm">
          <Row label="Subtotal" value={money(t.subtotal)} />
          <Row label={`IVA ${Math.round(state.taxRate * 100)} %`} value={money(t.tax)} />
          <Row label="Total" value={money(t.total)} strong />
        </dl>
      </div>
      {o.note && <p className="mt-4 text-sm text-slate-600">Nota: {o.note}</p>}
    </Modal>
  );
}

function NewOrder({ onClose, onCreated }: { onClose: () => void; onCreated: (o: SalesOrder) => void }) {
  const { state, run } = useErp();
  const [customerId, setCustomerId] = useState(state.customers[0]!.id);
  const [lines, setLines] = useState<DraftLine[]>([]);
  const [note, setNote] = useState("");
  const customer = state.customers.find((c) => c.id === customerId)!;
  const exposure = creditExposure(state, customerId);
  const available = Math.max(0, customer.creditLimit - exposure.total);

  const save = (confirm: boolean) => {
    const created = run((d) => {
      const o = createOrder(d, { customerId, lines, note });
      if (confirm) confirmOrder(d, o.id);
      return o;
    }, (o) => (confirm ? `Pedido ${o.folio} creado y confirmado.` : `Pedido ${o.folio} guardado como borrador.`));
    if (created) {
      onClose();
      onCreated(created);
    }
  };

  return (
    <Modal
      title="Nuevo pedido"
      onClose={onClose}
      wide
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button disabled={lines.length === 0} onClick={() => save(false)}>
            Guardar borrador
          </Button>
          <Button variant="primary" disabled={lines.length === 0} onClick={() => save(true)}>
            Guardar y confirmar
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Field label="Cliente">
          <select className={inputClass} value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            {state.customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <div className={`rounded-lg px-3 py-2 text-sm ${available < 20000 ? "bg-amber-50 text-amber-900" : "bg-slate-50 text-slate-600"}`}>
          <p className="font-semibold">Crédito disponible: {money(available)}</p>
          <p>
            Límite {money(customer.creditLimit)} · {customer.creditDays} días · debe {money(exposure.total)}
          </p>
        </div>
      </div>
      <div className="mt-5">
        <LineEditor products={state.products} lines={lines} onChange={setLines} priceOf={(p) => p.price} taxRate={state.taxRate} showStock />
      </div>
      <div className="mt-4">
        <Field label="Nota (opcional)">
          <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej. Entregar en andén 3" />
        </Field>
      </div>
    </Modal>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "text-base font-bold text-slate-900" : "text-slate-600"}`}>
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
