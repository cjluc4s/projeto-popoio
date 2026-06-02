import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  try {
    products = await prisma.product.findMany({
      where: { available: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
  } catch {
    // banco ainda não configurado
  }

  const byCategory = products.reduce<Record<string, typeof products>>(
    (acc, p) => {
      const key = p.category ?? "Outros";
      (acc[key] ||= []).push(p);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--brand-dark)] via-[var(--brand)] to-[#e8523e] text-white shadow-lg">
        <div className="absolute inset-0 opacity-20 pointer-events-none select-none text-[10rem] leading-none">
          <span className="absolute -top-6 -right-4">🧀</span>
          <span className="absolute bottom-0 left-2">🥛</span>
        </div>
        <div className="relative px-6 py-10 sm:px-10 sm:py-14 max-w-2xl">
          <span className="inline-block bg-[var(--butter)] text-[var(--brand-dark)] text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1 mb-3">
            Direto da Mooca
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
            <span className="text-[var(--butter)]">Tradição</span> na Mooca há mais de 45 anos.
          </h1>
          <p className="mt-3 text-white/90 sm:text-lg max-w-xl">
            Laticínios fresquinhos e produtos de mercearia selecionados com
            carinho. Faça seu pedido em minutos e receba a confirmação direto
            pelo WhatsApp.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <a
              href="#catalogo"
              className="bg-[var(--butter)] text-[var(--brand-dark)] font-semibold px-4 py-2 rounded-full hover:brightness-95 shadow"
            >
              Ver produtos
            </a>
            <Link
              href="/entrega"
              className="bg-white/15 hover:bg-white/25 backdrop-blur px-4 py-2 rounded-full transition inline-flex items-center gap-1.5"
              title="Verifique se entregamos no seu endereço"
            >
              🚚 Entregamos na região da Mooca e proximidades
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Faixa de destaques */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        {[
          { icon: "🥛", label: "Laticínios frescos" },
          { icon: "�", label: "Queijos selecionados" },
          { icon: "🥬", label: "Hortifruti" },
          { icon: "📱", label: "Pedido via WhatsApp" },
        ].map((b) => (
          <div
            key={b.label}
            className="bg-white border border-stone-200 rounded-xl p-3 shadow-sm"
          >
            <div className="text-2xl">{b.icon}</div>
            <div className="text-xs sm:text-sm font-medium text-stone-700 mt-1">
              {b.label}
            </div>
          </div>
        ))}
      </section>

      {/* Catálogo */}
      <section id="catalogo" className="space-y-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--brand-dark)]">
              Nosso catálogo
            </h2>
            <p className="text-stone-600 text-sm">
              Escolha seus produtos e finalize o pedido pelo WhatsApp.
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-white border border-dashed border-stone-300 rounded-xl p-10 text-center text-stone-500">
            <div className="text-4xl mb-2">🧺</div>
            Nenhum produto cadastrado ainda.
          </div>
        ) : (
          Object.entries(byCategory).map(([category, list]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-semibold text-stone-700 border-l-4 border-[var(--accent)] pl-3">
                {category}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {list.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
