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
