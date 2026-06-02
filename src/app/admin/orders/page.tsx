import Link from "next/link";
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

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, phone: true } } },
    take: 100,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pedidos</h1>
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-100 text-left">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Cliente</th>
              <th className="p-2 hidden sm:table-cell">Data</th>
              <th className="p-2">Total</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-2 font-mono">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="text-[var(--brand-dark)] hover:underline"
                  >
                    #{o.id.slice(-8)}
                  </Link>
                </td>
                <td className="p-2">{o.user.name}</td>
                <td className="p-2 hidden sm:table-cell">
                  {new Date(o.createdAt).toLocaleString("pt-BR")}
                </td>
                <td className="p-2">{formatBRL(o.totalCents)}</td>
                <td className="p-2">
                  <span className="text-xs bg-stone-200 px-2 py-0.5 rounded">
                    {statusLabel[o.status]}
                  </span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-stone-500">
                  Nenhum pedido ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
