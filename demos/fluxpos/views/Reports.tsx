"use client";

import { useState } from "react";
import { money, number, shortDay } from "../../shared/format";
import { kpis, METHOD_LABEL, salesByCategory, salesByDay, salesByMethod, salesSince, topProducts } from "../calc";
import { ViewHeader } from "../components/ui";
import { usePos } from "../store";

const PERIODS = [
  { days: 1, label: "Hoy" },
  { days: 7, label: "7 días" },
  { days: 14, label: "14 días" },
] as const;

/** Reportes: indicadores del periodo, ventas por día, por método, por categoría y más vendidos. */
export function Reports() {
  const { state } = usePos();
  const [days, setDays] = useState<number>(7);

  const sales = salesSince(state, days);
  const k = kpis(sales);
  const byDay = salesByDay(state, 14);
  const maxDay = Math.max(...byDay.map((d) => d.total), 1);
  const methods = salesByMethod(sales);
  const categories = salesByCategory(state, sales).sort((a, b) => b.total - a.total);
  const maxCat = Math.max(...categories.map((c) => c.total), 1);
  const top = topProducts(sales);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ViewHeader
        title="Reportes"
        description="Ventas pagadas; las canceladas no cuentan."
        actions={
          <div className="flex rounded-lg bg-white p-1 shadow-sm ring-1 ring-slate-200" role="group" aria-label="Periodo">
            {PERIODS.map((p) => (
              <button
                key={p.days}
                type="button"
                aria-pressed={days === p.days}
                onClick={() => setDays(p.days)}
                className={`h-8 rounded-md px-3 text-sm font-semibold ${days === p.days ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Ventas" value={money(k.total)} />
        <Kpi label="Tickets" value={number(k.count)} />
        <Kpi label="Ticket promedio" value={money(k.average)} />
        <Kpi label="Artículos" value={number(k.items)} />
      </dl>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title="Ventas por día" subtitle="Últimos 14 días">
          <div className="flex h-48 gap-1.5" role="img" aria-label="Gráfica de ventas por día de los últimos 14 días">
            {byDay.map((d, i) => (
              <div key={i} className="group flex flex-1 flex-col items-center gap-1.5">
                <div className="relative flex w-full flex-1 items-end">
                  <div
                    className={`w-full rounded-t-md transition-colors ${i === byDay.length - 1 ? "bg-indigo-600" : "bg-indigo-200 group-hover:bg-indigo-400"}`}
                    style={{ height: `${Math.max(2, (d.total / maxDay) * 100)}%` }}
                    title={`${shortDay(d.day)}: ${money(d.total)}`}
                  />
                </div>
                <span className="text-[10px] text-slate-500">{shortDay(d.day).split(" ")[1]}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Por método de pago">
          <ul className="space-y-4">
            {methods.map((m) => {
              const share = k.total ? m.total / k.total : 0;
              return (
                <li key={m.method}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-semibold text-slate-800">{METHOD_LABEL[m.method]}</span>
                    <span className="tabular-nums text-slate-600">
                      {money(m.total)} · {Math.round(share * 100)} %
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${share * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Más vendidos">
          {top.length === 0 ? (
            <p className="text-sm text-slate-500">Sin ventas en el periodo.</p>
          ) : (
            <ol className="divide-y divide-slate-100">
              {top.map((t, i) => (
                <li key={t.productId} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="flex items-center gap-3">
                    <span className="w-5 text-right font-mono text-slate-400">{i + 1}</span>
                    <span className="font-semibold text-slate-800">{t.name}</span>
                  </span>
                  <span className="text-right tabular-nums">
                    <span className="font-semibold">{t.qty} pzas.</span> <span className="text-slate-500">{money(t.amount)}</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <Panel title="Por categoría">
          <ul className="space-y-3">
            {categories.map((c) => (
              <li key={c.id} className="grid grid-cols-[6rem_minmax(0,1fr)_6rem] items-center gap-3 text-sm">
                <span className="font-semibold text-slate-800">{c.name}</span>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${(c.total / maxCat) * 100}%` }} />
                </div>
                <span className="text-right tabular-nums text-slate-600">{money(c.total)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{value}</dd>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="font-bold text-slate-900">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}
