# 🥛 Laticínios Popoio — Mercearia Online

Sistema web para a mercearia **Laticínios Popoio LTDA** (Rua Mad de Deus, 292 - Mooca, São Paulo - SP), com catálogo online, carrinho, checkout via WhatsApp e painel administrativo.

## Stack

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS**
- **Prisma** + **PostgreSQL**
- **NextAuth v5** (credenciais)
- API Routes do próprio Next.js

## Configuração

1. Instale dependências:
   ```powershell
   npm install
   ```
2. Copie `.env.example` para `.env` e preencha:
   - `DATABASE_URL` — string do Postgres (Supabase / Neon / Railway)
   - `AUTH_SECRET` — `openssl rand -base64 32` ou qualquer string longa
   - `NEXT_PUBLIC_STORE_WHATSAPP` — número da loja (ex.: `5511999999999`)
3. Aplique o schema:
   ```powershell
   npx prisma migrate dev --name init
   ```
4. Crie um admin:
   ```powershell
   npx tsx scripts/create-admin.ts admin@popoio.com SenhaForte123 "Admin Popoio"
   ```
5. Rode em dev:
   ```powershell
   npm run dev
   ```

## Operação recomendada (produção)

### Checkout robusto
- O checkout agora exige validação de CEP + número antes de finalizar.
- A API valida área de entrega, calcula taxa e define janela prevista.
- Pedido fora da área (raio de 5 km) é bloqueado no backend.

### Estoque
- A criação de pedido valida estoque em transação (evita corrida de concorrência).
- Produto com estoque zerado é marcado como indisponível automaticamente.

### Fluxo de pedidos (admin)
- Status padrão do fluxo: `Criado -> Confirmado -> Em rota -> Entregue/Cancelado`.
- Cada mudança de status gera histórico com data/hora e usuário responsável.

### Segurança de autenticação
- Cadastro exige senha forte (8+ caracteres, maiúscula, minúscula, número e especial).
- Login possui limitação por IP e bloqueio temporário por tentativas inválidas.

### Backup e restauração (mensal)
1. Gere backup:
   ```powershell
   npm run db:backup
   ```
2. Teste restauração em banco separado:
   ```powershell
   $env:DATABASE_URL_RESTORE_TEST="postgresql://..."
   npm run db:restore:test -- -BackupFile "backups/popoio-AAAAmmdd-HHmmss.dump"
   ```
3. Rotina mensal automatizada (backup + restore test quando `DATABASE_URL_RESTORE_TEST` estiver definido):
   ```powershell
   npm run db:backup:monthly
   ```
4. Agendamento sugerido no Windows (Task Scheduler):
   ```powershell
   schtasks /Create /SC MONTHLY /MO 1 /D SUN /TN "Popoio DB Backup" /TR "powershell -ExecutionPolicy Bypass -File c:\Users\lucas.januario\Desktop\Projeto - Popoio\mercearia\scripts\monthly-backup.ps1" /ST 03:00
   ```
5. Checklist de validação mensal:
   - Confirmar geração do arquivo em `backups/`
   - Confirmar restauração em ambiente de teste
   - Registrar data do teste e nome do arquivo restaurado

> Requisito: `pg_dump` e `pg_restore` instalados (PostgreSQL client tools no PATH).

## Rotas principais

| Rota              | Descrição                                       |
| ----------------- | ----------------------------------------------- |
| `/`               | Catálogo público                                |
| `/cart`           | Carrinho (persistido em `localStorage`)         |
| `/checkout`       | Finalização (exige login) + envio via WhatsApp  |
| `/orders`         | Histórico de pedidos do cliente                 |
| `/login`          | Login                                           |
| `/register`       | Cadastro                                        |
| `/admin`          | Dashboard com métricas                          |
| `/admin/products` | CRUD de produtos                                |
| `/admin/orders`   | Lista e detalhe de pedidos com edição de status |

## Próximos passos sugeridos

- Recuperação de senha por e-mail
- Upload de imagens (Cloudinary ou Vercel Blob)
- Pagamento online (PIX, gateway)
- Notificações push
