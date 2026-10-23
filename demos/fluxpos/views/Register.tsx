"use client";

import { useMemo, useState } from "react";
import { Banknote, CreditCard, Landmark, Minus, Plus, Printer, Search, ShoppingBag, Trash2, UserPlus, X } from "lucide-react";
import { money, round2 } from "../../shared/format";
import { checkout } from "../actions";
import { cartTotals, METHOD_LABEL, openShift, totalStock } from "../calc";
import { CustomerForm } from "../components/CustomerForm";
import { Ticket } from "../components/Ticket";
import { Badge, Button, Field, inputClass, Modal, ProductThumb } from "../components/ui";
import { usePos } from "../store";
import type { CartLine, CategoryId, PaymentMethod, Product, Sale } from "../types";

/** Caja: catálogo a la izquierda, carrito a la derecha (en móvil, el carrito es una hoja inferior). */
export function Register({ onGoTo }: { onGoTo: (view: "corte") => void }) {
  const { state, run } = usePos();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | "todas">("todas");
  const [lines, setLines] = useState<CartLine[]>([]);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [sizeFor, setSizeFor] = useState<Product | null>(null);
  const [paying, setPaying] = useState(false);
  const [newCustomer, setNewCustomer] = useState(false);
  const [ticket, setTicket] = useState<Sale | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const shift = openShift(state);
  const customer = state.customers.find((c) => c.id === customerId) ?? null;
  const discountRate = customer?.vip ? state.settings.vipDiscount : 0;
  const totals = cartTotals(lines, state.products, discountRate, state.settings.taxRate);

  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.products.filter(
      (p) =>
        (category === "todas" || p.category === category) &&
        (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    );
  }, [state.products, query, category]);

  /** Existencia de una talla menos lo que ya está en el carrito. */
  const available = (p: Product, size: string) =>
    (p.stock[size] ?? 0) - (lines.find((l) => l.productId === p.id && l.size === size)?.qty ?? 0);

  const add = (p: Product, size: string) => {
    if (available(p, size) <= 0) return;
    setLines((ls) => {
      const found = ls.find((l) => l.productId === p.id && l.size === size);
      return found
        ? ls.map((l) => (l === found ? { ...l, qty: l.qty + 1 } : l))
        : [...ls, { productId: p.id, size, qty: 1 }];
    });
  };

  const onProduct = (p: Product) => {
    if (p.sizes.length === 1) add(p, p.sizes[0]!);
    else setSizeFor(p);
  };

  const changeQty = (line: CartLine, delta: number) => {
    const p = state.products.find((x) => x.id === line.productId);
    if (!p) return;
    if (delta > 0 && available(p, line.size) <= 0) return;
    setLines((ls) =>
      ls.flatMap((l) => (l === line ? (l.qty + delta <= 0 ? [] : [{ ...l, qty: l.qty + delta }]) : [l]))
    );
  };

  const finish = (sale: Sale) => {
    setPaying(false);
    setLines([]);
    setCustomerId(null);
    setCartOpen(false);
    setTicket(sale);
  };

  const cart = (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Venta actual</h2>
          {lines.length > 0 && (
            <button type="button" onClick={() => setLines([])} className="text-sm font-semibold text-rose-600 hover:text-rose-700">
              Vaciar
            </button>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <select
            aria-label="Cliente"
            className={inputClass}
            value={customerId ?? ""}
            onChange={(e) => setCustomerId(e.target.value || null)}
          >
            <option value="">Público en general</option>
            {[...state.customers]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.vip ? " · VIP" : ""}
                </option>
              ))}
          </select>
          <Button size="md" aria-label="Nuevo cliente" onClick={() => setNewCustomer(true)} className="px-3">
            <UserPlus size={18} />
          </Button>
        </div>
        {customer?.vip && (
          <p className="mt-2 text-sm text-indigo-700">Cliente VIP: se aplica {Math.round(state.settings.vipDiscount * 100)} % de descuento.</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {lines.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center text-slate-500">
            <ShoppingBag size={32} strokeWidth={1.5} aria-hidden />
            <p className="text-sm">Toca un producto para agregarlo.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {lines.map((l) => {
              const p = state.products.find((x) => x.id === l.productId);
              if (!p) return null;
              return (
                <li key={`${l.productId}-${l.size}`} className="demo-in flex gap-3">
                  <ProductThumb product={p} className="size-14 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500">
                      Talla {l.size} · {money(p.price)}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1">
                      <QtyButton label="Quitar uno" onClick={() => changeQty(l, -1)}>
                        <Minus size={14} />
                      </QtyButton>
                      <span className="w-7 text-center text-sm font-semibold tabular-nums">{l.qty}</span>
                      <QtyButton label="Agregar uno" onClick={() => changeQty(l, 1)} disabled={available(p, l.size) <= 0}>
                        <Plus size={14} />
                      </QtyButton>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <span className="text-sm font-semibold tabular-nums">{money(l.qty * p.price)}</span>
                    <button
                      type="button"
                      aria-label={`Quitar ${p.name}`}
                      onClick={() => changeQty(l, -l.qty)}
                      className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="space-y-1.5 border-t border-slate-200 bg-slate-50 p-4 text-sm">
        <TotalRow label={`Importe (${totals.count} art.)`} value={money(totals.gross)} />
        {totals.discount > 0 && <TotalRow label="Descuento VIP" value={`−${money(totals.discount)}`} accent />}
        <TotalRow label="IVA incluido" value={money(totals.tax)} muted />
        <div className="flex items-baseline justify-between pt-2">
          <span className="font-bold text-slate-900">Total</span>
          <span className="text-2xl font-bold tabular-nums text-slate-900">{money(totals.total)}</span>
        </div>
        {shift ? (
          <Button variant="primary" size="lg" className="mt-3 w-full" disabled={lines.length === 0} onClick={() => setPaying(true)}>
            Cobrar {money(totals.total)}
          </Button>
        ) : (
          <div className="mt-3 rounded-lg bg-amber-50 p-3 text-amber-900 ring-1 ring-amber-200">
            No hay turno abierto.{" "}
            <button type="button" className="font-semibold underline" onClick={() => onGoTo("corte")}>
              Abrir turno
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-full min-h-0">
      {/* ---- Catálogo ---- */}
      <section className="flex min-w-0 flex-1 flex-col" aria-label="Catálogo">
        <div className="space-y-3 border-b border-slate-200 bg-white p-4">
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o SKU…"
              aria-label="Buscar producto"
              className={`${inputClass} pl-10`}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]" role="group" aria-label="Categorías">
            {[{ id: "todas" as const, name: "Todas" }, ...state.categories].map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={category === c.id}
                onClick={() => setCategory(c.id)}
                className={`h-9 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors ${
                  category === c.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-28 lg:pb-4">
          {products.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">Ningún producto coincide con «{query}».</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => {
                const stock = totalStock(p) - lines.filter((l) => l.productId === p.id).reduce((a, l) => a + l.qty, 0);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => onProduct(p)}
                      disabled={stock <= 0}
                      className="group flex w-full flex-col overflow-hidden rounded-xl bg-white text-left shadow-sm ring-1 ring-slate-200 transition-[box-shadow,translate] hover:-translate-y-0.5 hover:shadow-md hover:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                      <ProductThumb product={p} className="aspect-square w-full" />
                      <span className="flex flex-1 flex-col gap-1 p-3">
                        <span className="line-clamp-2 text-sm font-semibold text-slate-900">{p.name}</span>
                        <span className="font-bold text-indigo-700 tabular-nums">{money(p.price)}</span>
                        <span>
                          {stock <= 0 ? (
                            <Badge tone="red">Agotado</Badge>
                          ) : stock < p.minStock ? (
                            <Badge tone="amber">Quedan {stock}</Badge>
                          ) : (
                            <span className="text-xs text-slate-500">{stock} disponibles</span>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* ---- Carrito (escritorio) ---- */}
      <aside className="hidden w-[360px] shrink-0 border-l border-slate-200 bg-white lg:block" aria-label="Venta actual">
        {cart}
      </aside>

      {/* ---- Carrito (móvil): barra inferior y hoja ---- */}
      <div className="fixed inset-x-0 bottom-16 z-30 p-3 lg:hidden">
        <Button variant="primary" size="lg" className="w-full justify-between" onClick={() => setCartOpen(true)}>
          <span>Ver venta · {totals.count} art.</span>
          <span className="tabular-nums">{money(totals.total)}</span>
        </Button>
      </div>
      {cartOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-slate-900/50 lg:hidden" onMouseDown={(e) => e.target === e.currentTarget && setCartOpen(false)}>
          <div className="demo-in mt-auto flex h-[85dvh] flex-col overflow-hidden rounded-t-2xl bg-white">
            <div className="flex justify-end px-2 pt-2">
              <button type="button" aria-label="Cerrar venta" onClick={() => setCartOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <div className="min-h-0 flex-1">{cart}</div>
          </div>
        </div>
      )}

      {sizeFor && (
        <Modal title={sizeFor.name} onClose={() => setSizeFor(null)}>
          <p className="mb-3 text-sm text-slate-500">Elige la talla · {money(sizeFor.price)}</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {sizeFor.sizes.map((s) => {
              const left = available(sizeFor, s);
              return (
                <button
                  key={s}
                  type="button"
                  disabled={left <= 0}
                  onClick={() => {
                    add(sizeFor, s);
                    setSizeFor(null);
                  }}
                  className="flex flex-col items-center rounded-lg border border-slate-300 py-3 transition-colors hover:border-indigo-500 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <span className="text-base font-bold">{s}</span>
                  <span className="text-xs">{left > 0 ? `${left} disp.` : "Agotada"}</span>
                </button>
              );
            })}
          </div>
        </Modal>
      )}

      {paying && (
        <PaymentModal
          total={totals.total}
          onClose={() => setPaying(false)}
          onConfirm={(method, received, reference) => {
            const sale = run(
              (d) => checkout(d, { lines, customerId, method, received, reference }),
              (s) => `Venta ${s.folio} cobrada.`
            );
            if (sale) finish(sale);
          }}
        />
      )}

      {newCustomer && <CustomerForm onClose={() => setNewCustomer(false)} onCreated={(c) => setCustomerId(c.id)} />}

      {ticket && (
        <Modal
          title={`Venta ${ticket.folio}`}
          onClose={() => setTicket(null)}
          footer={
            <>
              <Button onClick={() => window.print()}>
                <Printer size={16} /> Imprimir
              </Button>
              <Button variant="primary" onClick={() => setTicket(null)}>
                Nueva venta
              </Button>
            </>
          }
        >
          <Ticket state={state} sale={ticket} />
        </Modal>
      )}
    </div>
  );
}

function QtyButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-7 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function TotalRow({ label, value, accent, muted }: { label: string; value: string; accent?: boolean; muted?: boolean }) {
  return (
    <div className={`flex justify-between ${accent ? "text-indigo-700" : muted ? "text-slate-500" : "text-slate-700"}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

const METHODS: { id: PaymentMethod; icon: typeof Banknote }[] = [
  { id: "efectivo", icon: Banknote },
  { id: "tarjeta", icon: CreditCard },
  { id: "transferencia", icon: Landmark },
];

/** Cobro: efectivo con cambio, tarjeta (terminal simulada) o transferencia. */
function PaymentModal({
  total,
  onClose,
  onConfirm,
}: {
  total: number;
  onClose: () => void;
  onConfirm: (method: PaymentMethod, received?: number, reference?: string) => void;
}) {
  const [method, setMethod] = useState<PaymentMethod>("efectivo");
  const [received, setReceived] = useState("");
  const [reference, setReference] = useState("");
  const receivedNum = received === "" ? NaN : Number(received);
  const change = round2(receivedNum - total);
  const quick = [...new Set([Math.ceil(total), Math.ceil(total / 100) * 100, Math.ceil(total / 500) * 500, Math.ceil(total / 1000) * 1000])].slice(0, 4);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(method, method === "efectivo" ? receivedNum : undefined, method === "efectivo" ? undefined : reference);
  };

  return (
    <Modal
      title={`Cobrar ${money(total)}`}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="payment-form">
            Confirmar pago
          </Button>
        </>
      }
    >
      <form id="payment-form" onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Método de pago">
          {METHODS.map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={method === id}
              onClick={() => setMethod(id)}
              className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-sm font-semibold transition-colors ${
                method === id ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Icon size={20} aria-hidden />
              {METHOD_LABEL[id]}
            </button>
          ))}
        </div>

        {method === "efectivo" ? (
          <>
            <Field label="Efectivo recibido">
              <input
                className={`${inputClass} h-12 text-lg font-semibold`}
                inputMode="decimal"
                type="number"
                min={0}
                step="0.01"
                value={received}
                onChange={(e) => setReceived(e.target.value)}
                placeholder={money(total)}
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              {quick.map((q) => (
                <Button key={q} size="sm" onClick={() => setReceived(String(q))}>
                  {money(q)}
                </Button>
              ))}
            </div>
            <div
              aria-live="polite"
              className={`flex items-baseline justify-between rounded-xl px-4 py-3 ${
                Number.isNaN(change) ? "bg-slate-100 text-slate-600" : change >= 0 ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"
              }`}
            >
              <span className="font-semibold">{!Number.isNaN(change) && change < 0 ? "Faltan" : "Cambio"}</span>
              <span className="text-2xl font-bold tabular-nums">{Number.isNaN(change) ? money(0) : money(Math.abs(change))}</span>
            </div>
          </>
        ) : (
          <Field
            label={method === "tarjeta" ? "Autorización de la terminal (opcional)" : "Referencia SPEI (opcional)"}
            hint="Si la dejas vacía, la demo genera una."
          >
            <input className={inputClass} value={reference} onChange={(e) => setReference(e.target.value)} />
          </Field>
        )}
      </form>
    </Modal>
  );
}
