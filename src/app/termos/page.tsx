import Link from "next/link";

export const metadata = {
  title: "Termos de Uso — Laticínios Popoio",
};

const UPDATED_AT = "2 de junho de 2026";

export default function TermosPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/"
        className="text-sm text-[var(--brand-dark)] hover:underline inline-flex items-center gap-1"
      >
        ← Voltar para a loja
      </Link>

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--brand-dark)] via-[var(--brand)] to-[#e8523e] text-white shadow-lg">
        <div className="px-6 py-7 sm:px-8 sm:py-8">
          <span className="inline-block bg-[var(--butter)] text-[var(--brand-dark)] text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1 mb-2">
            Documento legal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Termos de Uso</h1>
          <p className="mt-1 text-white/90 text-sm">
            Última atualização: {UPDATED_AT}
          </p>
        </div>
      </section>

      <article className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6 sm:p-8 text-stone-700 leading-relaxed space-y-4 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[var(--brand-dark)] [&_h2]:mt-6 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-[var(--brand-dark)] [&_a]:underline">
        <p>
          Bem-vindo(a) ao site de pedidos online dos <strong>Laticínios Popoio LTDA</strong>
          {" "}(CNPJ 60.285.178/0001-58), com sede na Rua Madre de Deus, 292 —
          Mooca, São Paulo / SP. Estes Termos de Uso (&quot;Termos&quot;) regem o uso do
          nosso site e dos serviços oferecidos por meio dele.
        </p>

        <h2>1. Aceitação</h2>
        <p>
          Ao criar uma conta ou realizar um pedido, você declara que leu,
          entendeu e concorda integralmente com estes Termos e com a nossa{" "}
          <Link href="/privacidade">Política de Privacidade</Link>.
        </p>

        <h2>2. Cadastro e conta</h2>
        <ul>
          <li>Você deve ter <strong>18 anos ou mais</strong> e fornecer dados verdadeiros e atualizados.</li>
          <li>É responsável por manter a confidencialidade da sua senha.</li>
          <li>Podemos suspender contas em caso de uso indevido, fraude ou violação destes Termos.</li>
        </ul>

        <h2>3. Pedidos e entregas</h2>
        <ul>
          <li>Os pedidos só são confirmados após o envio ao nosso WhatsApp e validação manual.</li>
          <li>Atendemos a região da Mooca e proximidades, em um raio aproximado de <strong>5&nbsp;km</strong> da loja.</li>
          <li>Preços, disponibilidade e prazos podem mudar sem aviso prévio.</li>
          <li>A propriedade dos produtos é transferida apenas após o pagamento integral.</li>
        </ul>

        <h2>4. Cancelamento e devolução</h2>
        <p>
          Produtos perecíveis podem ser recusados no ato da entrega caso
          apresentem qualquer irregularidade. Trocas e devoluções seguem o
          Código de Defesa do Consumidor (Lei 8.078/1990).
        </p>

        <h2>5. Propriedade intelectual</h2>
        <p>
          Marcas, logotipos, layout e conteúdo do site pertencem aos Laticínios
          Popoio. É proibida a reprodução total ou parcial sem autorização.
        </p>

        <h2>6. Limitação de responsabilidade</h2>
        <p>
          Nos esforçamos para manter o site sempre disponível, mas não nos
          responsabilizamos por indisponibilidades temporárias, falhas de rede
          ou prejuízos indiretos decorrentes do uso da plataforma.
        </p>

        <h2>7. Alterações destes Termos</h2>
        <p>
          Podemos atualizar estes Termos a qualquer momento. A versão vigente
          estará sempre publicada nesta página com a data de atualização.
        </p>

        <h2>8. Foro</h2>
        <p>
          Fica eleito o foro da Comarca de São Paulo / SP para dirimir qualquer
          dúvida ou controvérsia relativa a estes Termos.
        </p>

        <h2>9. Contato</h2>
        <p>
          Em caso de dúvidas, entre em contato pelo nosso WhatsApp ou
          pessoalmente na loja, na Rua Madre de Deus, 292 — Mooca, São Paulo / SP.
        </p>
      </article>
    </div>
  );
}
