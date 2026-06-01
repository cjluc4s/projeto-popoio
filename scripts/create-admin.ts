/**
 * Cria/promove um usuário admin.
 * Uso:
 *   npx tsx scripts/create-admin.ts admin@popoio.com SenhaForte123 "Admin Popoio"
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [email, password, name] = process.argv.slice(2);
  if (!email || !password) {
    console.error("Uso: tsx scripts/create-admin.ts <email> <senha> [nome]");
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      name: name ?? "Administrador",
      isAdmin: true,
    },
    update: { isAdmin: true, passwordHash },
  });
  console.log("Admin criado/atualizado:", user.email);
}

main().finally(() => prisma.$disconnect());
