"use client";

import { AlertTriangle, PackageX } from "lucide-react";
import { addDays, dayDate, money } from "../../shared/format";
import {
  aging,
  bankBalance,
  balance,
  lowStock,
  money0,
  monthlySales,
  monthToDate,
  ORDER_LABEL,
  payables,
  receivables,
  salesByCategory,
  todayKey,
  totals,
} from "../calc";
import { ORDER_TONE } from "../components/status";
import { Badge, Button, Kpi, Panel, ViewHeader } from "../components/ui";
import { useErp } from "../store";
import type { View } from "../NexusApp";

/** Panel general: indicadores, alertas, ventas por mes y por categoría, pedidos recientes. */
export function Dashboard({ onGoTo }: { onGoTo: (v: View) => void }) {
  const { state } = useErp();
  const today = todayKey();
  const months = monthlySales(state, 12, today);
  const mtd = monthToDate(state, today);
  const ar = receivables(state);
  const ap = payables(state);
  const arAging = aging(ar, today);
  const overdue = arAging.d30 + arAging.d60 + arAging.d90;
  const apWeek = ap.filter((i) => i.dueDate <= addDays(today, 7)).reduce((a, i) => a + balance(i), 0);
  const nextDue = ap.map((i) => i.dueDate).sort()[0];
  const low = lowStock(state);
  const maxMonth = Math.max(...months.map((m) => m.total), 1);
  const cats = salesByCategory(state, 90, today);
  const catTotal = cats.reduce((a, c) => a + c.total, 0) || 1;
  const recent = [...state.orders].sort((a, b) => b.date.localeCompare(a.date) || b.folio.localeCompare(a.folio)).slice(0, 7);
  const customer = (id: string) => state.customers.find((c) => c.id === id)?.name ?? "";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ViewHeader title="Panel" description={`${state.company.name} · ${dayDate(today)}`} />

      <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi label="Ventas del mes" value={money0.format(mtd.current)} note={`${mtd.change >= 0 ? "+" : ""}${mtd.change} % contra el mes anterior al mismo día`} />
        <Kpi label="Por cobrar" value={money0.format(ar.reduce((a, i) => a + balance(i), 0))} note={`${money0.format(overdue)} vencido`} tone={overdue > 0 ? "red" : undefined} />
        <Kpi label="Por pagar" value={money0.format(ap.reduce((a, i) => a + balance(i), 0))} note={apWeek > 0 || !nextDue ? `${money0.format(apWeek)} vence esta semana` : `Próximo vencimiento: ${dayDate(nextDue)}`} tone={apWeek > 0 ? "amber" : undefined} />
        <Kpi label="Saldo en banco" value={money0.format(bankBalance(state))} note="Cuenta BBVA ···4410" />
      </dl>

      {(overdue > 0 || low.length > 0) && (
        <ul className="mt-6 space-y-2" aria-label="Alertas">
          {overdue > 0 && (
            <li className="flex items-start gap-3 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-rose-200">
              <AlertTriangle size={18} className="mt-px shrink-0" aria-hidden />
              <span>
                Hay {money(overdue)} en facturas vencidas.{" "}
                <button type="button" className="font-semibold underline" onClick={() => onGoTo("finanzas")}>
                  Ver cobranza
                </button>
              </span>
            </li>
          )}
          {low.length > 0 && (
            <li className="flex items-start gap-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
              <PackageX size={18} className="mt-px shrink-0" aria-hidden />
              <span>
                {low.length} {low.length === 1 ? "producto está" : "productos están"} por debajo del mínimo.{" "}
                <button type="button" className="font-semibold underline" onClick={() => onGoTo("inventario")}>
                  Ver inventario
                </button>
              </span>
            </li>
          )}
        </ul>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title="Ventas mensuales" action={<span className="text-xs text-slate-500">Facturado sin IVA, últimos 12 meses</span>}>
          <div className="flex h-52 gap-2" role="img" aria-label="Gráfica de ventas facturadas de los últimos 12 meses">
            {months.map((m, i) => (
              <div key={i} className="group flex flex-1 flex-col items-center gap-1.5">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className={`w-full rounded-t-md ${m.current ? "bg-[#0053db]" : "bg-blue-200 group-hover:bg-blue-300"}`}
                    style={{ height: `${Math.max(2, (m.total / maxMonth) * 100)}%` }}
                    title={`${m.label}: ${money0.format(m.total)}`}
                  />
                </div>
                <span className="text-[11px] text-slate-500 capitalize">{m.label.replace(".", "")}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Ventas por categoría" action={<span className="text-xs text-slate-500">Últimos 90 días</span>}>
          <ul className="space-y-3.5">
            {cats.map((c) => (
              <li key={c.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-semibold text-slate-800">{c.name}</span>
                  <span className="tabular-nums text-slate-500">
                    {money0.format(c.total)} · {Math.round((c.total / catTotal) * 100)} %
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-[#0053db]" style={{ width: `${(c.total / catTotal) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel
        title="Pedidos recientes"
        className="mt-6"
        action={
          <Button size="sm" variant="ghost" onClick={() => onGoTo("ventas")}>
            Ver todos
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="text-xs font-semibold text-slate-500 uppercase">
              <tr className="border-b border-slate-200">
                <th className="py-2.5 pr-3">Pedido</th>
                <th className="py-2.5 pr-3">Cliente</th>
                <th className="py-2.5 pr-3">Fecha</th>
                <th className="py-2.5 pr-3 text-right">Total</th>
                <th className="py-2.5">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent.map((o) => (
                <tr key={o.id}>
                  <td className="py-2.5 pr-3 font-mono font-semibold whitespace-nowrap text-[#0053db]">{o.folio}</td>
                  <td className="py-2.5 pr-3 text-slate-800">{customer(o.customerId)}</td>
                  <td className="py-2.5 pr-3 text-slate-500">{dayDate(o.date)}</td>
                  <td className="py-2.5 pr-3 text-right font-semibold tabular-nums">{money(totals(o.lines, state.taxRate).total)}</td>
                  <td className="py-2.5">
                    <Badge tone={ORDER_TONE[o.status]}>{ORDER_LABEL[o.status]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
