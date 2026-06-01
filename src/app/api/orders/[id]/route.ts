import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const statusSchema = z.object({
  status: z.enum(["pending", "preparing", "ready", "delivered", "cancelled"]),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true, phone: true } } },
  });
  if (!order) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  if (!session.user.isAdmin && order.userId !== session.user.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }
  return NextResponse.json(order);
}

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
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }
  const order = await prisma.order.update({
    where: { id },
    data: { status: parsed.data.status },
  });
  return NextResponse.json(order);
}
