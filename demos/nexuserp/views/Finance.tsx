"use client";

import { useState } from "react";
import { dayDate, money } from "../../shared/format";
import { registerPayment } from "../actions";
import { aging, balance, bankBalance, daysBetween, invoiceStatus, money0, payables, receivables, todayKey } from "../calc";
import { capitalize, INVOICE_TONE } from "../components/status";
import { Badge, Button, EmptyState, Field, inputClass, Kpi, Modal, Panel, Segmented, ViewHeader } from "../components/ui";
import { useErp } from "../store";
import type { Invoice, Payment } from "../types";

type Tab = "cobrar" | "pagar" | "movimientos";

/** Cuentas por cobrar y por pagar con antigüedad de saldos, cobros, pagos y movimientos de banco. */
export function Finance() {
  const { state } = useErp();
  const [tab, setTab] = useState<Tab>("cobrar");
  const [paying, setPaying] = useState<Invoice | null>(null);
  const today = todayKey();

  const list = (tab === "cobrar" ? receivables(state) : payables(state)).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const buckets = aging(list, today);
  const partyName = (inv: Invoice) =>
    (inv.kind === "cobrar" ? state.customers : state.suppliers).find((p) => p.id === inv.partyId)?.name ?? "";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ViewHeader
        title="Finanzas"
        description={`Saldo en banco ${money(bankBalance(state))}`}
        actions={
          <Segmented
            label="Sección"
            value={tab}
            onChange={setTab}
            options={[
              { id: "cobrar", label: "Por cobrar" },
              { id: "pagar", label: "Por pagar" },
              { id: "movimientos", label: "Movimientos" },
            ]}
          />
        }
      />

      {tab === "movimientos" ? (
        <Movements />
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label="Al corriente" value={money0.format(buckets.corriente)} />
            <Kpi label="Vencido 1 a 30 días" value={money0.format(buckets.d30)} tone={buckets.d30 ? "amber" : undefined} note={buckets.d30 ? "Dar seguimiento" : undefined} />
            <Kpi label="Vencido 31 a 60 días" value={money0.format(buckets.d60)} tone={buckets.d60 ? "red" : undefined} note={buckets.d60 ? "Prioridad" : undefined} />
            <Kpi label="Más de 60 días" value={money0.format(buckets.d90)} tone={buckets.d90 ? "red" : undefined} note={buckets.d90 ? "Riesgo de incobrable" : undefined} />
          </dl>

          <Panel title={tab === "cobrar" ? "Facturas por cobrar" : "Facturas por pagar"} className="mt-6">
            {list.length === 0 ? (
              <EmptyState title="Todo al día">No hay facturas abiertas.</EmptyState>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="text-xs font-semibold text-slate-500 uppercase">
                    <tr className="border-b border-slate-200">
                      <th className="py-2.5 pr-3">Factura</th>
                      <th className="py-2.5 pr-3">{tab === "cobrar" ? "Cliente" : "Proveedor"}</th>
                      <th className="py-2.5 pr-3">Vence</th>
                      <th className="py-2.5 pr-3 text-right">Total</th>
                      <th className="py-2.5 pr-3 text-right">Saldo</th>
                      <th className="py-2.5 pr-3">Estado</th>
                      <th className="py-2.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {list.map((inv) => {
                      const status = invoiceStatus(inv, today);
                      const late = daysBetween(inv.dueDate, today);
                      return (
                        <tr key={inv.id}>
                          <td className="py-2.5 pr-3 font-mono font-semibold whitespace-nowrap text-slate-900">{inv.folio}</td>
                          <td className="py-2.5 pr-3 text-slate-800">{partyName(inv)}</td>
                          <td className="py-2.5 pr-3">
                            <span className="block text-slate-700">{dayDate(inv.dueDate)}</span>
                            <span className={`text-xs ${late > 0 ? "font-semibold text-rose-600" : "text-slate-500"}`}>
                              {late > 0 ? `${late} ${late === 1 ? "día" : "días"} de atraso` : late === 0 ? "Vence hoy" : late === -1 ? "Vence mañana" : `En ${-late} días`}
                            </span>
                          </td>
                          <td className="py-2.5 pr-3 text-right tabular-nums text-slate-600">{money(inv.total)}</td>
                          <td className="py-2.5 pr-3 text-right font-semibold tabular-nums">{money(balance(inv))}</td>
                          <td className="py-2.5 pr-3">
                            <Badge tone={INVOICE_TONE[status]}>{capitalize(status)}</Badge>
                          </td>
                          <td className="py-2.5 text-right">
                            <Button size="sm" variant={late > 0 ? "primary" : "secondary"} onClick={() => setPaying(inv)}>
                              {tab === "cobrar" ? "Registrar cobro" : "Pagar"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </>
      )}

      {paying && <PaymentModal invoice={paying} partyName={partyName(paying)} onClose={() => setPaying(null)} />}
    </div>
  );
}

function PaymentModal({ invoice, partyName, onClose }: { invoice: Invoice; partyName: string; onClose: () => void }) {
  const { state, run } = useErp();
  const due = balance(invoice);
  const [amount, setAmount] = useState(String(due));
  const [method, setMethod] = useState<Payment["method"]>("transferencia");
  const isPay = invoice.kind === "pagar";

  return (
    <Modal
      title={isPay ? `Pagar ${invoice.folio}` : `Cobro de ${invoice.folio}`}
      subtitle={`${partyName} · saldo ${money(due)}`}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="payment-form">
            {isPay ? "Registrar pago" : "Registrar cobro"}
          </Button>
        </>
      }
    >
      <form
        id="payment-form"
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const ok = run(
            (d) => registerPayment(d, invoice.id, Number(amount), method),
            (inv) => (balance(inv) <= 0.005 ? `${inv.folio} quedó liquidada.` : `Abono aplicado; saldo pendiente ${money(balance(inv))}.`)
          );
          if (ok) onClose();
        }}
      >
        <Field label="Monto" hint={isPay ? `Saldo en banco: ${money(bankBalance(state))}` : "Puede ser un abono parcial."}>
          <input className={`${inputClass} h-12 text-lg font-semibold`} type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setAmount(String(due))}>
            Total {money(due)}
          </Button>
          <Button size="sm" onClick={() => setAmount(String(Math.round((due / 2) * 100) / 100))}>
            Mitad
          </Button>
        </div>
        <Field label="Método">
          <select className={inputClass} value={method} onChange={(e) => setMethod(e.target.value as Payment["method"])}>
            <option value="transferencia">Transferencia</option>
            <option value="cheque">Cheque</option>
            <option value="efectivo">Efectivo</option>
          </select>
        </Field>
      </form>
    </Modal>
  );
}

function Movements() {
  const { state } = useErp();
  const rows = [...state.payments].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, 40);
  return (
    <Panel title="Movimientos de banco" action={<span className="text-sm font-semibold tabular-nums">{money(bankBalance(state))}</span>}>
      <ul className="divide-y divide-slate-100 text-sm">
        {rows.map((p) => {
          const inv = state.invoices.find((i) => i.id === p.invoiceId)!;
          const out = inv.kind === "pagar";
          const party = (out ? state.suppliers : state.customers).find((x) => x.id === inv.partyId)?.name;
          return (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <span>
                <span className="font-semibold text-slate-900">{out ? "Pago a" : "Cobro de"} {party}</span>
                <span className="block text-xs text-slate-500">
                  {inv.folio} · {capitalize(p.method)} · {dayDate(p.date)}
                </span>
              </span>
              <span className={`font-semibold tabular-nums ${out ? "text-slate-700" : "text-emerald-700"}`}>
                {out ? "−" : "+"}
                {money(p.amount)}
              </span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
