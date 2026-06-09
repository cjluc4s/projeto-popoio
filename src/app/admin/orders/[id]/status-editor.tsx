"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const options = [
  { value: "pending", label: "Criado" },
  { value: "preparing", label: "Confirmado" },
  { value: "ready", label: "Em rota" },
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
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function update(next: string) {
    setSaving(true);
    setStatus(next);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next, note: note.trim() || undefined }),
    });
    setSaving(false);
    if (!res.ok) {
      alert("Erro ao atualizar status");
      setStatus(initial);
    } else {
      setNote("");
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
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled={saving}
        placeholder="Observação da alteração (opcional)"
        className="w-full border rounded-md px-3 py-2 text-sm min-h-20"
      />
    </div>
  );
}
