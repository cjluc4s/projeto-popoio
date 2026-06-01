"use client";

import { cartStore } from "@/lib/cart-store";
import { formatBRL } from "@/lib/format";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  priceCents: number;
  description: string | null;
  stockQty: number;
  imageUrl: string | null;
};

export function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stockQty <= 0;
  return (
    <div className="bg-white rounded-lg border shadow-sm flex flex-col overflow-hidden">
      <div className="relative aspect-square bg-stone-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width:640px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-stone-300 text-4xl">
            🥛
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1 gap-2">
        <h3 className="font-medium text-sm sm:text-base line-clamp-2">
          {product.name}
        </h3>
        <p className="text-emerald-700 font-bold">
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
          className="mt-auto bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white text-sm font-medium rounded-md py-2 transition"
        >
          {outOfStock ? "Sem estoque" : "Adicionar"}
        </button>
      </div>
    </div>
  );
}
