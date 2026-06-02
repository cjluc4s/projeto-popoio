"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type CheckResult = {
  ok: boolean;
  distanceKm: number;
  radiusKm: number;
  address?: string;
  cep?: string;
  store: { lat: number; lng: number; address: string };
  target: { lat: number; lng: number };
};

type CepInfo = {
  cep: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
};

function maskCep(v: string) {
  const d = v.replace(/\D+/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export default function EntregaPage() {
  const [cep, setCep] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [cepInfo, setCepInfo] = useState<CepInfo | null>(null);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckResult | null>(null);

  const numberRef = useRef<HTMLInputElement | null>(null);

  // Auto-busca o CEP assim que tiver 8 dígitos
  useEffect(() => {
    const digits = cep.replace(/\D+/g, "");
    if (digits.length !== 8) {
      setCepInfo(null);
      setCepError(null);
      return;
    }
    const ctrl = new AbortController();
    setCepLoading(true);
    setCepError(null);
    setResult(null);

    (async () => {
      try {
        const r = await fetch(`/api/cep/${digits}`, { signal: ctrl.signal });
        const data = await r.json();
        if (!r.ok) {
          setCepInfo(null);
          setCepError(data?.error || "CEP não encontrado.");
        } else {
          setCepInfo(data);
          setTimeout(() => numberRef.current?.focus(), 50);
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setCepError("Falha ao consultar o CEP. Tente novamente.");
        }
      } finally {
        setCepLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [cep]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!cepInfo) {
      setError("Informe um CEP válido para continuar.");
      return;
    }
    if (!number.trim()) {
      setError("Informe o número do endereço.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/delivery-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cep,
          number: number.trim(),
          complement: complement.trim() || undefined,
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data?.error || "Não foi possível verificar agora. Tente novamente.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Falha de rede. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const fullAddressPreview = cepInfo
    ? [
        cepInfo.street && number
          ? `${cepInfo.street}, ${number}${complement ? ` — ${complement}` : ""}`
          : cepInfo.street || "",
        cepInfo.neighborhood,
        cepInfo.city && cepInfo.state
          ? `${cepInfo.city} / ${cepInfo.state}`
          : cepInfo.city || cepInfo.state,
      ]
        .filter(Boolean)
        .join(" — ")
    : "";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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
        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <span className="inline-block bg-[var(--butter)] text-[var(--brand-dark)] text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1 mb-3">
            Área de entrega
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Entregamos no seu endereço?
          </h1>
          <p className="mt-2 text-white/90 max-w-xl text-sm sm:text-base">
            Atendemos toda a região da{" "}
            <strong>Mooca e bairros próximos</strong>, num raio de até{" "}
            <strong>5&nbsp;km</strong> da nossa loja. Confira em poucos segundos.
          </p>
        </div>
      </section>

      {/* Formulário */}
      <section className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <form onSubmit={onSubmit} className="space-y-5">
          {/* CEP */}
          <div>
            <label htmlFor="cep" className="block text-sm font-semibold text-stone-700 mb-1">
              CEP
            </label>
            <div className="relative">
              <input
                id="cep"
                inputMode="numeric"
                placeholder="00000-000"
                value={cep}
                onChange={(e) => setCep(maskCep(e.target.value))}
                className="w-full rounded-lg border border-stone-300 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/30 outline-none px-3 py-2.5 text-base pr-10"
                autoComplete="postal-code"
                aria-invalid={!!cepError}
              />
              {cepLoading && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-block h-4 w-4 border-2 border-stone-300 border-t-[var(--brand)] rounded-full animate-spin" />
              )}
              {!cepLoading && cepInfo && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600" aria-hidden>
                  ✓
                </span>
              )}
            </div>
            {cepError && (
              <p className="text-xs text-red-600 mt-1">{cepError}</p>
            )}
            {!cepError && (
              <p className="text-xs text-stone-500 mt-1">
                Não sabe o CEP?{" "}
                <a
                  href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--brand-dark)] hover:underline"
                >
                  Consulte nos Correios
                </a>
                .
              </p>
            )}
          </div>

          {/* Endereço preenchido automaticamente */}
          {cepInfo && (
            <div className="rounded-lg bg-stone-50 border border-stone-200 px-4 py-3 text-sm text-stone-700 space-y-1">
              {cepInfo.street && (
                <div>
                  <span className="text-stone-500">Logradouro: </span>
                  <strong>{cepInfo.street}</strong>
                </div>
              )}
              {cepInfo.neighborhood && (
                <div>
                  <span className="text-stone-500">Bairro: </span>
                  <strong>{cepInfo.neighborhood}</strong>
                </div>
              )}
              {(cepInfo.city || cepInfo.state) && (
                <div>
                  <span className="text-stone-500">Cidade/UF: </span>
                  <strong>
                    {cepInfo.city}
                    {cepInfo.city && cepInfo.state ? " / " : ""}
                    {cepInfo.state}
                  </strong>
                </div>
              )}
            </div>
          )}

          {/* Número + Complemento */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label htmlFor="number" className="block text-sm font-semibold text-stone-700 mb-1">
                Número <span className="text-red-600">*</span>
              </label>
              <input
                id="number"
                ref={numberRef}
                inputMode="numeric"
                placeholder="123"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                disabled={!cepInfo}
                required
                className="w-full rounded-lg border border-stone-300 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/30 outline-none px-3 py-2.5 text-base disabled:bg-stone-100 disabled:cursor-not-allowed"
                autoComplete="off"
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="complement" className="block text-sm font-semibold text-stone-700 mb-1">
                Complemento <span className="text-stone-400 font-normal">(opcional)</span>
              </label>
              <input
                id="complement"
                type="text"
                placeholder="Apto, bloco, referência…"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                disabled={!cepInfo}
                className="w-full rounded-lg border border-stone-300 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/30 outline-none px-3 py-2.5 text-base disabled:bg-stone-100 disabled:cursor-not-allowed"
                autoComplete="address-line2"
              />
            </div>
          </div>

          {fullAddressPreview && number && (
            <div className="text-xs text-stone-500">
              <span className="text-stone-400">Endereço completo: </span>
              {fullAddressPreview}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !cepInfo || !number.trim()}
            className="w-full sm:w-auto bg-[var(--brand)] hover:bg-[var(--brand-dark)] disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-6 py-3 transition shadow-sm inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Verificando…
              </>
            ) : (
              <>🔍 Verificar entrega</>
            )}
          </button>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3">
              {error}
            </div>
          )}
        </form>
      </section>

      {/* Resultado */}
      {result && (
        <section
          className={`rounded-2xl border-2 p-6 sm:p-8 shadow-sm ${
            result.ok
              ? "bg-emerald-50 border-emerald-300"
              : "bg-amber-50 border-amber-300"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`text-3xl ${
                result.ok ? "text-emerald-700" : "text-amber-700"
              }`}
              aria-hidden
            >
              {result.ok ? "✅" : "⚠️"}
            </div>
            <div className="flex-1 min-w-0">
              <h2
                className={`text-xl font-bold ${
                  result.ok ? "text-emerald-900" : "text-amber-900"
                }`}
              >
                {result.ok
                  ? "Boa notícia! Entregamos no seu endereço."
                  : "Infelizmente fora da nossa área de entrega."}
              </h2>
              <p
                className={`mt-1 text-sm ${
                  result.ok ? "text-emerald-800" : "text-amber-800"
                }`}
              >
                {result.ok
                  ? `Você está a aproximadamente ${result.distanceKm.toLocaleString(
                      "pt-BR",
                    )} km da nossa loja (atendemos até ${result.radiusKm} km).`
                  : `Distância estimada de ${result.distanceKm.toLocaleString(
                      "pt-BR",
                    )} km — acima do nosso raio de ${result.radiusKm} km. Você ainda pode retirar pessoalmente na loja.`}
              </p>

              <dl className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                {result.cep && (
                  <div className="bg-white/70 rounded-md px-3 py-2">
                    <dt className="text-xs uppercase text-stone-500">CEP</dt>
                    <dd className="font-medium text-stone-800">{result.cep}</dd>
                  </div>
                )}
                {result.address && (
                  <div className="bg-white/70 rounded-md px-3 py-2 sm:col-span-2">
                    <dt className="text-xs uppercase text-stone-500">Endereço</dt>
                    <dd className="font-medium text-stone-800">{result.address}</dd>
                  </div>
                )}
                <div className="bg-white/70 rounded-md px-3 py-2 sm:col-span-2">
                  <dt className="text-xs uppercase text-stone-500">Nossa loja</dt>
                  <dd className="font-medium text-stone-800">
                    {result.store.address}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex flex-wrap gap-3">
                {result.ok ? (
                  <Link
                    href="/#catalogo"
                    className="bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white font-semibold px-5 py-2.5 rounded-full shadow-sm transition"
                  >
                    Ver produtos
                  </Link>
                ) : (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${result.store.lat},${result.store.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white font-semibold px-5 py-2.5 rounded-full shadow-sm transition"
                  >
                    Como chegar na loja
                  </a>
                )}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${result.target.lat},${result.target.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-medium px-5 py-2.5 rounded-full transition"
                >
                  Ver no mapa
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="text-xs text-stone-500 text-center">
        Cálculo de distância em linha reta a partir da loja (Rua Madre de Deus, 292
        — Mooca). Distâncias podem variar conforme a rota real.
      </section>
    </div>
  );
}
