import Link from "next/link";

export const metadata = {
  title: "Política de Privacidade — Laticínios Popoio",
};

const UPDATED_AT = "2 de junho de 2026";

export default function PrivacidadePage() {
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
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Política de Privacidade
          </h1>
          <p className="mt-1 text-white/90 text-sm">
            Última atualização: {UPDATED_AT}
          </p>
        </div>
      </section>

      <article className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6 sm:p-8 text-stone-700 leading-relaxed space-y-4 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[var(--brand-dark)] [&_h2]:mt-6 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-[var(--brand-dark)] [&_a]:underline">
        <p>
          A <strong>Laticínios Popoio LTDA</strong> (CNPJ 60.285.178/0001-58),
          com sede na Rua Madre de Deus, 292 — Mooca, São Paulo / SP, leva a
          sério a privacidade dos seus clientes. Esta política descreve como
          tratamos seus dados pessoais, em conformidade com a{" "}
          <strong>Lei Geral de Proteção de Dados (Lei 13.709/2018 — LGPD)</strong>.
        </p>

        <h2>1. Dados que coletamos</h2>
        <ul>
          <li><strong>Cadastro:</strong> nome, e-mail, telefone e endereço.</li>
          <li><strong>Pedidos:</strong> itens, valores, datas e status de entrega.</li>
          <li><strong>Uso do site:</strong> registros técnicos (IP, navegador, páginas visitadas) para segurança e melhoria contínua.</li>
        </ul>

        <h2>2. Finalidades do tratamento</h2>
        <ul>
          <li>Processar e entregar seus pedidos.</li>
          <li>Enviar confirmações e atualizações de pedido por e-mail e/ou WhatsApp.</li>
          <li>Atender ao Código de Defesa do Consumidor e a obrigações fiscais.</li>
          <li>Prevenir fraudes e proteger nossa loja.</li>
          <li>Melhorar nossos produtos, atendimento e experiência de uso.</li>
        </ul>

        <h2>3. Base legal</h2>
        <p>
          Tratamos seus dados com base na <strong>execução de contrato</strong>{" "}
          (art. 7º, V da LGPD), no <strong>cumprimento de obrigação legal</strong>{" "}
          (art. 7º, II) e no seu <strong>consentimento</strong> (art. 7º, I),
          conforme o caso.
        </p>

        <h2>4. Compartilhamento</h2>
        <p>
          Não vendemos seus dados. Podemos compartilhar informações estritamente
          necessárias com:
        </p>
        <ul>
          <li>Provedores de hospedagem e infraestrutura do site.</li>
          <li>Serviços de mensageria (WhatsApp / e-mail) para envio de confirmações.</li>
          <li>Autoridades públicas, quando exigido por lei.</li>
        </ul>

        <h2>5. Retenção</h2>
        <p>
          Mantemos seus dados enquanto sua conta estiver ativa ou pelo prazo
          necessário para cumprir obrigações legais (especialmente fiscais e
          contábeis).
        </p>

        <h2>6. Seus direitos</h2>
        <p>
          A qualquer momento você pode exercer os direitos previstos no art. 18
          da LGPD, incluindo:
        </p>
        <ul>
          <li>Confirmação e acesso aos seus dados;</li>
          <li>Correção de dados incompletos ou desatualizados;</li>
          <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
          <li>Portabilidade;</li>
          <li>Revogação do consentimento.</li>
        </ul>
        <p>
          Para exercer seus direitos, fale com a gente pelo WhatsApp ou
          pessoalmente na loja.
        </p>

        <h2>7. Segurança</h2>
        <p>
          Adotamos medidas técnicas e organizacionais razoáveis para proteger
          seus dados, incluindo senhas armazenadas com hash criptográfico,
          conexões seguras e controle de acesso à base de dados.
        </p>

        <h2>8. Cookies</h2>
        <p>
          Utilizamos cookies estritamente necessários ao funcionamento do site
          (como autenticação e carrinho). Não utilizamos cookies de publicidade
          de terceiros.
        </p>

        <h2>9. Alterações</h2>
        <p>
          Esta política pode ser atualizada periodicamente. A versão vigente
          estará sempre disponível nesta página com a data de atualização.
        </p>

        <h2>10. Contato do encarregado</h2>
        <p>
          Para dúvidas sobre privacidade, entre em contato pelo nosso WhatsApp
          ou pessoalmente na Rua Madre de Deus, 292 — Mooca, São Paulo / SP.
        </p>
      </article>
    </div>
  );
}
