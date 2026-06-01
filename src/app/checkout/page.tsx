"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCart, cartStore } from "@/lib/cart-store";
import { formatBRL } from "@/lib/format";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const items = useCart((s) => s.items);
  const total = items.reduce((a, i) => a + i.priceCents * i.qty, 0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "loading") return <p>Carregando...</p>;

  if (!session?.user) {
    return (
      <div className="max-w-md mx-auto bg-white border rounded-lg p-6 text-center space-y-3">
        <p>Você precisa entrar para finalizar o pedido.</p>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent("/checkout")}`}
          className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-md"
        >
          Entrar / Cadastrar
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p>
        Seu carrinho está vazio.{" "}
        <Link href="/" className="underline text-emerald-700">
          Ver produtos
        </Link>
      </p>
    );
  }

  async function finalize() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        notes,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erro ao criar pedido");
      setLoading(false);
      return;
    }
    const order = await res.json();
    const url = buildWhatsAppUrl({
      orderId: order.id,
      customerName: session!.user.name || session!.user.email!,
      items: items.map((i) => ({
        name: i.name,
        qty: i.qty,
        priceCents: i.priceCents,
      })),
      totalCents: total,
      notes,
    });
    cartStore.clear();
    window.open(url, "_blank");
    router.push(`/orders/${order.id}`);
  }

  return (
    <div className="max-w-lg mx-auto bg-white border rounded-lg p-6 space-y-4">
      <h1 className="text-2xl font-bold">Finalizar pedido</h1>
      <div>
        <p className="text-sm text-stone-600">Cliente</p>
        <p className="font-medium">{session.user.name}</p>
        <p className="text-sm text-stone-500">{session.user.email}</p>
      </div>
      <ul className="border rounded divide-y text-sm">
        {items.map((i) => (
          <li key={i.productId} className="p-2 flex justify-between">
            <span>
              {i.qty}x {i.name}
            </span>
            <span>{formatBRL(i.priceCents * i.qty)}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between font-bold text-lg">
        <span>Total</span>
        <span>{formatBRL(total)}</span>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Observações (opcional): endereço de entrega, troco, etc."
        className="w-full border rounded-md px-3 py-2 min-h-20"
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        onClick={finalize}
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium rounded-md py-3"
      >
        {loading ? "Enviando..." : "Confirmar e enviar via WhatsApp"}
      </button>
    </div>
  );
}
