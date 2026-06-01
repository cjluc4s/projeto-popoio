"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatBRL } from "@/lib/format";

interface Product {
  id: string;
  name: string;
  priceCents: number;
  description: string | null;
  category: string | null;
  stockQty: number;
  available: boolean;
  imageUrl: string | null;
}

export function AdminProductsClient({ initial }: { initial: Product[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);

  function newProduct() {
    setEditing({
      name: "",
      priceCents: 0,
      stockQty: 0,
      available: true,
      category: "",
      description: "",
      imageUrl: "",
    });
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    const isUpdate = !!editing.id;
    const url = isUpdate ? `/api/products/${editing.id}` : "/api/products";
    const method = isUpdate ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editing.name,
        priceCents: Number(editing.priceCents) || 0,
        stockQty: Number(editing.stockQty) || 0,
        available: editing.available ?? true,
        category: editing.category || null,
        description: editing.description || null,
        imageUrl: editing.imageUrl || null,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      alert("Erro ao salvar");
      return;
    }
    const saved = (await res.json()) as Product;
    setItems((arr) =>
      isUpdate ? arr.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...arr]
    );
    setEditing(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Excluir este produto?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((arr) => arr.filter((p) => p.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <button
          onClick={newProduct}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-md text-sm font-medium"
        >
          + Novo
        </button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-100 text-left">
            <tr>
              <th className="p-2">Nome</th>
              <th className="p-2 hidden sm:table-cell">Categoria</th>
              <th className="p-2">Preço</th>
              <th className="p-2">Estoque</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-2">
                  {p.name}
                  {!p.available && (
                    <span className="ml-2 text-xs bg-stone-200 px-1 rounded">
                      oculto
                    </span>
                  )}
                </td>
                <td className="p-2 hidden sm:table-cell">{p.category ?? "-"}</td>
                <td className="p-2">{formatBRL(p.priceCents)}</td>
                <td className="p-2">{p.stockQty}</td>
                <td className="p-2 text-right space-x-2 whitespace-nowrap">
                  <button
                    onClick={() => setEditing(p)}
                    className="text-emerald-700 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="text-red-600 hover:underline"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-stone-500">
                  Nenhum produto cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-5 max-w-md w-full space-y-3">
            <h2 className="font-bold text-lg">
              {editing.id ? "Editar produto" : "Novo produto"}
            </h2>
            <input
              placeholder="Nome"
              value={editing.name ?? ""}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            />
            <input
              placeholder="Categoria"
              value={editing.category ?? ""}
              onChange={(e) =>
                setEditing({ ...editing, category: e.target.value })
              }
              className="w-full border rounded-md px-3 py-2"
            />
            <textarea
              placeholder="Descrição"
              value={editing.description ?? ""}
              onChange={(e) =>
                setEditing({ ...editing, description: e.target.value })
              }
              className="w-full border rounded-md px-3 py-2"
            />
            <div className="grid grid-cols-2 gap-2">
              <label className="text-sm">
                Preço (centavos)
                <input
                  type="number"
                  min={0}
                  value={editing.priceCents ?? 0}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      priceCents: Number(e.target.value),
                    })
                  }
                  className="w-full border rounded-md px-3 py-2 mt-1"
                />
              </label>
              <label className="text-sm">
                Estoque
                <input
                  type="number"
                  min={0}
                  value={editing.stockQty ?? 0}
                  onChange={(e) =>
                    setEditing({ ...editing, stockQty: Number(e.target.value) })
                  }
                  className="w-full border rounded-md px-3 py-2 mt-1"
                />
              </label>
            </div>
            <input
              placeholder="URL da imagem (opcional)"
              value={editing.imageUrl ?? ""}
              onChange={(e) =>
                setEditing({ ...editing, imageUrl: e.target.value })
              }
              className="w-full border rounded-md px-3 py-2"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.available ?? true}
                onChange={(e) =>
                  setEditing({ ...editing, available: e.target.checked })
                }
              />
              Disponível no catálogo
            </label>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEditing(null)}
                className="px-3 py-2 rounded border"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="px-3 py-2 rounded bg-emerald-600 text-white disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
