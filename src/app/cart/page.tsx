"use client";

import Link from "next/link";
import { useCart, cartStore } from "@/lib/cart-store";
import { formatBRL } from "@/lib/format";
import Image from "next/image";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const total = items.reduce((a, i) => a + i.priceCents * i.qty, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Seu carrinho</h1>

      {items.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center text-stone-500">
          Seu carrinho está vazio.{" "}
          <Link href="/" className="text-[var(--brand-dark)] underline">
            Ver produtos
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          <ul className="flex-1 bg-white rounded-lg border divide-y">
            {items.map((i) => (
              <li key={i.productId} className="p-3 flex gap-3 items-center">
                <div className="relative w-16 h-16 bg-stone-100 rounded shrink-0">
                  {i.imageUrl ? (
                    <Image
                      src={i.imageUrl}
                      alt={i.name}
                      fill
                      sizes="64px"
                      className="object-cover rounded"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-2xl">
                      🥛
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{i.name}</p>
                  <p className="text-sm text-stone-500">
                    {formatBRL(i.priceCents)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => cartStore.setQty(i.productId, i.qty - 1)}
                    className="w-8 h-8 border rounded text-lg"
                  >
                    −
                  </button>
                  <span className="w-6 text-center">{i.qty}</span>
                  <button
                    onClick={() => cartStore.setQty(i.productId, i.qty + 1)}
                    className="w-8 h-8 border rounded text-lg"
                  >
                    +
                  </button>
                </div>
                <p className="w-20 text-right font-semibold hidden sm:block">
                  {formatBRL(i.priceCents * i.qty)}
                </p>
                <button
                  onClick={() => cartStore.remove(i.productId)}
                  className="text-red-600 text-sm hover:underline"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>

          <aside className="lg:w-80 bg-white border rounded-lg p-4 h-fit space-y-3">
            <div className="flex justify-between text-lg">
              <span>Total</span>
              <span className="font-bold">{formatBRL(total)}</span>
            </div>
            <Link
              href="/checkout"
              className="block text-center bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white font-medium rounded-md py-3"
            >
              Finalizar pedido
            </Link>
            <Link
              href="/"
              className="block text-center text-[var(--brand-dark)] text-sm hover:underline"
            >
              Continuar comprando
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
