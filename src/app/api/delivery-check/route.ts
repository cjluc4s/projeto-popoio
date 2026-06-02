import { NextResponse } from "next/server";
import {
  DELIVERY_RADIUS_KM,
  STORE_LOCATION,
  geocodeAddress,
  haversineKm,
  lookupCep,
  normalizeCep,
} from "@/lib/delivery";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { cep?: string; address?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  }

  const cepInput = (body.cep || "").trim();
  const addressInput = (body.address || "").trim();

  if (!cepInput && !addressInput) {
    return NextResponse.json(
      { error: "Informe um CEP ou endereço para verificarmos." },
      { status: 400 },
    );
  }

  // 1) Caminho preferencial: CEP
  let coords: { lat: number; lng: number } | undefined;
  let addressLabel = "";
  let cepFmt: string | undefined;

  if (cepInput) {
    if (!normalizeCep(cepInput)) {
      return NextResponse.json(
        { error: "CEP inválido. Use o formato 00000-000." },
        { status: 400 },
      );
    }
    const lookup = await lookupCep(cepInput);
    if (!lookup) {
      return NextResponse.json(
        { error: "Não encontramos esse CEP. Confira o número e tente de novo." },
        { status: 404 },
      );
    }
    cepFmt = lookup.cep;
    addressLabel = [
      lookup.street,
      lookup.neighborhood,
      lookup.city && lookup.state ? `${lookup.city} / ${lookup.state}` : lookup.city || lookup.state,
    ]
      .filter(Boolean)
      .join(" — ");
    coords = lookup.coords;

    // Se não temos coords pelo CEP, complementa com endereço informado pelo usuário (se houver)
    if (!coords) {
      const composed = [
        addressInput,
        lookup.street,
        lookup.neighborhood,
        lookup.city,
        lookup.state,
        "Brasil",
      ]
        .filter(Boolean)
        .join(", ");
      coords = (await geocodeAddress(composed)) || undefined;
    }
  } else if (addressInput) {
    // 2) Sem CEP — só endereço livre
    coords = (await geocodeAddress(`${addressInput}, Brasil`)) || undefined;
    addressLabel = addressInput;
  }

  if (!coords) {
    return NextResponse.json(
      {
        error:
          "Não conseguimos localizar esse endereço no mapa. Tente informar o CEP ou um endereço mais completo.",
      },
      { status: 422 },
    );
  }

  const distanceKm = haversineKm(STORE_LOCATION, coords);
  const withinRadius = distanceKm <= DELIVERY_RADIUS_KM;

  return NextResponse.json({
    ok: withinRadius,
    distanceKm: Math.round(distanceKm * 100) / 100,
    radiusKm: DELIVERY_RADIUS_KM,
    address: addressLabel || undefined,
    cep: cepFmt,
    store: STORE_LOCATION,
    target: coords,
  });
}
