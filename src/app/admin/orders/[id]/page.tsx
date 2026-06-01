import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { StatusEditor } from "./status-editor";

export const dynamic = "force-dynamic";

interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  priceCents: number;
}

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!order) notFound();
  const items = order.items as unknown as OrderItem[];

  return (
    <div className="max-w-lg bg-white border rounded-lg p-6 space-y-3">
      <h1 className="text-xl font-bold">Pedido</h1>
      <p className="font-mono text-sm text-stone-500">#{order.id}</p>
      <p className="text-sm text-stone-500">
        {new Date(order.createdAt).toLocaleString("pt-BR")}
      </p>

      <div className="border rounded p-3 text-sm space-y-1">
        <p>
          <span className="text-stone-500">Cliente:</span> {order.user.name}
        </p>
        <p>
          <span className="text-stone-500">E-mail:</span> {order.user.email}
        </p>
        {order.user.phone && (
          <p>
            <span className="text-stone-500">Telefone:</span> {order.user.phone}
          </p>
        )}
        {order.user.address && (
          <p>
            <span className="text-stone-500">Endereço:</span> {order.user.address}
          </p>
        )}
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
        <span>{formatBRL(order.totalCents)}</span>
      </div>

      {order.notes && (
        <div className="text-sm border-t pt-3">
          <span className="text-stone-500">Observações: </span>
          {order.notes}
        </div>
      )}

      <StatusEditor orderId={order.id} initial={order.status} />
    </div>
  );
}
