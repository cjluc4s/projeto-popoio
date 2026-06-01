import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  try {
    products = await prisma.product.findMany({
      where: { available: true },
      orderBy: { name: "asc" },
    });
  } catch {
    // banco ainda não configurado
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-1">Nosso catálogo</h1>
      <p className="text-stone-600 mb-6 text-sm">
        Escolha seus produtos e finalize o pedido pelo WhatsApp.
      </p>

      {products.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center text-stone-500">
          Nenhum produto cadastrado ainda.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
