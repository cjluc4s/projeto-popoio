import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

function normalizeCategoryName(value: string | null | undefined) {
  return value?.trim() || null;
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

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  priceCents: z.number().int().nonnegative().optional(),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  stockQty: z.number().int().nonnegative().optional(),
  available: z.boolean().optional(),
  imageUrl: z.string().nullable().optional().or(z.literal("")),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const data: {
    name?: string;
    priceCents?: number;
    description?: string | null;
    barcode?: string | null;
    stockQty?: number;
    available?: boolean;
    imageUrl?: string | null;
    categoryId?: string | null;
  } = {
    ...parsed.data,
  };
  const categoryName = normalizeCategoryName(parsed.data.category);
  if (data.barcode === "") data.barcode = null;
  if (data.imageUrl === "") data.imageUrl = null;
  if (parsed.data.category !== undefined) {
    data.categoryId = await resolveCategoryIdByName(categoryName);
  }
  try {
    const product = await prisma.product.update({
      where: { id },
      data,
      include: { category: { select: { name: true } } },
    });
    return NextResponse.json(toProductResponse(product));
  } catch (e: unknown) {
    const msg = (e as { code?: string })?.code === "P2002"
      ? "Já existe um produto com esse código de barras."
      : "Erro ao atualizar o produto.";
    return NextResponse.json({ error: msg }, { status: 409 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
