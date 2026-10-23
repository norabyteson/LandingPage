"use client";

import { useState } from "react";
import { Lock, LockOpen } from "lucide-react";
import { date, dateTime, money, round2, time } from "../../shared/format";
import { closeShift, startShift } from "../actions";
import { openShift, shiftSummary } from "../calc";
import { Badge, Button, Field, inputClass, Modal, ViewHeader } from "../components/ui";
import { usePos } from "../store";

/** Corte de caja: resumen del turno, conteo de efectivo con diferencia y apertura del siguiente. */
export function CashClose() {
  const { state, run } = usePos();
  const shift = openShift(state);
  const [counted, setCounted] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [opening, setOpening] = useState("1500");

  const summary = shift ? shiftSummary(state, shift) : null;
  const countedNum = counted === "" ? NaN : Number(counted);
  const diff = summary ? round2(countedNum - summary.expectedCash) : NaN;

  const history = state.shifts
    .filter((s) => s.closedAt)
    .sort((a, b) => b.openedAt.localeCompare(a.openedAt))
    .slice(0, 10);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ViewHeader title="Corte de caja" description={`${state.store.branch} · ${state.store.terminal} · ${state.store.cashier}`} />

      {shift && summary ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Turno abierto</h2>
              <Badge tone="green">Desde las {time(shift.openedAt)}</Badge>
            </div>
            <dl className="mt-4 divide-y divide-slate-100 text-sm">
              <Line label="Fondo inicial" value={money(shift.openingCash)} />
              <Line label="Ventas en efectivo" value={money(summary.cash)} />
              <Line label="Ventas con tarjeta" value={money(summary.card)} />
              <Line label="Transferencias" value={money(summary.transfer)} />
              <Line label={`Ventas pagadas (${summary.paidCount})`} value={money(summary.total)} strong />
              {summary.cancelledCount > 0 && <Line label="Canceladas en el turno" value={String(summary.cancelledCount)} />}
            </dl>
          </section>

          <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="font-bold text-slate-900">Contar efectivo</h2>
            <p className="mt-1 text-sm text-slate-500">Debe haber en caja el fondo más las ventas en efectivo.</p>
            <div className="mt-4 flex items-baseline justify-between rounded-lg bg-slate-50 px-4 py-3">
              <span className="text-sm font-semibold text-slate-600">Esperado en caja</span>
              <span className="text-xl font-bold tabular-nums">{money(summary.expectedCash)}</span>
            </div>
            <div className="mt-4">
              <Field label="Efectivo contado">
                <input
                  className={`${inputClass} h-12 text-lg font-semibold`}
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={counted}
                  onChange={(e) => setCounted(e.target.value)}
                />
              </Field>
            </div>
            {!Number.isNaN(diff) && (
              <p
                aria-live="polite"
                className={`mt-3 rounded-lg px-4 py-3 text-sm font-semibold ${
                  diff === 0 ? "bg-emerald-50 text-emerald-800" : diff > 0 ? "bg-amber-50 text-amber-900" : "bg-rose-50 text-rose-800"
                }`}
              >
                {diff === 0 ? "La caja cuadra." : diff > 0 ? `Sobran ${money(diff)}.` : `Faltan ${money(-diff)}.`}
              </p>
            )}
            <Button variant="primary" size="lg" className="mt-4 w-full" disabled={Number.isNaN(countedNum)} onClick={() => setConfirming(true)}>
              <Lock size={18} /> Cerrar turno
            </Button>
          </section>
        </div>
      ) : (
        <section className="max-w-md rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="font-bold text-slate-900">No hay turno abierto</h2>
          <p className="mt-1 text-sm text-slate-500">Abre un turno con el fondo de caja para empezar a cobrar.</p>
          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              run((d) => startShift(d, Number(opening)), "Turno abierto. Ya puedes cobrar en Caja.");
            }}
          >
            <Field label="Fondo inicial">
              <input className={inputClass} type="number" min={0} step="0.01" value={opening} onChange={(e) => setOpening(e.target.value)} />
            </Field>
            <Button variant="primary" type="submit" className="w-full">
              <LockOpen size={16} /> Abrir turno
            </Button>
          </form>
        </section>
      )}

      <section className="mt-10" aria-labelledby="history-title">
        <h2 id="history-title" className="mb-3 text-lg font-bold text-slate-900">
          Cortes anteriores
        </h2>
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3">Día</th>
                <th className="px-4 py-3 text-right">Ventas</th>
                <th className="px-4 py-3 text-right">Esperado</th>
                <th className="px-4 py-3 text-right">Contado</th>
                <th className="px-4 py-3 text-right">Diferencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((s) => {
                const d = round2((s.countedCash ?? 0) - (s.expectedCash ?? 0));
                return (
                  <tr key={s.id}>
                    <td className="px-4 py-3">{date(s.openedAt)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{money(shiftSummary(state, s).total)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{money(s.expectedCash ?? 0)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{money(s.countedCash ?? 0)}</td>
                    <td className={`px-4 py-3 text-right font-semibold tabular-nums ${d === 0 ? "text-emerald-700" : d > 0 ? "text-amber-700" : "text-rose-700"}`}>
                      {d === 0 ? "Cuadra" : `${d > 0 ? "+" : "−"}${money(Math.abs(d))}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {confirming && summary && (
        <Modal
          title="¿Cerrar el turno?"
          onClose={() => setConfirming(false)}
          footer={
            <>
              <Button onClick={() => setConfirming(false)}>Volver</Button>
              <Button
                variant="primary"
                onClick={() => {
                  const ok = run((d) => closeShift(d, countedNum, summary.expectedCash), "Corte registrado. Abre un turno nuevo para seguir cobrando.");
                  if (ok) {
                    setConfirming(false);
                    setCounted("");
                  }
                }}
              >
                Cerrar turno
              </Button>
            </>
          }
        >
          <p className="text-sm text-slate-600">
            Se registrará el corte del {dateTime(new Date().toISOString())} con {money(countedNum)} contados (esperado {money(summary.expectedCash)}). Después no
            se pueden cancelar ventas de este turno.
          </p>
        </Modal>
      )}
    </div>
  );
}

function Line({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between py-2.5 ${strong ? "font-bold text-slate-900" : "text-slate-700"}`}>
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
