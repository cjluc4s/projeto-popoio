import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z
    .string()
    .min(7, "A senha deve ter pelo menos 7 caracteres.")
    .regex(/[a-z]/, "A senha deve conter uma letra minúscula.")
    .regex(/[A-Z]/, "A senha deve conter uma letra maiúscula.")
    .regex(/\d/, "A senha deve conter um número.")
    .regex(/[^A-Za-z0-9]/, "A senha deve conter um caractere especial."),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstIssue?.message || "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { name, email, password, phone, address } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, phone, address },
    select: { id: true, email: true, name: true },
  });

  return NextResponse.json(user, { status: 201 });
}
