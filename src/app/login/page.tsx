"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-sm mx-auto bg-white border rounded-lg p-6 mt-8">Carregando...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) setError("E-mail ou senha inválidos");
    else router.push(callbackUrl);
  }

  return (
    <div className="max-w-sm mx-auto bg-white border rounded-lg p-6 mt-8">
      <h1 className="text-2xl font-bold mb-4">Entrar</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          required
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        />
        <input
          type="password"
          required
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          disabled={loading}
          className="w-full bg-[var(--brand)] hover:bg-[var(--brand-dark)] disabled:opacity-60 text-white font-medium rounded-md py-2"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <p className="text-sm mt-4 text-center">
        Não tem conta?{" "}
        <Link href="/register" className="text-[var(--brand-dark)] underline">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
