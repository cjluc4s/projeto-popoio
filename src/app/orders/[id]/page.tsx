import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/format";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  pending: "Pendente",
  preparing: "Em preparo",
  ready: "Pronto",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  priceCents: number;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/login?callbackUrl=/orders/${id}`);

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) notFound();
  if (!session.user.isAdmin && order.userId !== session.user.id) notFound();

  const items = order.items as unknown as OrderItem[];

  return (
    <div className="max-w-lg mx-auto bg-white border rounded-lg p-6 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold">Pedido</h1>
          <p className="font-mono text-sm text-stone-500">#{order.id}</p>
        </div>
        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
          {statusLabel[order.status]}
        </span>
      </div>
      <p className="text-sm text-stone-500">
        {new Date(order.createdAt).toLocaleString("pt-BR")}
      </p>
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
        <div className="text-sm">
          <span className="text-stone-500">Observações: </span>
          {order.notes}
        </div>
      )}
    </div>
  );
}
