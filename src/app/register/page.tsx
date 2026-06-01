"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erro ao cadastrar");
      setLoading(false);
      return;
    }
    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    router.push("/");
  }

  return (
    <div className="max-w-md mx-auto bg-white border rounded-lg p-6 mt-8">
      <h1 className="text-2xl font-bold mb-4">Criar conta</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          required
          placeholder="Nome completo"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        />
        <input
          required
          type="email"
          placeholder="E-mail"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        />
        <input
          required
          type="password"
          minLength={6}
          placeholder="Senha (mín. 6 caracteres)"
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        />
        <input
          placeholder="Telefone (opcional)"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        />
        <input
          placeholder="Endereço (opcional)"
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium rounded-md py-2"
        >
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
      <p className="text-sm mt-4 text-center">
        Já tem conta?{" "}
        <Link href="/login" className="text-emerald-700 underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
