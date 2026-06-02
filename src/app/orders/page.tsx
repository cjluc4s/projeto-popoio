import { redirect } from "next/navigation";
import Link from "next/link";
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

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Meus pedidos</h1>
      {orders.length === 0 ? (
        <p className="text-stone-500">Você ainda não fez nenhum pedido.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="bg-white border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <Link
                    href={`/orders/${o.id}`}
                    className="font-mono text-sm text-[var(--brand-dark)] hover:underline"
                  >
                    #{o.id.slice(-8)}
                  </Link>
                  <p className="text-xs text-stone-500">
                    {new Date(o.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatBRL(o.totalCents)}</p>
                  <span className="text-xs bg-stone-200 px-2 py-0.5 rounded">
                    {statusLabel[o.status]}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
