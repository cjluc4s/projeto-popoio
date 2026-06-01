import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/format";

export const dynamic = "force-dynamic";

interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  priceCents: number;
}

export default async function AdminDashboard() {
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const [totalOrders, ordersWeek, revenueAgg, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: since } } }),
    prisma.order.aggregate({
      _sum: { totalCents: true },
      where: { status: { not: "cancelled" } },
    }),
    prisma.order.findMany({
      take: 30,
      orderBy: { createdAt: "desc" },
      where: { createdAt: { gte: since } },
    }),
  ]);

  const productCount = new Map<string, { name: string; qty: number }>();
  for (const o of recentOrders) {
    for (const it of o.items as unknown as OrderItem[]) {
      const cur = productCount.get(it.productId) ?? { name: it.name, qty: 0 };
      cur.qty += it.qty;
      productCount.set(it.productId, cur);
    }
  }
  const topProducts = [...productCount.values()]
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const ordersByDay = new Map<string, number>();
  for (const o of recentOrders) {
    const day = o.createdAt.toISOString().slice(0, 10);
    ordersByDay.set(day, (ordersByDay.get(day) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card label="Pedidos (total)" value={totalOrders.toString()} />
        <Card label="Pedidos (7 dias)" value={ordersWeek.toString()} />
        <Card
          label="Receita total"
          value={formatBRL(revenueAgg._sum.totalCents ?? 0)}
        />
      </div>

      <section className="bg-white border rounded-lg p-4">
        <h2 className="font-semibold mb-3">Top produtos (7 dias)</h2>
        {topProducts.length === 0 ? (
          <p className="text-sm text-stone-500">Sem vendas no período.</p>
        ) : (
          <ul className="divide-y text-sm">
            {topProducts.map((p) => (
              <li key={p.name} className="py-2 flex justify-between">
                <span>{p.name}</span>
                <span className="font-semibold">{p.qty}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white border rounded-lg p-4">
        <h2 className="font-semibold mb-3">Pedidos por dia (7 dias)</h2>
        {ordersByDay.size === 0 ? (
          <p className="text-sm text-stone-500">Sem pedidos.</p>
        ) : (
          <ul className="text-sm divide-y">
            {[...ordersByDay.entries()]
              .sort((a, b) => (a[0] < b[0] ? 1 : -1))
              .map(([day, count]) => (
                <li key={day} className="py-2 flex justify-between">
                  <span>{new Date(day).toLocaleDateString("pt-BR")}</span>
                  <span className="font-semibold">{count}</span>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <p className="text-xs text-stone-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
