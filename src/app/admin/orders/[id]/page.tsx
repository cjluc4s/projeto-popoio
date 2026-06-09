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

const statusLabel: Record<string, string> = {
  pending: "Criado",
  preparing: "Confirmado",
  ready: "Em rota",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      statusEvents: {
        orderBy: { createdAt: "desc" },
        include: { changedByUser: { select: { name: true, email: true } } },
      },
    },
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
        <span>Subtotal</span>
        <span>{formatBRL(order.subtotalCents)}</span>
      </div>
      <div className="flex justify-between text-sm text-stone-600">
        <span>Taxa de entrega</span>
        <span>{formatBRL(order.deliveryFeeCents)}</span>
      </div>
      <div className="flex justify-between font-bold text-lg border-t pt-2">
        <span>Total</span>
        <span>{formatBRL(order.totalCents)}</span>
      </div>

      <div className="text-sm border rounded p-3 space-y-1">
        <p className="font-semibold text-stone-700">Entrega</p>
        {order.deliveryAddress && (
          <p>
            <span className="text-stone-500">Endereço:</span> {order.deliveryAddress}
          </p>
        )}
        {order.deliveryCep && (
          <p>
            <span className="text-stone-500">CEP:</span> {order.deliveryCep}
          </p>
        )}
        {order.deliveryDistanceKm !== null && (
          <p>
            <span className="text-stone-500">Distância:</span> {order.deliveryDistanceKm.toLocaleString("pt-BR")} km
          </p>
        )}
        {order.deliveryWindowLabel && (
          <p>
            <span className="text-stone-500">Janela:</span> {order.deliveryWindowLabel}
          </p>
        )}
      </div>

      {order.notes && (
        <div className="text-sm border-t pt-3">
          <span className="text-stone-500">Observações: </span>
          {order.notes}
        </div>
      )}

      <StatusEditor orderId={order.id} initial={order.status} />

      <div className="border-t pt-3 space-y-2">
        <p className="text-sm font-semibold text-stone-700">Histórico de status</p>
        <ul className="space-y-2">
          {order.statusEvents.map((ev) => (
            <li key={ev.id} className="text-sm border rounded-md p-2">
              <p className="font-medium">
                {ev.fromStatus ? `${statusLabel[ev.fromStatus]} → ` : ""}
                {statusLabel[ev.toStatus]}
              </p>
              <p className="text-stone-500 text-xs">
                {new Date(ev.createdAt).toLocaleString("pt-BR")}
                {ev.changedByUser?.name ? ` • por ${ev.changedByUser.name}` : ""}
              </p>
              {ev.note && <p className="text-stone-700 mt-1">{ev.note}</p>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
