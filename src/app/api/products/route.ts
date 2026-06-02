import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { available: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(products);
}

const createSchema = z.object({
  name: z.string().min(1),
  priceCents: z.number().int().nonnegative(),
  description: z.string().optional(),
  category: z.string().optional(),
  barcode: z.string().trim().min(1).optional().or(z.literal("")),
  stockQty: z.number().int().nonnegative().default(0),
  available: z.boolean().default(true),
  imageUrl: z.string().min(1).optional().or(z.literal("")),
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
  const data = {
    ...parsed.data,
    imageUrl: parsed.data.imageUrl || null,
    barcode: parsed.data.barcode || null,
  };
  try {
    const product = await prisma.product.create({ data });
    return NextResponse.json(product, { status: 201 });
  } catch (e: unknown) {
    const msg = (e as { code?: string })?.code === "P2002"
      ? "Já existe um produto com esse código de barras."
      : "Erro ao salvar o produto.";
    return NextResponse.json({ error: msg }, { status: 409 });
  }
}
