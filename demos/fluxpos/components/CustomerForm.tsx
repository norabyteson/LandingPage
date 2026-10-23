"use client";

import { useState } from "react";
import { createCustomer } from "../actions";
import { usePos } from "../store";
import type { Customer } from "../types";
import { Button, Field, inputClass, Modal } from "./ui";

/** Alta de cliente (desde Caja o desde Clientes). Devuelve el cliente creado en `onCreated`. */
export function CustomerForm({ onClose, onCreated }: { onClose: () => void; onCreated?: (c: Customer) => void }) {
  const { run } = usePos();
  const [form, setForm] = useState({ name: "", phone: "", email: "", vip: false });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = run((d) => createCustomer(d, form), (c) => `Cliente ${c.name} registrado.`);
    if (created) {
      onCreated?.(created);
      onClose();
    }
  };

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
      <form id="customer-form" onSubmit={submit} className="grid gap-4">
        <Field label="Nombre completo">
          <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="off" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Teléfono">
            <input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="tel" placeholder="662 000 0000" />
          </Field>
          <Field label="Correo (opcional)">
            <input className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" />
          </Field>
        </div>
        <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
          <input type="checkbox" className="size-4 accent-indigo-600" checked={form.vip} onChange={(e) => setForm({ ...form, vip: e.target.checked })} />
          <span className="text-sm">
            <span className="font-semibold text-slate-800">Cliente VIP</span>
            <span className="block text-slate-500">Recibe 10 % de descuento automático en caja.</span>
          </span>
        </label>
      </form>
    </Modal>
  );
}
