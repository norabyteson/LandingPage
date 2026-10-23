"use client";

import { useState } from "react";
import { ClipboardCheck, Pencil, Search } from "lucide-react";
import { money, number } from "../../shared/format";
import { adjustStock, updatePrice } from "../actions";
import { money0 } from "../calc";
import { units } from "../components/status";
import { Badge, Button, EmptyState, Field, inputBase, inputClass, Modal, ViewHeader } from "../components/ui";
import { useErp } from "../store";
import type { CategoryId, Product } from "../types";

/** Catálogo con existencias, mínimos, márgenes y ajustes por conteo físico. */
export function Inventory({ onGoTo }: { onGoTo: () => void }) {
  const { state } = useErp();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | "todas">("todas");
  const [onlyLow, setOnlyLow] = useState(false);
  const [counting, setCounting] = useState<Product | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);

  const q = query.trim().toLowerCase();
  const rows = state.products.filter(
    (p) =>
      (category === "todas" || p.category === category) &&
      (!onlyLow || p.stock < p.minStock) &&
      (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
  );
  const value = state.products.reduce((a, p) => a + p.stock * p.cost, 0);
  const low = state.products.filter((p) => p.stock < p.minStock).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ViewHeader
        title="Inventario"
        description={`${state.products.length} productos · valor a costo ${money0.format(value)}`}
        actions={
          low > 0 ? (
            <Button onClick={onGoTo}>
              {low} bajo el mínimo · ir a Compras
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" aria-hidden />
          <input type="search" aria-label="Buscar producto" placeholder="Nombre o SKU…" className={`${inputClass} pl-9`} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select aria-label="Categoría" className={`${inputBase} w-auto`} value={category} onChange={(e) => setCategory(e.target.value as CategoryId | "todas")}>
          <option value="todas">Todas las categorías</option>
          {state.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label className="flex h-10 items-center gap-2 rounded-lg bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
          <input type="checkbox" className="size-4 accent-[#0053db]" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} />
          Solo bajo el mínimo
        </label>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Ningún producto coincide" />
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3 text-right">Existencia</th>
                  <th className="px-4 py-3 text-right">Costo</th>
                  <th className="px-4 py-3 text-right">Precio</th>
                  <th className="px-4 py-3 text-right">Margen</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((p) => {
                  const margin = (p.price - p.cost) / p.price;
                  return (
                    <tr key={p.id}>
                      <td className="px-4 py-3">
                        <span className="block font-semibold text-slate-900">{p.name}</span>
                        <span className="text-xs text-slate-500">
                          <span className="font-mono">{p.sku}</span> · {state.categories.find((c) => c.id === p.category)?.name} · por {p.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="block font-semibold tabular-nums">{number(p.stock)}</span>
                        {p.stock === 0 ? <Badge tone="red">Agotado</Badge> : p.stock < p.minStock ? <Badge tone="amber">Mín. {p.minStock}</Badge> : <span className="text-xs text-slate-400">mín. {p.minStock}</span>}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-600">{money(p.cost)}</td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">{money(p.price)}</td>
                      <td className={`px-4 py-3 text-right tabular-nums ${margin < 0.25 ? "text-amber-700" : "text-slate-600"}`}>{Math.round(margin * 100)} %</td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-600">{money0.format(p.stock * p.cost)}</td>
                      <td className="px-4 py-3">
                        <span className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" aria-label={`Ajustar existencia de ${p.name}`} onClick={() => setCounting(p)}>
                            <ClipboardCheck size={15} /> Conteo
                          </Button>
                          <Button size="sm" variant="ghost" aria-label={`Editar ${p.name}`} onClick={() => setEditing(p)}>
                            <Pencil size={15} />
                          </Button>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {counting && <CountModal product={counting} onClose={() => setCounting(null)} />}
      {editing && <EditModal product={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function CountModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { run } = useErp();
  const [counted, setCounted] = useState(String(product.stock));
  const [reason, setReason] = useState("");
  const diff = Number(counted) - product.stock;

  return (
    <Modal
      title="Ajuste por conteo físico"
      subtitle={product.name}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="count-form">
            Aplicar ajuste
          </Button>
        </>
      }
    >
      <form
        id="count-form"
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const ok = run((d) => adjustStock(d, product.id, Number(counted), reason), (r) => `Existencia ajustada (${r.diff >= 0 ? "+" : "−"}${units(Math.abs(r.diff), product.unit)}).`);
          if (ok) onClose();
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="En sistema">
            <input className={inputClass} value={product.stock} disabled />
          </Field>
          <Field label="Contado">
            <input className={inputClass} type="number" min={0} step={1} value={counted} onChange={(e) => setCounted(e.target.value)} />
          </Field>
        </div>
        {!Number.isNaN(diff) && diff !== 0 && (
          <p className={`rounded-lg px-3 py-2 text-sm font-semibold ${diff > 0 ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
            Diferencia: {diff > 0 ? "+" : "−"}
            {units(Math.abs(diff), product.unit)}
          </p>
        )}
        <Field label="Motivo">
          <input className={inputClass} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ej. Inventario cíclico de octubre" />
        </Field>
      </form>
    </Modal>
  );
}

function EditModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { run } = useErp();
  const [price, setPrice] = useState(String(product.price));
  const [minStock, setMinStock] = useState(String(product.minStock));
  const margin = Number(price) > 0 ? Math.round(((Number(price) - product.cost) / Number(price)) * 100) : 0;

  return (
    <Modal
      title="Precio y mínimo"
      subtitle={`${product.name} · costo ${money(product.cost)}`}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="price-form">
            Guardar
          </Button>
        </>
      }
    >
      <form
        id="price-form"
        className="grid grid-cols-2 gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const ok = run((d) => updatePrice(d, product.id, Number(price), Number(minStock)), "Producto actualizado.");
          if (ok) onClose();
        }}
      >
        <Field label="Precio sin IVA" hint={`Margen ${margin} %`}>
          <input className={inputClass} type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
        </Field>
        <Field label="Existencia mínima">
          <input className={inputClass} type="number" min={0} step={1} value={minStock} onChange={(e) => setMinStock(e.target.value)} />
        </Field>
      </form>
    </Modal>
  );
}
