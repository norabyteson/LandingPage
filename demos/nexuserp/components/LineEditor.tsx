"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { money } from "../../shared/format";
import { totals } from "../calc";
import type { Product } from "../types";
import { units } from "./status";
import { Button, inputBase } from "./ui";

export interface DraftLine {
  productId: string;
  qty: number;
}

/**
 * Editor de partidas para pedidos y órdenes de compra: agrega productos, ajusta cantidades y
 * muestra subtotal, IVA y total. `priceOf` decide si se usa precio de venta o costo.
 */
export function LineEditor({
  products,
  lines,
  onChange,
  priceOf,
  taxRate,
  showStock = false,
}: {
  products: Product[];
  lines: DraftLine[];
  onChange: (lines: DraftLine[]) => void;
  priceOf: (p: Product) => number;
  taxRate: number;
  showStock?: boolean;
}) {
  const [pick, setPick] = useState("");
  const available = products.filter((p) => !lines.some((l) => l.productId === p.id));
  const priced = lines.map((l) => ({ ...l, unitPrice: priceOf(products.find((p) => p.id === l.productId)!) }));
  const t = totals(priced, taxRate);

  return (
    <div>
      <div className="flex gap-2">
        <select aria-label="Producto" className={`${inputBase} min-w-0 flex-1`} value={pick} onChange={(e) => setPick(e.target.value)}>
          <option value="">Agregar producto…</option>
          {available.map((p) => (
            <option key={p.id} value={p.id}>
              {p.sku} · {p.name} · {money(priceOf(p))}
              {showStock ? ` · ${p.stock} disp.` : ""}
            </option>
          ))}
        </select>
        <Button
          disabled={!pick}
          onClick={() => {
            onChange([...lines, { productId: pick, qty: 1 }]);
            setPick("");
          }}
        >
          <Plus size={16} /> Agregar
        </Button>
      </div>

      {lines.length > 0 && (
        <div className="mt-3 overflow-x-auto rounded-lg ring-1 ring-slate-200">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Producto</th>
                <th className="w-24 px-3 py-2 text-right font-semibold">Cantidad</th>
                <th className="px-3 py-2 text-right font-semibold">P. unitario</th>
                <th className="px-3 py-2 text-right font-semibold">Importe</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lines.map((l) => {
                const p = products.find((x) => x.id === l.productId)!;
                const short = showStock && l.qty > p.stock;
                return (
                  <tr key={l.productId}>
                    <td className="px-3 py-2">
                      <span className="block font-medium text-slate-900">{p.name}</span>
                      <span className={`text-xs ${short ? "font-semibold text-rose-600" : "text-slate-500"}`}>
                        {p.sku}
                        {showStock && ` · ${units(p.stock, p.unit)} disponibles`}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        aria-label={`Cantidad de ${p.name}`}
                        type="number"
                        min={1}
                        step={1}
                        className={`${inputBase} h-9 w-20 text-right tabular-nums`}
                        value={l.qty}
                        onChange={(e) => onChange(lines.map((x) => (x === l ? { ...x, qty: Math.max(0, Math.floor(Number(e.target.value) || 0)) } : x)))}
                      />
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-slate-600">{money(priceOf(p))}</td>
                    <td className="px-3 py-2 text-right font-semibold tabular-nums">{money(l.qty * priceOf(p))}</td>
                    <td className="px-1 py-2">
                      <button
                        type="button"
                        aria-label={`Quitar ${p.name}`}
                        onClick={() => onChange(lines.filter((x) => x !== l))}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <dl className="mt-3 ml-auto max-w-xs space-y-1 text-sm">
        <Row label="Subtotal" value={money(t.subtotal)} />
        <Row label={`IVA ${Math.round(taxRate * 100)} %`} value={money(t.tax)} />
        <Row label="Total" value={money(t.total)} strong />
      </dl>
    </div>
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
