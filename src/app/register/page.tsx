"use client";

import { useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Rule = {
  key: string;
  label: string;
  test: (s: string) => boolean;
};

const PASSWORD_RULES: Rule[] = [
  { key: "len", label: "Pelo menos 8 caracteres", test: (s) => s.length >= 8 },
  { key: "lower", label: "Uma letra minúscula (a-z)", test: (s) => /[a-z]/.test(s) },
  { key: "upper", label: "Uma letra maiúscula (A-Z)", test: (s) => /[A-Z]/.test(s) },
  { key: "num", label: "Um número (0-9)", test: (s) => /\d/.test(s) },
  {
    key: "special",
    label: "Um caractere especial (!@#$%…)",
    test: (s) => /[^A-Za-z0-9]/.test(s),
  },
];

function strengthOf(score: number) {
  if (score <= 1) return { label: "Muito fraca", color: "bg-red-500", text: "text-red-700" };
  if (score === 2) return { label: "Fraca", color: "bg-orange-500", text: "text-orange-700" };
  if (score === 3) return { label: "Razoável", color: "bg-amber-500", text: "text-amber-700" };
  if (score === 4) return { label: "Boa", color: "bg-lime-500", text: "text-lime-700" };
  return { label: "Forte", color: "bg-emerald-600", text: "text-emerald-700" };
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    phone: "",
    address: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptComms, setAcceptComms] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const ruleResults = useMemo(
    () => PASSWORD_RULES.map((r) => ({ ...r, ok: r.test(form.password) })),
    [form.password],
  );
  const score = ruleResults.filter((r) => r.ok).length;
  const allValid = score === PASSWORD_RULES.length;
  const strength = strengthOf(score);
  const confirmMismatch =
    form.confirm.length > 0 && form.confirm !== form.password;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.phone.trim()) {
      setError("Informe seu telefone ou WhatsApp.");
      return;
    }
    if (!form.address.trim()) {
      setError("Informe seu endereço.");
      return;
    }
    if (!allValid) {
      setError("A senha não atende aos requisitos mínimos.");
      return;
    }
    if (form.confirm !== form.password) {
      setError("A confirmação da senha não confere.");
      return;
    }
    if (!acceptTerms) {
      setError("Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.");
      return;
    }
    if (!acceptComms) {
      setError("É necessário concordar em receber as confirmações de pedido para criar a conta.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone.trim(),
          address: form.address.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Erro ao cadastrar.");
        setLoading(false);
        return;
      }
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      router.push("/");
    } catch {
      setError("Falha de rede. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <Link
          href="/"
          className="text-sm text-[var(--brand-dark)] hover:underline inline-flex items-center gap-1"
        >
          ← Voltar para a loja
        </Link>
      </div>

      {/* Cabeçalho */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--brand-dark)] via-[var(--brand)] to-[#e8523e] text-white shadow-lg">
        <div className="px-6 py-7 sm:px-8 sm:py-8">
          <span className="inline-block bg-[var(--butter)] text-[var(--brand-dark)] text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1 mb-2">
            Cadastro
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Crie sua conta no Popoio
          </h1>
          <p className="mt-1 text-white/90 text-sm sm:text-base">
            É rapidinho. Depois é só fazer seus pedidos pelo site.
          </p>
        </div>
      </section>

      {/* Formulário */}
      <section className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-stone-700 mb-1">
              Nome completo <span className="text-red-600">*</span>
            </label>
            <input
              id="name"
              required
              autoComplete="name"
              placeholder="Como você se chama?"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full rounded-lg border border-stone-300 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/30 outline-none px-3 py-2.5 text-base"
            />
          </div>

          {/* E-mail */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-stone-700 mb-1">
              E-mail <span className="text-red-600">*</span>
            </label>
            <input
              id="email"
              required
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="w-full rounded-lg border border-stone-300 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/30 outline-none px-3 py-2.5 text-base"
            />
          </div>

          {/* Senha */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-stone-700 mb-1">
              Senha <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                required
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Crie uma senha segura"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className="w-full rounded-lg border border-stone-300 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/30 outline-none px-3 py-2.5 text-base pr-20"
                aria-describedby="password-rules"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-600 hover:text-[var(--brand-dark)] px-2 py-1 rounded"
                tabIndex={-1}
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>

            {/* Medidor de força */}
            {form.password.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1" aria-hidden>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        i <= score ? strength.color : "bg-stone-200"
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-semibold mt-1 ${strength.text}`}>
                  Segurança: {strength.label}
                </p>
              </div>
            )}

            {/* Lista de requisitos */}
            <ul id="password-rules" className="mt-3 grid sm:grid-cols-2 gap-1.5 text-xs">
              {ruleResults.map((r) => (
                <li
                  key={r.key}
                  className={`flex items-start gap-1.5 ${
                    r.ok ? "text-emerald-700" : "text-stone-500"
                  }`}
                >
                  <span
                    className={`mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                      r.ok ? "bg-emerald-100 text-emerald-700" : "bg-stone-200 text-stone-500"
                    }`}
                    aria-hidden
                  >
                    {r.ok ? "✓" : "•"}
                  </span>
                  {r.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Confirmar senha */}
          <div>
            <label htmlFor="confirm" className="block text-sm font-semibold text-stone-700 mb-1">
              Confirmar senha <span className="text-red-600">*</span>
            </label>
            <input
              id="confirm"
              required
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repita a senha"
              value={form.confirm}
              onChange={(e) => set("confirm", e.target.value)}
              className={`w-full rounded-lg border outline-none px-3 py-2.5 text-base focus:ring-2 ${
                confirmMismatch
                  ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                  : "border-stone-300 focus:border-[var(--brand)] focus:ring-[var(--brand)]/30"
              }`}
            />
            {confirmMismatch && (
              <p className="text-xs text-red-600 mt-1">As senhas não coincidem.</p>
            )}
          </div>

          {/* Telefone + Endereço */}
          <div className="grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-stone-700 mb-1">
                Telefone / WhatsApp <span className="text-red-600">*</span>
              </label>
              <input
                id="phone"
                required
                type="tel"
                autoComplete="tel"
                placeholder="(11) 91234-5678"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="w-full rounded-lg border border-stone-300 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/30 outline-none px-3 py-2.5 text-base bg-white"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-stone-700 mb-1">
                Endereço <span className="text-red-600">*</span>
              </label>
              <input
                id="address"
                required
                type="text"
                autoComplete="street-address"
                placeholder="Rua, número, bairro"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                className="w-full rounded-lg border border-stone-300 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/30 outline-none px-3 py-2.5 text-base bg-white"
              />
            </div>
          </div>

          {/* Consentimentos */}
          <div className="space-y-2 pt-1">
            <label className="flex items-start gap-2 text-sm text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-stone-400 text-[var(--brand)] focus:ring-[var(--brand)]/40"
              />
              <span>
                Li e aceito os{" "}
                <Link href="/termos" target="_blank" className="text-[var(--brand-dark)] font-semibold hover:underline">
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link href="/privacidade" target="_blank" className="text-[var(--brand-dark)] font-semibold hover:underline">
                  Política de Privacidade
                </Link>
                . <span className="text-red-600">*</span>
              </span>
            </label>
            <label className="flex items-start gap-2 text-sm text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={acceptComms}
                onChange={(e) => setAcceptComms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-stone-400 text-[var(--brand)] focus:ring-[var(--brand)]/40"
              />
              <span>
                Concordo em receber confirmações dos meus pedidos por e-mail
                e/ou WhatsApp. <span className="text-red-600">*</span>
              </span>
            </label>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !allValid || confirmMismatch || !form.confirm || !form.phone.trim() || !form.address.trim() || !acceptTerms || !acceptComms}
            className="w-full bg-[var(--brand)] hover:bg-[var(--brand-dark)] disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-3 transition shadow-sm inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Criando conta…
              </>
            ) : (
              "Criar minha conta"
            )}
          </button>

          <p className="text-xs text-stone-500 text-center">
            Seus dados são usados apenas para processar seus pedidos. Consulte
            nossa{" "}
            <Link href="/privacidade" className="underline hover:text-[var(--brand-dark)]">
              Política de Privacidade
            </Link>
            .
          </p>
        </form>
      </section>

      <p className="text-sm text-center text-stone-600">
        Já tem conta?{" "}
        <Link href="/login" className="text-[var(--brand-dark)] font-semibold hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
