import { NextResponse } from "next/server";
import { assessDelivery } from "@/lib/delivery";
import { z } from "zod";

export const runtime = "nodejs";

const requestSchema = z.object({
  cep: z.string(),
  number: z.string(),
  complement: z.string().optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos para entrega." }, { status: 400 });
  }

  const assessment = await assessDelivery(parsed.data);
  if (!assessment.ok) {
    return NextResponse.json({ error: assessment.error }, { status: assessment.status });
  }

  return NextResponse.json(assessment.data);
}
