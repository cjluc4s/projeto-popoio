import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

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
  const data = { ...parsed.data };
  if (data.barcode === "") data.barcode = null;
  if (data.imageUrl === "") data.imageUrl = null;
  try {
    const product = await prisma.product.update({ where: { id }, data });
    return NextResponse.json(product);
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
