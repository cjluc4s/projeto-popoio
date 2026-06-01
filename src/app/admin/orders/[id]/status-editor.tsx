"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const options = [
  { value: "pending", label: "Pendente" },
  { value: "preparing", label: "Em preparo" },
  { value: "ready", label: "Pronto" },
  { value: "delivered", label: "Entregue" },
  { value: "cancelled", label: "Cancelado" },
];

export function StatusEditor({
  orderId,
  initial,
}: {
  orderId: string;
  initial: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function update(next: string) {
    setSaving(true);
    setStatus(next);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setSaving(false);
    if (!res.ok) {
      alert("Erro ao atualizar status");
      setStatus(initial);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="border-t pt-3 space-y-2">
      <label className="text-sm text-stone-500">Atualizar status</label>
      <select
        value={status}
        disabled={saving}
        onChange={(e) => update(e.target.value)}
        className="w-full border rounded-md px-3 py-2"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
