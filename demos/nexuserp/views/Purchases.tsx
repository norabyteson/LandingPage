"use client";

import { useMemo, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { dayDate, money } from "../../shared/format";
import { cancelPurchase, createPurchase, createSuggestedPurchases, receivePurchase, sendPurchase } from "../actions";
import { lowStock, PURCHASE_LABEL, totals } from "../calc";
import { LineEditor, type DraftLine } from "../components/LineEditor";
import { plural, PURCHASE_TONE } from "../components/status";
import { Badge, Button, ConfirmButton, EmptyState, Field, inputClass, Modal, Segmented, ViewHeader } from "../components/ui";
import { useErp } from "../store";
import type { PurchaseOrder } from "../types";

type Filter = "abiertas" | "recibidas" | "todas";

/** Órdenes de compra: borrador → enviada → recibida (suma inventario y genera la cuenta por pagar). */
export function Purchases() {
  const { state, run } = useErp();
  const [filter, setFilter] = useState<Filter>("abiertas");
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const names = useMemo(() => new Map(state.suppliers.map((s) => [s.id, s.name])), [state.suppliers]);
  const rows = state.purchases
    .filter((p) => (filter === "abiertas" ? p.status === "borrador" || p.status === "enviada" : filter === "recibidas" ? p.status === "recibida" : true))
    .sort((a, b) => b.date.localeCompare(a.date) || b.folio.localeCompare(a.folio));
  const open = state.purchases.find((p) => p.id === openId);
  const low = lowStock(state).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ViewHeader
        title="Compras"
        description={`${plural(state.purchases.filter((p) => p.status === "enviada").length, "orden en camino", "órdenes en camino")} · ${plural(low, "producto", "productos")} bajo el mínimo`}
        actions={
          <>
            <Button
              disabled={low === 0}
              onClick={() =>
                run(
                  (d) => createSuggestedPurchases(d),
                  (list) => `${list.length === 1 ? "Se creó 1 orden sugerida" : `Se crearon ${list.length} órdenes sugeridas`} en borrador.`
                )
              }
            >
              <Sparkles size={16} /> Compras sugeridas
            </Button>
            <Button variant="primary" onClick={() => setCreating(true)}>
              <Plus size={16} /> Nueva orden
            </Button>
          </>
        }
      />

      <div className="mb-4">
        <Segmented
          label="Filtro"
          value={filter}
          onChange={setFilter}
          options={[
            { id: "abiertas", label: "Abiertas" },
            { id: "recibidas", label: "Recibidas" },
            { id: "todas", label: "Todas" },
          ]}
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Sin órdenes en esta vista">Usa «Compras sugeridas» para reponer lo que falta.</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Orden</th>
                  <th className="px-4 py-3">Proveedor</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.slice(0, 120).map((p) => (
                  <tr key={p.id} className="cursor-pointer hover:bg-blue-50/50" onClick={() => setOpenId(p.id)}>
                    <td className="px-4 py-3">
                      <button type="button" className="font-mono font-semibold whitespace-nowrap text-[#0053db] hover:underline">
                        {p.folio}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-800">{names.get(p.supplierId)}</td>
                    <td className="px-4 py-3 text-slate-500">{dayDate(p.date)}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{money(totals(p.lines, state.taxRate).total)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={PURCHASE_TONE[p.status]}>{PURCHASE_LABEL[p.status]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {open && <PurchaseDetail po={open} onClose={() => setOpenId(null)} />}
      {creating && <NewPurchase onClose={() => setCreating(false)} onCreated={(p) => setOpenId(p.id)} />}
    </div>
  );
}

function PurchaseDetail({ po, onClose }: { po: PurchaseOrder; onClose: () => void }) {
  const { state, run } = useErp();
  const [receiving, setReceiving] = useState(false);
  const [supplierInvoice, setSupplierInvoice] = useState("");
  const supplier = state.suppliers.find((s) => s.id === po.supplierId)!;
  const t = totals(po.lines, state.taxRate);
  const bill = state.invoices.find((i) => i.id === po.billId);

  return (
    <Modal
      title={`Orden ${po.folio}`}
      subtitle={`${supplier.name} · ${dayDate(po.date)}`}
      onClose={onClose}
      wide
      footer={
        <>
          {(po.status === "borrador" || po.status === "enviada") && (
            <ConfirmButton label="Cancelar orden" confirmLabel="Sí, cancelar" onConfirm={() => run((d) => cancelPurchase(d, po.id), `Orden ${po.folio} cancelada.`)} />
          )}
          {po.status === "borrador" && (
            <Button variant="primary" onClick={() => run((d) => sendPurchase(d, po.id), `Orden ${po.folio} enviada a ${supplier.name}.`)}>
              Enviar al proveedor
            </Button>
          )}
          {po.status === "enviada" && !receiving && (
            <Button variant="primary" onClick={() => setReceiving(true)}>
              Recibir mercancía
            </Button>
          )}
          {po.status === "enviada" && receiving && (
            <Button
              variant="primary"
              onClick={() => {
                const ok = run((d) => receivePurchase(d, po.id, supplierInvoice), (r) => `Mercancía recibida; la factura ${r.bill.folio} vence el ${dayDate(r.bill.dueDate)}.`);
                if (ok) setReceiving(false);
              }}
            >
              Confirmar recepción
            </Button>
          )}
          {(po.status === "recibida" || po.status === "cancelada") && (
            <Button variant="primary" onClick={onClose}>
              Listo
            </Button>
          )}
        </>
      }
    >
      <div className="mb-4 flex items-center gap-2">
        <Badge tone={PURCHASE_TONE[po.status]}>{PURCHASE_LABEL[po.status]}</Badge>
        {po.receivedDate && <span className="text-sm text-slate-500">Recibida el {dayDate(po.receivedDate)}</span>}
      </div>

      <div className="overflow-x-auto rounded-lg ring-1 ring-slate-200">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Producto</th>
              <th className="px-3 py-2 text-right font-semibold">Cant.</th>
              <th className="px-3 py-2 text-right font-semibold">Costo</th>
              <th className="px-3 py-2 text-right font-semibold">Importe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {po.lines.map((l) => {
              const p = state.products.find((x) => x.id === l.productId);
              return (
                <tr key={l.productId}>
                  <td className="px-3 py-2">
                    <span className="font-medium text-slate-900">{p?.name}</span>
                    <span className="block text-xs text-slate-500">
                      Existencia actual {p?.stock} · mínimo {p?.minStock}
                    </span>
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
        <div className="text-sm">
          {receiving ? (
            <Field label="Folio de la factura del proveedor" hint="Si la dejas vacía, la demo genera uno.">
              <input className={inputClass} value={supplierInvoice} onChange={(e) => setSupplierInvoice(e.target.value)} placeholder="Ej. CDP-48211" />
            </Field>
          ) : bill ? (
            <p className="rounded-lg bg-slate-50 p-3 text-slate-600">
              Factura <span className="font-semibold text-slate-900">{bill.folio}</span> · vence {dayDate(bill.dueDate)} · saldo {money(bill.total - bill.paid)}
            </p>
          ) : (
            <p className="rounded-lg bg-slate-50 p-3 text-slate-600">
              {supplier.contact} · {supplier.email} · crédito {supplier.creditDays} días
            </p>
          )}
        </div>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between text-slate-600">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{money(t.subtotal)}</dd>
          </div>
          <div className="flex justify-between text-slate-600">
            <dt>IVA {Math.round(state.taxRate * 100)} %</dt>
            <dd className="tabular-nums">{money(t.tax)}</dd>
          </div>
          <div className="flex justify-between text-base font-bold text-slate-900">
            <dt>Total</dt>
            <dd className="tabular-nums">{money(t.total)}</dd>
          </div>
        </dl>
      </div>
    </Modal>
  );
}

function NewPurchase({ onClose, onCreated }: { onClose: () => void; onCreated: (p: PurchaseOrder) => void }) {
  const { state, run } = useErp();
  const [supplierId, setSupplierId] = useState(state.suppliers[0]!.id);
  const [lines, setLines] = useState<DraftLine[]>([]);
  const products = state.products.filter((p) => p.supplierId === supplierId);

  return (
    <Modal
      title="Nueva orden de compra"
      onClose={onClose}
      wide
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            variant="primary"
            disabled={lines.length === 0}
            onClick={() => {
              const po = run((d) => createPurchase(d, { supplierId, lines }), (p) => `Orden ${p.folio} creada en borrador.`);
              if (po) {
                onClose();
                onCreated(po);
              }
            }}
          >
            Crear orden
          </Button>
        </>
      }
    >
      <Field label="Proveedor" hint="Solo se muestran los productos que surte este proveedor.">
        <select
          className={inputClass}
          value={supplierId}
          onChange={(e) => {
            setSupplierId(e.target.value);
            setLines([]);
          }}
        >
          {state.suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.creditDays} días de crédito
            </option>
          ))}
        </select>
      </Field>
      <div className="mt-5">
        <LineEditor products={products} lines={lines} onChange={setLines} priceOf={(p) => p.cost} taxRate={state.taxRate} />
      </div>
    </Modal>
  );
}
