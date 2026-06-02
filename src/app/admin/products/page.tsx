import { prisma } from "@/lib/db";
import { AdminProductsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);
  return (
    <AdminProductsClient
      initial={products}
      categories={categories.map((c) => c.name)}
    />
  );
}
