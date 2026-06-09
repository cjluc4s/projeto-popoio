import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { assessDelivery } from "@/lib/delivery";

const itemSchema = z.object({
  productId: z.string(),
  qty: z.number().int().positive(),
});

const createSchema = z.object({
  items: z.array(itemSchema).min(1),
  notes: z.string().optional(),
  delivery: z.object({
    cep: z.string(),
    number: z.string(),
    complement: z.string().optional(),
  }),
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

  let orderItems: Array<{
    productId: string;
    name: string;
    qty: number;
    priceCents: number;
  }>;
  try {
    orderItems = parsed.data.items.map((i) => {
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
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Itens inválidos para pedido." },
      { status: 400 },
    );
  }

  const totalCents = orderItems.reduce(
    (acc, i) => acc + i.priceCents * i.qty,
    0
  );

  const delivery = await assessDelivery(parsed.data.delivery);
  if (!delivery.ok) {
    return NextResponse.json({ error: delivery.error }, { status: delivery.status });
  }
  if (!delivery.data.ok) {
    return NextResponse.json(
      {
        error: `Endereço fora da área de entrega (${delivery.data.distanceKm.toLocaleString("pt-BR")} km).`,
      },
      { status: 400 },
    );
  }

  const subtotalCents = totalCents;
  const finalTotalCents = subtotalCents + delivery.data.feeCents;

  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      for (const i of orderItems) {
        const updated = await tx.product.updateMany({
          where: {
            id: i.productId,
            available: true,
            stockQty: { gte: i.qty },
          },
          data: { stockQty: { decrement: i.qty } },
        });
        if (updated.count !== 1) {
          throw new Error(`Estoque insuficiente para ${i.name}. Atualize o carrinho e tente novamente.`);
        }
      }

      await tx.product.updateMany({
        where: {
          id: { in: orderItems.map((i) => i.productId) },
          stockQty: { lte: 0 },
        },
        data: { available: false },
      });

      const createdOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          items: orderItems,
          subtotalCents,
          deliveryFeeCents: delivery.data.feeCents,
          totalCents: finalTotalCents,
          deliveryCep: delivery.data.cep,
          deliveryAddress: delivery.data.address,
          deliveryNumber: parsed.data.delivery.number.trim(),
          deliveryComplement: parsed.data.delivery.complement?.trim() || null,
          deliveryDistanceKm: delivery.data.distanceKm,
          deliveryWindowLabel: delivery.data.windowLabel,
          notes: parsed.data.notes,
        },
      });

      await tx.orderStatusEvent.create({
        data: {
          orderId: createdOrder.id,
          fromStatus: null,
          toStatus: "pending",
          note: "Pedido criado",
          changedByUserId: session.user.id,
        },
      });

      return createdOrder;
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Não foi possível criar o pedido." },
      { status: 400 },
    );
  }

  return NextResponse.json(order, { status: 201 });
}
