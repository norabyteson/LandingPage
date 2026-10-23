"use client";

import { useState } from "react";
import { createEmployee, updateEmployee, type EmployeeInput } from "../actions";
import { todayKey } from "../calc";
import { useArq } from "../store";
import type { DepartmentId, Employee } from "../types";
import { Button, Field, inputClass, Modal } from "./ui";

/** Alta o edición de una persona del equipo. */
export function EmployeeForm({ employee, onClose, onSaved }: { employee?: Employee; onClose: () => void; onSaved?: (e: Employee) => void }) {
  const { state, run } = useArq();
  const [form, setForm] = useState({
    name: employee?.name ?? "",
    email: employee?.email ?? "",
    phone: employee?.phone ?? "",
    department: employee?.department ?? ("arquitectonico" as DepartmentId),
    position: employee?.position ?? "",
    hourlyCost: String(employee?.hourlyCost ?? 300),
    hireDate: employee?.hireDate ?? todayKey(),
  });
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const input: EmployeeInput = { ...form, hourlyCost: Number(form.hourlyCost) };
    const saved = employee
      ? run((d) => updateEmployee(d, employee.id, input), "Datos actualizados.")
      : run((d) => createEmployee(d, input), (x) => `${x.name} se agregó al equipo (${x.empNo}).`);
    if (saved) {
      onSaved?.(saved);
      onClose();
    }
  };

  return (
    <Modal
      title={employee ? `Editar a ${employee.name}` : "Agregar persona"}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="employee-form">
            {employee ? "Guardar cambios" : "Agregar"}
          </Button>
        </>
      }
    >
      <form id="employee-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Nombre completo">
            <input className={inputClass} value={form.name} onChange={(e) => set({ name: e.target.value })} autoComplete="off" />
          </Field>
        </div>
        <Field label="Correo laboral">
          <input className={inputClass} type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="nombre.a@tallerpitic.mx" />
        </Field>
        <Field label="Teléfono">
          <input className={inputClass} inputMode="tel" value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
        </Field>
        <Field label="Departamento">
          <select className={inputClass} value={form.department} onChange={(e) => set({ department: e.target.value as DepartmentId })}>
            {state.departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Puesto">
          <input className={inputClass} value={form.position} onChange={(e) => set({ position: e.target.value })} placeholder="Ej. Arquitecta proyectista" />
        </Field>
        <Field label="Fecha de ingreso" hint="Define sus días de vacaciones por ley.">
          <input className={inputClass} type="date" max={todayKey()} value={form.hireDate} onChange={(e) => set({ hireDate: e.target.value })} />
        </Field>
        <Field label="Costo por hora (MXN)" hint="Se usa para el costo de cada proyecto.">
          <input className={inputClass} type="number" min={1} step="1" value={form.hourlyCost} onChange={(e) => set({ hourlyCost: e.target.value })} />
        </Field>
      </form>
    </Modal>
  );
}
