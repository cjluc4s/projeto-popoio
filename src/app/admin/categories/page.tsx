import { prisma } from "@/lib/db";
import { AdminCategoriesClient, type CategoryItem } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [registered, usage] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.product.groupBy({
      by: ["category"],
      _count: { _all: true },
    }),
  ]);

  const countByName = new Map<string, number>();
  for (const u of usage) {
    if (u.category) countByName.set(u.category, u._count._all);
  }
  const registeredNames = new Set(registered.map((c) => c.name));
  const orphan: CategoryItem[] = usage
    .map((u) => u.category)
    .filter((n): n is string => !!n && !registeredNames.has(n))
    .map((name) => ({
      id: `orphan:${name}`,
      name,
      sortOrder: 9999,
      productCount: countByName.get(name) ?? 0,
      orphan: true,
    }));
  const items: CategoryItem[] = [
    ...registered.map((c) => ({
      id: c.id,
      name: c.name,
      sortOrder: c.sortOrder,
      productCount: countByName.get(c.name) ?? 0,
      orphan: false,
    })),
    ...orphan,
  ];

  return <AdminCategoriesClient initial={items} />;
}
