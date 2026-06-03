import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

function normalizeCategoryName(value: string | null | undefined) {
  const name = value?.trim() || null;
  return name;
}

async function resolveCategoryIdByName(name: string | null) {
  if (!name) return null;
  const category = await prisma.category.findUnique({ where: { name } });
  return category?.id ?? null;
}

function toProductResponse<T extends { category: { name: string } | null }>(product: T) {
  return {
    ...product,
    category: product.category?.name ?? null,
  };
}

export async function GET() {
  const products = await prisma.product.findMany({
    where: { available: true },
    include: { category: { select: { name: true } } },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  });
  return NextResponse.json(products.map(toProductResponse));
}

const createSchema = z.object({
  name: z.string().min(1),
  priceCents: z.number().int().nonnegative(),
  description: z.string().nullish(),
  category: z.string().nullish(),
  barcode: z.string().nullish(),
  stockQty: z.number().int().nonnegative().default(0),
  available: z.boolean().default(true),
  imageUrl: z.string().nullish(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const categoryName = normalizeCategoryName(parsed.data.category);
  const categoryId = await resolveCategoryIdByName(categoryName);
  const data = {
    name: parsed.data.name,
    priceCents: parsed.data.priceCents,
    stockQty: parsed.data.stockQty,
    available: parsed.data.available,
    description: parsed.data.description?.trim() || null,
    categoryId,
    imageUrl: parsed.data.imageUrl?.trim() || null,
    barcode: parsed.data.barcode?.trim() || null,
  };
  try {
    const product = await prisma.product.create({
      data,
      include: { category: { select: { name: true } } },
    });
    return NextResponse.json(toProductResponse(product), { status: 201 });
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "P2002") {
      return NextResponse.json(
        { error: "Já existe um produto com esse código de barras." },
        { status: 409 },
      );
    }
    console.error("[POST /api/products] error:", e);
    return NextResponse.json(
      { error: (e as Error)?.message ?? "Erro ao salvar o produto." },
      { status: 500 },
    );
  }
}
