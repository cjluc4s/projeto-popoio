"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface CategoryItem {
  id: string;
  name: string;
  sortOrder: number;
  productCount: number;
  orphan: boolean;
}

export function AdminCategoriesClient({ initial }: { initial: CategoryItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<Partial<CategoryItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function open(c?: CategoryItem) {
    setError(null);
    if (c && !c.orphan) {
      setEditing({ ...c });
    } else if (c?.orphan) {
      // Promover órfã: pré-preenche o nome
      setEditing({ name: c.name, sortOrder: 0 });
    } else {
      setEditing({ name: "", sortOrder: 0 });
    }
  }

  async function save() {
    if (!editing?.name?.trim()) {
      setError("Informe o nome.");
      return;
    }
    setSaving(true);
    const isUpdate = !!editing.id && !editing.id.startsWith("orphan:");
    const res = await fetch(
      isUpdate ? `/api/categories/${editing.id}` : "/api/categories",
      {
        method: isUpdate ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editing.name.trim(),
          sortOrder: Number(editing.sortOrder ?? 0),
        }),
      },
    );
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d?.error || "Erro ao salvar.");
      return;
    }
    setEditing(null);
    router.refresh();
  }

  async function remove(c: CategoryItem) {
    if (c.orphan) {
      if (!confirm(`Limpar a categoria "${c.name}" de ${c.productCount} produto(s)?`)) return;
      // Não há row para deletar; só atualiza produtos
      const r = await fetch("/api/products/bulk-clear-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: c.name }),
      });
      if (!r.ok) {
        alert("Erro ao limpar categoria.");
        return;
      }
      setItems((arr) => arr.filter((x) => x.id !== c.id));
      router.refresh();
      return;
    }

    let qs = "";
    if (c.productCount > 0) {
      const choice = confirm(
        `Esta categoria tem ${c.productCount} produto(s).\n\n` +
          `OK = excluir e remover a categoria desses produtos.\n` +
          `Cancelar = manter os produtos sem alterar (eles ficarão como "Outros").`,
      );
      qs = `?products=${choice ? "clear" : "keep"}`;
    } else {
      if (!confirm(`Excluir a categoria "${c.name}"?`)) return;
    }
    const res = await fetch(`/api/categories/${c.id}${qs}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d?.error || "Erro ao excluir.");
      return;
    }
    setItems((arr) => arr.filter((x) => x.id !== c.id));
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Categorias</h1>
          <p className="text-sm text-stone-500">
            Cadastre as categorias usadas nos produtos.
          </p>
        </div>
        <button
          onClick={() => open()}
          className="bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white px-3 py-2 rounded-md text-sm font-medium"
        >
          + Nova categoria
        </button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-100 text-left">
            <tr>
              <th className="p-2">Nome</th>
              <th className="p-2 w-24 text-center">Ordem</th>
              <th className="p-2 w-32 text-center">Produtos</th>
              <th className="p-2 w-40"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{c.name}</span>
                    {c.orphan && (
                      <span
                        title="Categoria usada em produtos mas não cadastrada"
                        className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold"
                      >
                        não cadastrada
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-2 text-center">{c.orphan ? "—" : c.sortOrder}</td>
                <td className="p-2 text-center">{c.productCount}</td>
                <td className="p-2 text-right space-x-2 whitespace-nowrap">
                  <button
                    onClick={() => open(c)}
                    className="text-[var(--brand-dark)] hover:underline"
                  >
                    {c.orphan ? "Cadastrar" : "Editar"}
                  </button>
                  <button
                    onClick={() => remove(c)}
                    className="text-red-600 hover:underline"
                  >
                    {c.orphan ? "Limpar" : "Excluir"}
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-stone-500">
                  Nenhuma categoria cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">
                {editing.id && !editing.id.startsWith("orphan:")
                  ? "Editar categoria"
                  : "Nova categoria"}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="text-stone-500 hover:text-stone-800 text-xl leading-none"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">
                Nome <span className="text-red-600">*</span>
              </label>
              <input
                value={editing.name ?? ""}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="Ex.: Laticínios"
                className="w-full border border-stone-300 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/30 outline-none rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">
                Ordem de exibição
              </label>
              <input
                type="number"
                value={editing.sortOrder ?? 0}
                onChange={(e) =>
                  setEditing({ ...editing, sortOrder: Number(e.target.value) })
                }
                className="w-full border border-stone-300 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/30 outline-none rounded-md px-3 py-2"
              />
              <p className="text-xs text-stone-500 mt-1">
                Menor valor aparece primeiro.
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm px-3 py-2">
                {error}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-md border border-stone-300 hover:bg-stone-50 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="px-4 py-2 rounded-md bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white text-sm font-semibold disabled:opacity-60"
              >
                {saving ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
