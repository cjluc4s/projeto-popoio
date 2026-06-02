"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatBRL } from "@/lib/format";

interface Product {
  id: string;
  name: string;
  priceCents: number;
  description: string | null;
  category: string | null;
  barcode: string | null;
  stockQty: number;
  available: boolean;
  imageUrl: string | null;
}

type Draft = Partial<Product>;

function parseBRLToCents(input: string): number {
  const onlyDigits = input.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = parseFloat(onlyDigits);
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
}

function centsToBRLInput(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function AdminProductsClient({ initial }: { initial: Product[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [priceInput, setPriceInput] = useState("0,00");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function open(prod?: Product) {
    if (prod) {
      setEditing({ ...prod });
      setPriceInput(centsToBRLInput(prod.priceCents));
    } else {
      setEditing({
        name: "",
        priceCents: 0,
        stockQty: 0,
        available: true,
        category: "",
        description: "",
        imageUrl: "",
        barcode: "",
      });
      setPriceInput("0,00");
    }
    setUploadError(null);
    setFormError(null);
  }

  function close() {
    setEditing(null);
    setUploadError(null);
    setFormError(null);
  }

  async function handleFile(file: File) {
    setUploadError(null);
    if (!file.type.startsWith("image/")) {
      setUploadError("Selecione um arquivo de imagem.");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await r.json();
      if (!r.ok) {
        setUploadError(data?.error || "Falha no upload.");
      } else {
        setEditing((d) => (d ? { ...d, imageUrl: data.url } : d));
      }
    } catch {
      setUploadError("Falha de rede no upload.");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!editing) return;
    setFormError(null);

    if (!editing.name?.trim()) {
      setFormError("Informe o nome do produto.");
      return;
    }
    const priceCents = parseBRLToCents(priceInput);
    if (priceCents <= 0) {
      setFormError("Informe um preço válido.");
      return;
    }

    setSaving(true);
    const isUpdate = !!editing.id;
    const url = isUpdate ? `/api/products/${editing.id}` : "/api/products";
    const method = isUpdate ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editing.name?.trim(),
        priceCents,
        category: editing.category?.trim() || null,
        description: editing.description?.trim() || null,
        barcode: editing.barcode?.trim() || null,
        available: editing.available ?? true,
        imageUrl: editing.imageUrl || null,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setFormError(data?.error || "Erro ao salvar o produto.");
      return;
    }
    const saved = (await res.json()) as Product;
    setItems((arr) =>
      isUpdate ? arr.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...arr],
    );
    close();
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

  async function toggleAvailable(p: Product) {
    const newAvail = !p.available;
    const res = await fetch(`/api/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: newAvail }),
    });
    if (res.ok) {
      const saved = (await res.json()) as Product;
      setItems((arr) => arr.map((it) => (it.id === saved.id ? saved : it)));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <button
          onClick={() => open()}
          className="bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white px-3 py-2 rounded-md text-sm font-medium"
        >
          + Novo produto
        </button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-100 text-left">
            <tr>
              <th className="p-2">Produto</th>
              <th className="p-2 hidden sm:table-cell">Categoria</th>
              <th className="p-2 hidden md:table-cell">Cód. barras</th>
              <th className="p-2">Preço</th>
              <th className="p-2">Status</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t align-middle">
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    {p.imageUrl ? (
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded object-cover bg-stone-100"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded bg-stone-100 grid place-items-center text-stone-400 text-xs">
                        —
                      </div>
                    )}
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="p-2 hidden sm:table-cell">{p.category ?? "-"}</td>
                <td className="p-2 hidden md:table-cell font-mono text-xs">
                  {p.barcode ?? "-"}
                </td>
                <td className="p-2">{formatBRL(p.priceCents)}</td>
                <td className="p-2">
                  <button
                    onClick={() => toggleAvailable(p)}
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full transition ${
                      p.available
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                    }`}
                    title="Clique para alternar"
                  >
                    {p.available ? "Ativo" : "Sem estoque"}
                  </button>
                </td>
                <td className="p-2 text-right space-x-2 whitespace-nowrap">
                  <button
                    onClick={() => open(p)}
                    className="text-[var(--brand-dark)] hover:underline"
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
                <td colSpan={6} className="p-6 text-center text-stone-500">
                  Nenhum produto cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-xl w-full space-y-4 my-auto shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">
                {editing.id ? "Editar produto" : "Novo produto"}
              </h2>
              <button
                onClick={close}
                className="text-stone-500 hover:text-stone-800 text-xl leading-none"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            {/* Upload de imagem */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">
                Imagem do produto
              </label>
              <div className="flex items-start gap-3">
                <div className="h-24 w-24 rounded-lg bg-stone-100 border border-stone-200 grid place-items-center overflow-hidden shrink-0">
                  {editing.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={editing.imageUrl}
                      alt="Pré-visualização"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-stone-400 text-xs text-center px-1">
                      Sem imagem
                    </span>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                      e.target.value = "";
                    }}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="text-sm bg-white border border-stone-300 hover:bg-stone-50 px-3 py-1.5 rounded-md disabled:opacity-60"
                    >
                      {uploading ? "Enviando…" : editing.imageUrl ? "Trocar imagem" : "Enviar imagem"}
                    </button>
                    {editing.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setEditing({ ...editing, imageUrl: "" })}
                        className="text-sm text-red-600 hover:underline px-2 py-1.5"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-stone-500">
                    JPG, PNG ou WEBP. Até 4 MB.
                  </p>
                  {uploadError && (
                    <p className="text-xs text-red-600">{uploadError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Nome */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">
                Nome <span className="text-red-600">*</span>
              </label>
              <input
                placeholder="Ex.: Mussarela fatiada 150g"
                value={editing.name ?? ""}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="w-full border border-stone-300 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/30 outline-none rounded-md px-3 py-2"
              />
            </div>

            {/* Categoria + Código de barras */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">
                  Categoria
                </label>
                <input
                  placeholder="Ex.: Laticínios"
                  value={editing.category ?? ""}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="w-full border border-stone-300 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/30 outline-none rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">
                  Código de barras
                </label>
                <input
                  inputMode="numeric"
                  placeholder="EAN/GTIN"
                  value={editing.barcode ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      barcode: e.target.value.replace(/\s+/g, ""),
                    })
                  }
                  className="w-full border border-stone-300 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/30 outline-none rounded-md px-3 py-2 font-mono"
                />
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">
                Descrição
              </label>
              <textarea
                placeholder="Detalhes do produto"
                rows={3}
                value={editing.description ?? ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="w-full border border-stone-300 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/30 outline-none rounded-md px-3 py-2"
              />
            </div>

            {/* Preço */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">
                Preço (R$) <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">
                  R$
                </span>
                <input
                  inputMode="decimal"
                  placeholder="0,00"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  onBlur={() => setPriceInput(centsToBRLInput(parseBRLToCents(priceInput)))}
                  className="w-full border border-stone-300 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/30 outline-none rounded-md pl-10 pr-3 py-2"
                />
              </div>
            </div>

            {/* Disponibilidade */}
            <label className="flex items-start gap-2 text-sm bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={editing.available ?? true}
                onChange={(e) => setEditing({ ...editing, available: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-stone-400 text-[var(--brand)] focus:ring-[var(--brand)]/40"
              />
              <span>
                <strong>Disponível no catálogo</strong>
                <span className="block text-xs text-stone-500">
                  Marque enquanto houver estoque. Quando o estoque acabar,
                  desmarque para ocultar o produto da loja.
                </span>
              </span>
            </label>

            {formError && (
              <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm px-3 py-2">
                {formError}
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={close}
                className="px-4 py-2 rounded-md border border-stone-300 hover:bg-stone-50 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={saving || uploading}
                className="px-4 py-2 rounded-md bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white text-sm font-semibold disabled:opacity-60"
              >
                {saving ? "Salvando…" : "Salvar produto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
