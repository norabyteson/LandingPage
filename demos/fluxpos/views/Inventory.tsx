"use client";

import { useMemo, useState } from "react";
import { PackagePlus, Pencil, Plus, Search } from "lucide-react";
import { dateTime, money } from "../../shared/format";
import { createProduct, receiveStock, updateProduct } from "../actions";
import { stockStatus, totalStock } from "../calc";
import { Badge, Button, EmptyState, Field, inputBase, inputClass, Modal, ProductThumb, ViewHeader } from "../components/ui";
import { usePos } from "../store";
import type { CategoryId, Product } from "../types";

type StatusFilter = "todos" | "bajo" | "agotado";

/** Existencias por talla, alertas de reorden, entradas de mercancía y alta/edición de productos. */
export function Inventory() {
  const { state } = usePos();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | "todas">("todas");
  const [status, setStatus] = useState<StatusFilter>("todos");
  const [receiving, setReceiving] = useState<Product | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  const counts = useMemo(
    () => ({
      bajo: state.products.filter((p) => stockStatus(p) === "bajo").length,
      agotado: state.products.filter((p) => stockStatus(p) === "agotado").length,
    }),
    [state.products]
  );

  const rows = state.products.filter((p) => {
    const q = query.trim().toLowerCase();
    return (
      (category === "todas" || p.category === category) &&
      (status === "todos" || stockStatus(p) === status) &&
      (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    );
  });

  const value = state.products.reduce((a, p) => a + totalStock(p) * p.cost, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ViewHeader
        title="Inventario"
        description={`${state.products.length} productos · valor a costo ${money(value)}`}
        actions={
          <Button variant="primary" onClick={() => setCreating(true)}>
            <Plus size={16} /> Nuevo producto
          </Button>
        }
      />

      {(counts.bajo > 0 || counts.agotado > 0) && (
        <div className="mb-4 flex flex-wrap gap-2 text-sm">
          {counts.agotado > 0 && (
            <button type="button" onClick={() => setStatus("agotado")} className="rounded-lg bg-rose-50 px-3 py-2 font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100">
              {counts.agotado} agotados
            </button>
          )}
          {counts.bajo > 0 && (
            <button type="button" onClick={() => setStatus("bajo")} className="rounded-lg bg-amber-50 px-3 py-2 font-semibold text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100">
              {counts.bajo} con inventario bajo
            </button>
          )}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
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
        <select aria-label="Estado" className={`${inputBase} w-auto`} value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
          <option value="todos">Todos los estados</option>
          <option value="bajo">Inventario bajo</option>
          <option value="agotado">Agotados</option>
        </select>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Ningún producto coincide">Cambia la búsqueda o los filtros.</EmptyState>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          {rows.map((p) => {
            const st = stockStatus(p);
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-4 p-4">
                <ProductThumb product={p} className="size-14 shrink-0 rounded-lg" />
                <div className="min-w-44 flex-1">
                  <p className="font-semibold text-slate-900">{p.name}</p>
                  <p className="text-sm text-slate-500">
                    <span className="font-mono">{p.sku}</span> · {state.categories.find((c) => c.id === p.category)?.name} · {money(p.price)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5" aria-label="Existencias por talla">
                  {p.sizes.map((s) => (
                    <span
                      key={s}
                      className={`rounded-md px-2 py-1 text-xs font-semibold tabular-nums ring-1 ring-inset ${
                        (p.stock[s] ?? 0) === 0 ? "bg-rose-50 text-rose-700 ring-rose-200" : "bg-slate-50 text-slate-700 ring-slate-200"
                      }`}
                    >
                      {s}: {p.stock[s] ?? 0}
                    </span>
                  ))}
                </div>
                <div className="flex w-28 flex-col items-start gap-1">
                  <span className="text-sm font-semibold tabular-nums">{totalStock(p)} pzas.</span>
                  {st === "agotado" ? <Badge tone="red">Agotado</Badge> : st === "bajo" ? <Badge tone="amber">Bajo (mín. {p.minStock})</Badge> : <Badge tone="green">En stock</Badge>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setReceiving(p)}>
                    <PackagePlus size={16} /> Entrada
                  </Button>
                  <Button size="sm" variant="ghost" aria-label={`Editar ${p.name}`} onClick={() => setEditing(p)}>
                    <Pencil size={16} />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Movements />

      {receiving && <ReceiveModal product={receiving} onClose={() => setReceiving(null)} />}
      {editing && <EditModal product={editing} onClose={() => setEditing(null)} />}
      {creating && <CreateModal onClose={() => setCreating(false)} />}
    </div>
  );
}

function Movements() {
  const { state } = usePos();
  const list = state.movements.slice(0, 12);
  return (
    <section className="mt-10" aria-labelledby="movements-title">
      <h2 id="movements-title" className="mb-3 text-lg font-bold text-slate-900">
        Movimientos recientes
      </h2>
      {list.length === 0 ? (
        <EmptyState title="Aún no hay movimientos en esta sesión">Las ventas, cancelaciones y entradas aparecerán aquí.</EmptyState>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl bg-white text-sm shadow-sm ring-1 ring-slate-200">
          {list.map((m) => {
            const p = state.products.find((x) => x.id === m.productId);
            return (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <span>
                  <span className="font-semibold text-slate-900">{p?.name ?? "Producto"}</span>{" "}
                  <span className="text-slate-500">talla {m.size}</span>
                </span>
                <span className="flex items-center gap-3">
                  <Badge tone={m.type === "venta" ? "indigo" : m.type === "entrada" ? "green" : "amber"}>
                    {m.type[0]!.toUpperCase() + m.type.slice(1)}
                    {m.note ? ` · ${m.note}` : ""}
                  </Badge>
                  <span className={`w-12 text-right font-semibold tabular-nums ${m.qty > 0 ? "text-emerald-700" : "text-slate-700"}`}>
                    {m.qty > 0 ? `+${m.qty}` : m.qty}
                  </span>
                  <span className="hidden text-slate-500 sm:inline">{dateTime(m.createdAt)}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function ReceiveModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { run } = usePos();
  const [size, setSize] = useState(product.sizes[0]!);
  const [qty, setQty] = useState("6");
  const [note, setNote] = useState("");

  return (
    <Modal
      title={`Entrada: ${product.name}`}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="receive-form">
            Registrar entrada
          </Button>
        </>
      }
    >
      <form
        id="receive-form"
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const ok = run((d) => receiveStock(d, product.id, size, Number(qty), note), `Entraron ${qty} piezas (talla ${size}).`);
          if (ok) onClose();
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Talla" hint={`Hay ${product.stock[size] ?? 0}`}>
            <select className={inputClass} value={size} onChange={(e) => setSize(e.target.value)}>
              {product.sizes.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Cantidad">
            <input className={inputClass} type="number" min={1} step={1} inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} />
          </Field>
        </div>
        <Field label="Nota (opcional)">
          <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej. Factura proveedor F-2231" />
        </Field>
      </form>
    </Modal>
  );
}

function EditModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { run } = usePos();
  const [form, setForm] = useState({ name: product.name, price: String(product.price), minStock: String(product.minStock) });

  return (
    <Modal
      title="Editar producto"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="edit-form">
            Guardar cambios
          </Button>
        </>
      }
    >
      <form
        id="edit-form"
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const ok = run(
            (d) => updateProduct(d, product.id, { name: form.name, price: Number(form.price), minStock: Number(form.minStock) }),
            "Producto actualizado."
          );
          if (ok) onClose();
        }}
      >
        <Field label="Nombre">
          <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Precio con IVA">
            <input className={inputClass} type="number" min={1} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </Field>
          <Field label="Mínimo de reorden" hint="Por debajo se marca como bajo.">
            <input className={inputClass} type="number" min={0} step={1} value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} />
          </Field>
        </div>
      </form>
    </Modal>
  );
}

const SIZE_PRESETS: { label: string; sizes: string[] }[] = [
  { label: "Ropa (CH a XG)", sizes: ["CH", "M", "G", "XG"] },
  { label: "Cintura (28 a 36)", sizes: ["28", "30", "32", "34", "36"] },
  { label: "Calzado (25 a 29)", sizes: ["25", "26", "27", "28", "29"] },
  { label: "Talla única", sizes: ["Única"] },
];

function CreateModal({ onClose }: { onClose: () => void }) {
  const { state, run } = usePos();
  const [form, setForm] = useState({ name: "", sku: "", category: "tops" as CategoryId, price: "", cost: "", preset: 0, minStock: "6" });

  return (
    <Modal
      title="Nuevo producto"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="create-form">
            Crear producto
          </Button>
        </>
      }
    >
      <form
        id="create-form"
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const ok = run(
            (d) =>
              createProduct(d, {
                name: form.name,
                sku: form.sku,
                category: form.category,
                price: Number(form.price),
                cost: Number(form.cost),
                sizes: SIZE_PRESETS[form.preset]!.sizes,
                minStock: Number(form.minStock),
              }),
            (p) => `${p.name} creado. Registra una entrada para tener existencias.`
          );
          if (ok) onClose();
        }}
      >
        <Field label="Nombre">
          <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej. Camisa de Lino" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="SKU">
            <input className={`${inputClass} font-mono uppercase`} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="TOP-1300" />
          </Field>
          <Field label="Categoría">
            <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as CategoryId })}>
              {state.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Precio con IVA">
            <input className={inputClass} type="number" min={1} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </Field>
          <Field label="Costo">
            <input className={inputClass} type="number" min={0} step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
          </Field>
          <Field label="Tallas">
            <select className={inputClass} value={form.preset} onChange={(e) => setForm({ ...form, preset: Number(e.target.value) })}>
              {SIZE_PRESETS.map((s, i) => (
                <option key={s.label} value={i}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Mínimo de reorden">
            <input className={inputClass} type="number" min={0} step={1} value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} />
          </Field>
        </div>
      </form>
    </Modal>
  );
}
