import { NextResponse } from "next/server";
import { lookupCep, normalizeCep } from "@/lib/delivery";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ cep: string }> },
) {
  const { cep } = await ctx.params;
  if (!normalizeCep(cep)) {
    return NextResponse.json({ error: "CEP inválido." }, { status: 400 });
  }
  const data = await lookupCep(cep);
  if (!data) {
    return NextResponse.json({ error: "CEP não encontrado." }, { status: 404 });
  }
  return NextResponse.json({
    cep: data.cep,
    street: data.street,
    neighborhood: data.neighborhood,
    city: data.city,
    state: data.state,
  });
}
