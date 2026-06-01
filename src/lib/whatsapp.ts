import { formatBRL } from "@/lib/format";

export interface WaItem {
  name: string;
  qty: number;
  priceCents: number;
}

export function buildWhatsAppUrl(params: {
  orderId: string;
  customerName: string;
  items: WaItem[];
  totalCents: number;
  notes?: string;
}) {
  const phone = process.env.NEXT_PUBLIC_STORE_WHATSAPP ?? "";
  const lines = [
    `*Novo pedido #${params.orderId}*`,
    `Cliente: ${params.customerName}`,
    "",
    "*Itens:*",
    ...params.items.map(
      (i) => `• ${i.qty}x ${i.name} — ${formatBRL(i.priceCents * i.qty)}`
    ),
    "",
    `*Total: ${formatBRL(params.totalCents)}*`,
  ];
  if (params.notes) {
    lines.push("", `Obs: ${params.notes}`);
  }
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${phone}?text=${text}`;
}
