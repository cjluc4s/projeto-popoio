"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCart, cartStore } from "@/lib/cart-store";
import { formatBRL } from "@/lib/format";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type DeliveryResult = {
  ok: boolean;
  distanceKm: number;
  radiusKm: number;
  address?: string;
  cep: string;
  feeCents: number;
  windowLabel: string;
};

function maskCep(v: string) {
  const d = v.replace(/\D+/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const items = useCart((s) => s.items);
  const subtotal = items.reduce((a, i) => a + i.priceCents * i.qty, 0);
  const [notes, setNotes] = useState("");
  const [cep, setCep] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryResult, setDeliveryResult] = useState<DeliveryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "loading") return <p>Carregando...</p>;

  if (!session?.user) {
    return (
      <div className="max-w-md mx-auto bg-white border rounded-lg p-6 text-center space-y-3">
        <p>Você precisa entrar para finalizar o pedido.</p>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent("/checkout")}`}
          className="inline-block bg-[var(--brand)] text-white px-4 py-2 rounded-md"
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
        <Link href="/" className="underline text-[var(--brand-dark)]">
          Ver produtos
        </Link>
      </p>
    );
  }

  async function validateDelivery() {
    setError(null);
    setDeliveryResult(null);
    setDeliveryLoading(true);
    const res = await fetch("/api/delivery-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cep,
        number,
        complement,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setDeliveryLoading(false);
    if (!res.ok) {
      setError(data.error || "Não foi possível validar o endereço.");
      return;
    }
    if (!data.ok) {
      setError(
        `Endereço fora da área de entrega (${Number(data.distanceKm).toLocaleString("pt-BR")} km).`,
      );
      return;
    }
    setDeliveryResult(data);
  }

  async function finalize() {
    if (!deliveryResult?.ok) {
      setError("Valide o endereço de entrega antes de finalizar.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        notes,
        delivery: {
          cep,
          number,
          complement,
        },
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
      totalCents: order.totalCents,
      notes:
        `${notes ? `${notes}\n` : ""}` +
        `Entrega: ${deliveryResult.address || "endereço validado"} | CEP ${deliveryResult.cep} | Janela ${deliveryResult.windowLabel}`,
    });
    cartStore.clear();
    window.open(url, "_blank");
    router.push(`/orders/${order.id}`);
  }

  const total = subtotal + (deliveryResult?.feeCents ?? 0);

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
        <span>Subtotal</span>
        <span>{formatBRL(subtotal)}</span>
      </div>
      <div className="space-y-2 border rounded-md p-3">
        <p className="text-sm font-semibold text-stone-700">Endereço de entrega</p>
        <div className="grid grid-cols-3 gap-2">
          <input
            value={cep}
            onChange={(e) => {
              setCep(maskCep(e.target.value));
              setDeliveryResult(null);
            }}
            placeholder="CEP"
            className="col-span-1 border rounded-md px-3 py-2"
          />
          <input
            value={number}
            onChange={(e) => {
              setNumber(e.target.value);
              setDeliveryResult(null);
            }}
            placeholder="Número"
            className="col-span-1 border rounded-md px-3 py-2"
          />
          <input
            value={complement}
            onChange={(e) => {
              setComplement(e.target.value);
              setDeliveryResult(null);
            }}
            placeholder="Complemento"
            className="col-span-1 border rounded-md px-3 py-2"
          />
        </div>
        <button
          type="button"
          onClick={validateDelivery}
          disabled={deliveryLoading || !cep || !number}
          className="w-full sm:w-auto bg-stone-900 text-white rounded-md px-4 py-2 disabled:opacity-60"
        >
          {deliveryLoading ? "Validando..." : "Validar entrega"}
        </button>
        {deliveryResult?.ok && (
          <div className="rounded-md bg-emerald-50 border border-emerald-200 p-2 text-sm text-emerald-800">
            <p>Endereço validado: {deliveryResult.address || deliveryResult.cep}</p>
            <p>Taxa: {formatBRL(deliveryResult.feeCents)} • Janela: {deliveryResult.windowLabel}</p>
          </div>
        )}
      </div>
      <div className="flex justify-between text-sm text-stone-600">
        <span>Taxa de entrega</span>
        <span>{formatBRL(deliveryResult?.feeCents ?? 0)}</span>
      </div>
      <div className="flex justify-between font-bold text-lg border-t pt-2">
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
        disabled={loading || !deliveryResult?.ok}
        className="w-full bg-[var(--brand)] hover:bg-[var(--brand-dark)] disabled:opacity-60 text-white font-medium rounded-md py-3"
      >
        {loading ? "Enviando..." : "Confirmar e enviar via WhatsApp"}
      </button>
    </div>
  );
}
