import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const itemSchema = z.object({
  productId: z.string(),
  qty: z.number().int().positive(),
});

const createSchema = z.object({
  items: z.array(itemSchema).min(1),
  notes: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const where = session.user.isAdmin ? {} : { userId: session.user.id };
  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true, phone: true } } },
  });
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const ids = parsed.data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, available: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const orderItems = parsed.data.items.map((i) => {
    const p = byId.get(i.productId);
    if (!p) throw new Error(`Produto ${i.productId} indisponível`);
    if (p.stockQty < i.qty) throw new Error(`Estoque insuficiente: ${p.name}`);
    return {
      productId: p.id,
      name: p.name,
      qty: i.qty,
      priceCents: p.priceCents,
    };
  });

  const totalCents = orderItems.reduce(
    (acc, i) => acc + i.priceCents * i.qty,
    0
  );

  const order = await prisma.$transaction(async (tx) => {
    for (const i of orderItems) {
      await tx.product.update({
        where: { id: i.productId },
        data: { stockQty: { decrement: i.qty } },
      });
    }
    return tx.order.create({
      data: {
        userId: session.user.id,
        items: orderItems,
        totalCents,
        notes: parsed.data.notes,
      },
    });
  });

  return NextResponse.json(order, { status: 201 });
}
