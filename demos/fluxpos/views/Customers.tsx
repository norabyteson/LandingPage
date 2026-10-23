"use client";

import { useMemo, useState } from "react";
import { Crown, Plus, Search } from "lucide-react";
import { date, dateTime, initials, money } from "../../shared/format";
import { toggleVip } from "../actions";
import { CustomerForm } from "../components/CustomerForm";
import { Badge, Button, EmptyState, inputClass, Modal, ViewHeader } from "../components/ui";
import { usePos } from "../store";

/** Clientes: búsqueda, alta, VIP (descuento automático en caja) e historial de compras. */
export function Customers() {
  const { state, run } = usePos();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.customers
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q))
      .map((c) => {
        const sales = state.sales.filter((s) => s.customerId === c.id && s.status === "pagada");
        return {
          customer: c,
          total: sales.reduce((a, s) => a + s.total, 0),
          visits: sales.length,
          last: sales.map((s) => s.createdAt).sort().at(-1),
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [state.customers, state.sales, query]);

  const detail = rows.find((r) => r.customer.id === selected);
  const history = detail
    ? state.sales.filter((s) => s.customerId === detail.customer.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ViewHeader
        title="Clientes"
        description={`${state.customers.length} clientes · ${state.customers.filter((c) => c.vip).length} VIP con ${Math.round(state.settings.vipDiscount * 100)} % de descuento`}
        actions={
          <Button variant="primary" onClick={() => setCreating(true)}>
            <Plus size={16} /> Nuevo cliente
          </Button>
        }
      />

      <div className="relative mb-4 max-w-md">
        <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" aria-hidden />
        <input type="search" aria-label="Buscar cliente" placeholder="Nombre, teléfono o correo…" className={`${inputClass} pl-9`} value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Ningún cliente coincide">Prueba con otro nombre o registra uno nuevo.</EmptyState>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ customer: c, total, visits, last }) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setSelected(c.id)}
                className="flex w-full items-start gap-3 rounded-xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md hover:ring-indigo-300"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">{initials(c.name)}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-semibold text-slate-900">{c.name}</span>
                    {c.vip && <Badge tone="indigo">VIP</Badge>}
                  </span>
                  <span className="block text-sm text-slate-500">{c.phone}</span>
                  <span className="mt-2 flex flex-wrap gap-x-4 text-sm">
                    <span className="font-semibold tabular-nums text-slate-800">{money(total)}</span>
                    <span className="text-slate-500">{visits} compras</span>
                    {last && <span className="text-slate-500">Última: {date(last)}</span>}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {creating && <CustomerForm onClose={() => setCreating(false)} />}

      {detail && (
        <Modal
          title={detail.customer.name}
          onClose={() => setSelected(null)}
          wide
          footer={
            <>
              <Button
                onClick={() =>
                  run(
                    (d) => toggleVip(d, detail.customer.id),
                    (c) => (c.vip ? `${c.name} ahora es VIP.` : `${c.name} ya no es VIP.`)
                  )
                }
              >
                <Crown size={16} /> {detail.customer.vip ? "Quitar VIP" : "Hacer VIP"}
              </Button>
              <Button variant="primary" onClick={() => setSelected(null)}>
                Listo
              </Button>
            </>
          }
        >
          <dl className="mb-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <Stat label="Total comprado" value={money(detail.total)} />
            <Stat label="Compras" value={String(detail.visits)} />
            <Stat label="Teléfono" value={detail.customer.phone || "Sin registrar"} />
            <Stat label="Cliente desde" value={date(detail.customer.createdAt)} />
          </dl>
          <h3 className="mb-2 font-semibold text-slate-900">Historial</h3>
          {history.length === 0 ? (
            <p className="text-sm text-slate-500">Aún no tiene compras.</p>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-lg ring-1 ring-slate-200">
              {history.slice(0, 12).map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm">
                  <span>
                    <span className="font-mono font-semibold text-indigo-700">{s.folio}</span>{" "}
                    <span className="text-slate-500">{dateTime(s.createdAt)}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    {s.status === "cancelada" && <Badge tone="red">Cancelada</Badge>}
                    <span className="font-semibold tabular-nums">{money(s.total)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
