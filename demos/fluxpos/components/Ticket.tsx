"use client";

import { dateTime, money, round2 } from "../../shared/format";
import { METHOD_LABEL } from "../calc";
import type { PosState, Sale } from "../types";

/** Ticket de venta. `data-print-area`: al imprimir solo sale esto (ver app/(demos)/demos.css). */
export function Ticket({ state, sale }: { state: PosState; sale: Sale }) {
  const customer = state.customers.find((c) => c.id === sale.customerId);
  const gross = round2(sale.items.reduce((a, it) => a + it.qty * it.unitPrice, 0));

  return (
    <div data-print-area className="mx-auto w-full max-w-[320px] rounded-xl bg-white p-5 font-mono text-[13px] leading-relaxed text-slate-800 ring-1 ring-slate-200">
      <div className="text-center">
        <p className="text-base font-bold tracking-wide">{state.store.name.toUpperCase()}</p>
        <p>{state.store.branch} · {state.store.terminal}</p>
        <p className="text-slate-500">RFC BAL-190312-K42</p>
      </div>
      <div className="my-3 border-t border-dashed border-slate-300" />
      <p>Folio: {sale.folio}</p>
      <p>{dateTime(sale.createdAt)}</p>
      <p>Atendió: {state.store.cashier}</p>
      {customer && <p>Cliente: {customer.name}{customer.vip ? " (VIP)" : ""}</p>}
      <div className="my-3 border-t border-dashed border-slate-300" />
      <ul className="space-y-1.5">
        {sale.items.map((it) => (
          <li key={`${it.productId}-${it.size}`}>
            <div className="flex justify-between gap-2">
              <span className="truncate">{it.name}</span>
              <span>{money(it.qty * it.unitPrice)}</span>
            </div>
            <div className="text-slate-500">
              {it.qty} × {money(it.unitPrice)} · Talla {it.size}
            </div>
          </li>
        ))}
      </ul>
      <div className="my-3 border-t border-dashed border-slate-300" />
      <Row label="Importe" value={money(gross)} />
      {sale.discount > 0 && <Row label={`Descuento VIP ${Math.round(sale.discountRate * 100)} %`} value={`−${money(sale.discount)}`} />}
      <Row label="Subtotal sin IVA" value={money(round2(sale.total - sale.tax))} />
      <Row label={`IVA ${Math.round(state.settings.taxRate * 100)} %`} value={money(sale.tax)} />
      <Row label="TOTAL" value={money(sale.total)} strong />
      <div className="my-3 border-t border-dashed border-slate-300" />
      <Row label={METHOD_LABEL[sale.method]} value={money(sale.received ?? sale.total)} />
      {sale.change !== undefined && <Row label="Cambio" value={money(sale.change)} />}
      {sale.reference && <Row label="Referencia" value={sale.reference} />}
      {sale.status === "cancelada" && (
        <p className="mt-3 rounded bg-rose-50 px-2 py-1 text-center font-bold text-rose-700">VENTA CANCELADA</p>
      )}
      <p className="mt-4 text-center text-slate-500">¡Gracias por tu compra!</p>
      <p className="text-center text-[11px] text-slate-400">Demo con datos ficticios · FluxPOS por NORABYTE</p>
    </div>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-2 ${strong ? "text-base font-bold" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
