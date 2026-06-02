"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/lib/cart-store";

export function NavBar() {
  const { data: session } = useSession();
  const count = useCart((s) => s.items.reduce((a, i) => a + i.qty, 0));

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[var(--brand-dark)] via-[var(--brand)] to-[var(--brand-dark)] text-white shadow-lg">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 truncate">
          <span
            aria-hidden
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--butter)] text-[var(--brand-dark)] text-xl shadow-sm"
          >
            🥛
          </span>
          <span className="logo-wordmark text-lg sm:text-xl">
            Laticínios <span className="accent">Popoio</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 text-sm">
          <Link
            href="/"
            className="px-2 py-1 rounded hover:bg-white/10 hidden sm:inline"
          >
            Produtos
          </Link>
          <Link
            href="/cart"
            className="relative px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 font-medium flex items-center gap-1"
          >
            <span aria-hidden>🛒</span>
            <span className="hidden sm:inline">Carrinho</span>
            {count > 0 && (
              <span className="inline-flex items-center justify-center bg-[var(--accent)] text-white text-xs font-bold rounded-full h-5 min-w-5 px-1 shadow">
                {count}
              </span>
            )}
          </Link>
          {session?.user ? (
            <>
              {session.user.isAdmin && (
                <Link
                  href="/admin"
                  className="px-2 py-1 rounded hover:bg-white/10"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/orders"
                className="px-2 py-1 rounded hover:bg-white/10 hidden sm:inline"
              >
                Pedidos
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-2 py-1 rounded hover:bg-white/10"
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-full bg-[var(--butter)] text-[var(--brand-dark)] font-semibold hover:brightness-95"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
