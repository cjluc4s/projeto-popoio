"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/lib/cart-store";

export function NavBar() {
  const { data: session } = useSession();
  const count = useCart((s) => s.items.reduce((a, i) => a + i.qty, 0));

  return (
    <header className="sticky top-0 z-40 bg-emerald-700 text-white shadow">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="font-bold text-lg sm:text-xl truncate">
          Laticínios Popóio
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4 text-sm">
          <Link href="/" className="hover:underline hidden sm:inline">
            Produtos
          </Link>
          <Link href="/cart" className="relative hover:underline">
            Carrinho
            {count > 0 && (
              <span className="ml-1 inline-flex items-center justify-center bg-yellow-400 text-emerald-900 text-xs font-bold rounded-full h-5 min-w-5 px-1">
                {count}
              </span>
            )}
          </Link>
          {session?.user ? (
            <>
              {session.user.isAdmin && (
                <Link href="/admin" className="hover:underline">
                  Admin
                </Link>
              )}
              <Link href="/orders" className="hover:underline hidden sm:inline">
                Pedidos
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hover:underline"
              >
                Sair
              </button>
            </>
          ) : (
            <Link href="/login" className="hover:underline">
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
