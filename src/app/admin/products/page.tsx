import { prisma } from "@/lib/db";
import { AdminProductsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);
  return (
    <AdminProductsClient
      initial={products.map((p) => ({
        ...p,
        category: p.category?.name ?? null,
      }))}
      categories={categories.map((c) => c.name)}
    />
  );
}
