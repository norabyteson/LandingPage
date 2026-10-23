"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { dayDate, money } from "../../shared/format";
import { createCustomer, updateCredit } from "../actions";
import { balance, creditExposure, invoiceStatus, money0, payables, receivables, todayKey, topCustomers } from "../calc";
import { capitalize, INVOICE_TONE } from "../components/status";
import { Badge, Button, Field, inputClass, Modal, Segmented, ViewHeader } from "../components/ui";
import { useErp } from "../store";
import type { Customer } from "../types";

/** Clientes (crédito y cartera) y proveedores (saldo por pagar). */
export function Contacts() {
  const { state } = useErp();
  const [tab, setTab] = useState<"clientes" | "proveedores">("clientes");
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const today = todayKey();
  const sales90 = new Map(topCustomers(state, 90, today).map((r) => [r.customer.id, r.total]));
  const open = state.customers.find((c) => c.id === openId);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ViewHeader
        title="Contactos"
        description={`${state.customers.length} clientes · ${state.suppliers.length} proveedores`}
        actions={
          <>
            <Segmented
              label="Tipo"
              value={tab}
              onChange={setTab}
              options={[
                { id: "clientes", label: "Clientes" },
                { id: "proveedores", label: "Proveedores" },
              ]}
            />
            {tab === "clientes" && (
              <Button variant="primary" onClick={() => setCreating(true)}>
                <Plus size={16} /> Nuevo cliente
              </Button>
            )}
          </>
        }
      />

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          {tab === "clientes" ? (
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Crédito usado</th>
                  <th className="px-4 py-3 text-right">Vencido</th>
                  <th className="px-4 py-3 text-right">Compras 90 días</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.customers.map((c) => {
                  const exp = creditExposure(state, c.id);
                  const share = c.creditLimit ? exp.total / c.creditLimit : 1;
                  const overdue = receivables(state)
                    .filter((i) => i.partyId === c.id && i.dueDate < today)
                    .reduce((a, i) => a + balance(i), 0);
                  return (
                    <tr key={c.id} className="cursor-pointer hover:bg-blue-50/50" onClick={() => setOpenId(c.id)}>
                      <td className="px-4 py-3">
                        <button type="button" className="text-left font-semibold text-slate-900 hover:underline">
                          {c.name}
                        </button>
                        <span className="block text-xs text-slate-500">
                          {c.rfc} · {c.city}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="mb-1 flex justify-between gap-3 text-xs text-slate-500">
                          <span className="tabular-nums">
                            {money0.format(exp.total)} de {money0.format(c.creditLimit)}
                          </span>
                          <span>{c.creditDays} días</span>
                        </div>
                        <div className="h-1.5 w-full min-w-40 rounded-full bg-slate-100">
                          <div
                            className={`h-1.5 rounded-full ${share >= 0.9 ? "bg-rose-500" : share >= 0.7 ? "bg-amber-500" : "bg-[#0053db]"}`}
                            style={{ width: `${Math.min(100, share * 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-right tabular-nums ${overdue > 0 ? "font-semibold text-rose-600" : "text-slate-400"}`}>{money0.format(overdue)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-700">{money0.format(sales90.get(c.id) ?? 0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Proveedor</th>
                  <th className="px-4 py-3">Contacto</th>
                  <th className="px-4 py-3">Crédito</th>
                  <th className="px-4 py-3 text-right">Por pagar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.suppliers.map((s) => {
                  const owed = payables(state)
                    .filter((i) => i.partyId === s.id)
                    .reduce((a, i) => a + balance(i), 0);
                  return (
                    <tr key={s.id}>
                      <td className="px-4 py-3">
                        <span className="block font-semibold text-slate-900">{s.name}</span>
                        <span className="text-xs text-slate-500">
                          {s.rfc} · {s.city}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {s.contact}
                        <span className="block text-xs text-slate-500">
                          {s.email} · {s.phone}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{s.creditDays} días</td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">{money0.format(owed)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {open && <CustomerDetail customer={open} onClose={() => setOpenId(null)} />}
      {creating && <NewCustomer onClose={() => setCreating(false)} />}
    </div>
  );
}

function CustomerDetail({ customer: c, onClose }: { customer: Customer; onClose: () => void }) {
  const { state, run } = useErp();
  const [limit, setLimit] = useState(String(c.creditLimit));
  const [days, setDays] = useState(c.creditDays);
  const exp = creditExposure(state, c.id);
  const invoices = receivables(state)
    .filter((i) => i.partyId === c.id)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <Modal title={c.name} subtitle={`${c.rfc} · ${c.city}`} onClose={onClose} wide footer={<Button variant="primary" onClick={onClose}>Listo</Button>}>
      <div className="grid gap-5 sm:grid-cols-2">
        <dl className="space-y-1.5 text-sm">
          <Row label="Contacto" value={c.contact} />
          <Row label="Correo" value={c.email} />
          <Row label="Teléfono" value={c.phone} />
          <Row label="Debe (facturas)" value={money(exp.owed)} />
          <Row label="Pedidos sin facturar" value={money(exp.pending)} />
          <Row label="Crédito disponible" value={money(Math.max(0, c.creditLimit - exp.total))} />
        </dl>
        <form
          className="space-y-3 rounded-lg bg-slate-50 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            run((d) => updateCredit(d, c.id, Number(limit), days), "Condiciones de crédito actualizadas.");
          }}
        >
          <p className="text-sm font-semibold text-slate-900">Condiciones de crédito</p>
          <Field label="Límite (MXN)">
            <input className={inputClass} type="number" min={0} step={1000} value={limit} onChange={(e) => setLimit(e.target.value)} />
          </Field>
          <Field label="Días de crédito">
            <select className={inputClass} value={days} onChange={(e) => setDays(Number(e.target.value))}>
              {[0, 15, 30, 45, 60].map((d) => (
                <option key={d} value={d}>
                  {d === 0 ? "Contado" : `${d} días`}
                </option>
              ))}
            </select>
          </Field>
          <Button type="submit" variant="primary" className="w-full">
            Guardar condiciones
          </Button>
        </form>
      </div>

      <h3 className="mt-6 mb-2 font-semibold text-slate-900">Facturas abiertas</h3>
      {invoices.length === 0 ? (
        <p className="text-sm text-slate-500">No tiene saldo pendiente.</p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-lg text-sm ring-1 ring-slate-200">
          {invoices.map((i) => {
            const st = invoiceStatus(i);
            return (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
                <span>
                  <span className="font-mono font-semibold whitespace-nowrap text-slate-900">{i.folio}</span>{" "}
                  <span className="text-slate-500">vence {dayDate(i.dueDate)}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Badge tone={INVOICE_TONE[st]}>{capitalize(st)}</Badge>
                  <span className="font-semibold tabular-nums">{money(balance(i))}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}

function NewCustomer({ onClose }: { onClose: () => void }) {
  const { run } = useErp();
  const [form, setForm] = useState({ name: "", rfc: "", contact: "", email: "", phone: "", city: "Hermosillo, Son.", creditLimit: "100000", creditDays: 30 });
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <Modal
      title="Nuevo cliente"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="customer-form">
            Guardar cliente
          </Button>
        </>
      }
    >
      <form
        id="customer-form"
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const ok = run((d) => createCustomer(d, { ...form, creditLimit: Number(form.creditLimit) }), (c) => `Cliente ${c.name} dado de alta.`);
          if (ok) onClose();
        }}
      >
        <div className="sm:col-span-2">
          <Field label="Razón social">
            <input className={inputClass} value={form.name} onChange={(e) => set({ name: e.target.value })} />
          </Field>
        </div>
        <Field label="RFC">
          <input className={`${inputClass} uppercase`} value={form.rfc} onChange={(e) => set({ rfc: e.target.value })} placeholder="ABC-123456-XY1" />
        </Field>
        <Field label="Ciudad">
          <input className={inputClass} value={form.city} onChange={(e) => set({ city: e.target.value })} />
        </Field>
        <Field label="Contacto">
          <input className={inputClass} value={form.contact} onChange={(e) => set({ contact: e.target.value })} />
        </Field>
        <Field label="Correo">
          <input className={inputClass} type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} />
        </Field>
        <Field label="Límite de crédito">
          <input className={inputClass} type="number" min={0} step={1000} value={form.creditLimit} onChange={(e) => set({ creditLimit: e.target.value })} />
        </Field>
        <Field label="Días de crédito">
          <select className={inputClass} value={form.creditDays} onChange={(e) => set({ creditDays: Number(e.target.value) })}>
            {[0, 15, 30, 45, 60].map((d) => (
              <option key={d} value={d}>
                {d === 0 ? "Contado" : `${d} días`}
              </option>
            ))}
          </select>
        </Field>
      </form>
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="truncate text-right font-medium text-slate-900">{value}</dd>
    </div>
  );
}
