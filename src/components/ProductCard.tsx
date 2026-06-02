"use client";

import { cartStore } from "@/lib/cart-store";
import { formatBRL } from "@/lib/format";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  priceCents: number;
  description: string | null;
  category: string | null;
  stockQty: number;
  imageUrl: string | null;
};

const categoryEmoji: Record<string, string> = {
  Laticínios: "🥛",
  Padaria: "🥖",
  Hortifruti: "🥬",
  Mercearia: "🛒",
};

export function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stockQty <= 0;
  const emoji = (product.category && categoryEmoji[product.category]) ?? "🧺";

  return (
    <div className="group bg-[var(--surface)] rounded-xl border border-stone-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition flex flex-col overflow-hidden">
      <div className="relative aspect-square bg-gradient-to-br from-[var(--butter)]/30 via-white to-[var(--brand)]/10">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width:640px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-6xl select-none">
            <span aria-hidden>{emoji}</span>
          </div>
        )}
        {product.category && (
          <span className="absolute top-2 left-2 bg-white/90 backdrop-blur text-[var(--brand-dark)] text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 shadow">
            {product.category}
          </span>
        )}
        {outOfStock && (
          <span className="absolute top-2 right-2 bg-[var(--brand-dark)] text-white text-[10px] font-bold uppercase rounded-full px-2 py-0.5 shadow">
            Esgotado
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1 gap-2">
        <h3 className="font-semibold text-sm sm:text-base text-stone-800 line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <p className="text-[var(--brand-dark)] font-bold text-lg">
          {formatBRL(product.priceCents)}
        </p>
        <button
          disabled={outOfStock}
          onClick={() =>
            cartStore.add({
              productId: product.id,
              name: product.name,
              priceCents: product.priceCents,
              imageUrl: product.imageUrl,
            })
          }
          className="mt-auto bg-[var(--brand)] hover:bg-[var(--brand-dark)] disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg py-2 transition shadow-sm flex items-center justify-center gap-1.5"
        >
          <span aria-hidden>＋</span>
          {outOfStock ? "Sem estoque" : "Adicionar"}
        </button>
      </div>
    </div>
  );
}
