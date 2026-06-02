import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  // Categorias cadastradas + categorias que já existem em produtos mas não foram cadastradas
  const [registered, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.product.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ["category"],
    }),
  ]);
  const usage = await prisma.product.groupBy({
    by: ["category"],
    _count: { _all: true },
  });
  const countByName = new Map<string, number>();
  for (const u of usage) {
    if (u.category) countByName.set(u.category, u._count._all);
  }
  const registeredNames = new Set(registered.map((c) => c.name));
  const orphan = products
    .map((p) => p.category)
    .filter((n): n is string => !!n && !registeredNames.has(n))
    .map((name) => ({
      id: `orphan:${name}`,
      name,
      sortOrder: 9999,
      createdAt: null as Date | null,
      updatedAt: null as Date | null,
      orphan: true,
      productCount: countByName.get(name) ?? 0,
    }));
  const withCount = registered.map((c) => ({
    ...c,
    orphan: false,
    productCount: countByName.get(c.name) ?? 0,
  }));
  return NextResponse.json([...withCount, ...orphan]);
}

const createSchema = z.object({
  name: z.string().trim().min(1).max(60),
  sortOrder: z.number().int().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  try {
    const created = await prisma.category.create({ data: parsed.data });
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe uma categoria com esse nome." },
        { status: 409 },
      );
    }
    console.error("[POST /api/categories]", e);
    return NextResponse.json(
      { error: "Erro ao criar categoria." },
      { status: 500 },
    );
  }
}
