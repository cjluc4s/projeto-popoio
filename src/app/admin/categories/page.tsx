import { prisma } from "@/lib/db";
import { AdminCategoriesClient, type CategoryItem } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  const items: CategoryItem[] = categories.map((c) => ({
      id: c.id,
      name: c.name,
      sortOrder: c.sortOrder,
      productCount: c._count.products,
      orphan: false,
    }));

  return <AdminCategoriesClient initial={items} />;
}
