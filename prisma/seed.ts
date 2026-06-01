import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Admin padrão
  const adminEmail = "admin@popoio.com";
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash,
      name: "Admin Popóio",
      isAdmin: true,
    },
    update: { isAdmin: true, passwordHash },
  });
  console.log(`✓ Admin: ${adminEmail} / admin123`);

  // Cliente de teste
  const clientEmail = "cliente@teste.com";
  await prisma.user.upsert({
    where: { email: clientEmail },
    create: {
      email: clientEmail,
      passwordHash: await bcrypt.hash("cliente123", 10),
      name: "Cliente Teste",
      phone: "11999998888",
      address: "Rua Exemplo, 100 - Mooca, SP",
    },
    update: {},
  });
  console.log(`✓ Cliente: ${clientEmail} / cliente123`);

  // Produtos de exemplo
  const products = [
    {
      name: "Leite Integral 1L",
      priceCents: 599,
      category: "Laticínios",
      stockQty: 50,
      description: "Leite integral pasteurizado, embalagem de 1 litro.",
    },
    {
      name: "Queijo Minas Frescal 500g",
      priceCents: 2490,
      category: "Laticínios",
      stockQty: 20,
      description: "Queijo minas fresco artesanal.",
    },
    {
      name: "Iogurte Natural 170g",
      priceCents: 449,
      category: "Laticínios",
      stockQty: 30,
    },
    {
      name: "Manteiga com Sal 200g",
      priceCents: 1290,
      category: "Laticínios",
      stockQty: 15,
    },
    {
      name: "Requeijão Cremoso 200g",
      priceCents: 999,
      category: "Laticínios",
      stockQty: 25,
    },
    {
      name: "Pão Francês (kg)",
      priceCents: 1690,
      category: "Padaria",
      stockQty: 10,
    },
    {
      name: "Ovos Caipira (dúzia)",
      priceCents: 1890,
      category: "Hortifruti",
      stockQty: 18,
    },
    {
      name: "Café Torrado e Moído 500g",
      priceCents: 2290,
      category: "Mercearia",
      stockQty: 22,
    },
  ];

  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({ data: p });
    }
  }
  console.log(`✓ ${products.length} produtos garantidos`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
