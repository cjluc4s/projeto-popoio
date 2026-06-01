import { prisma } from "@/lib/db";
import { AdminProductsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return <AdminProductsClient initial={products} />;
}
