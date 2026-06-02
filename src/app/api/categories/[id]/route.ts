import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const updateSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
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
  try {
    const before = await prisma.category.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json(
        { error: "Categoria não encontrada." },
        { status: 404 },
      );
    }
    const updated = await prisma.category.update({
      where: { id },
      data: parsed.data,
    });
    // Se o nome mudou, propaga em todos os produtos com o nome antigo
    if (parsed.data.name && parsed.data.name !== before.name) {
      await prisma.product.updateMany({
        where: { category: before.name },
        data: { category: parsed.data.name },
      });
    }
    return NextResponse.json(updated);
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe uma categoria com esse nome." },
        { status: 409 },
      );
    }
    console.error("[PATCH /api/categories/:id]", e);
    return NextResponse.json(
      { error: "Erro ao atualizar categoria." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }
  const { id } = await params;
  const url = new URL(req.url);
  const action = url.searchParams.get("products"); // "clear" | "keep"
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) {
    return NextResponse.json(
      { error: "Categoria não encontrada." },
      { status: 404 },
    );
  }
  const count = await prisma.product.count({ where: { category: cat.name } });
  if (count > 0 && action !== "clear" && action !== "keep") {
    return NextResponse.json(
      {
        error: "Categoria possui produtos.",
        productCount: count,
        needsConfirmation: true,
      },
      { status: 409 },
    );
  }
  if (action === "clear" && count > 0) {
    await prisma.product.updateMany({
      where: { category: cat.name },
      data: { category: null },
    });
  }
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true, clearedProducts: action === "clear" ? count : 0 });
}
