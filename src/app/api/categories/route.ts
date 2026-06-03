import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  return NextResponse.json(
    categories.map((c) => ({
      id: c.id,
      name: c.name,
      sortOrder: c.sortOrder,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      orphan: false,
      productCount: c._count.products,
    })),
  );
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
