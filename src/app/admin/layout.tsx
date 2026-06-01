import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (!session.user.isAdmin) {
    return (
      <div className="bg-white border rounded-lg p-8 text-center">
        <h1 className="text-xl font-bold mb-2">Acesso restrito</h1>
        <p className="text-stone-600">Esta área é exclusiva para administradores.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-6">
      <aside className="sm:w-48 shrink-0">
        <nav className="bg-white border rounded-lg p-2 flex sm:flex-col gap-1 text-sm">
          <Link
            href="/admin"
            className="px-3 py-2 rounded hover:bg-stone-100"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className="px-3 py-2 rounded hover:bg-stone-100"
          >
            Produtos
          </Link>
          <Link
            href="/admin/orders"
            className="px-3 py-2 rounded hover:bg-stone-100"
          >
            Pedidos
          </Link>
        </nav>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
