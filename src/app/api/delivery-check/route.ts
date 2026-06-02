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
  let body: { cep?: string; number?: string; complement?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  }

  const cepInput = (body.cep || "").trim();
  const number = (body.number || "").trim();
  const complement = (body.complement || "").trim();

  if (!cepInput) {
    return NextResponse.json(
      { error: "Informe um CEP para verificarmos." },
      { status: 400 },
    );
  }
  if (!normalizeCep(cepInput)) {
    return NextResponse.json(
      { error: "CEP inválido. Use o formato 00000-000." },
      { status: 400 },
    );
  }
  if (!number) {
    return NextResponse.json(
      { error: "Informe o número do endereço." },
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

  const streetWithNumber = lookup.street
    ? `${lookup.street}, ${number}${complement ? ` — ${complement}` : ""}`
    : `Número ${number}${complement ? ` — ${complement}` : ""}`;

  const addressLabel = [
    streetWithNumber,
    lookup.neighborhood,
    lookup.city && lookup.state
      ? `${lookup.city} / ${lookup.state}`
      : lookup.city || lookup.state,
  ]
    .filter(Boolean)
    .join(" — ");

  // Geocodifica com número (mais preciso); fallback para coords do CEP.
  const geocodeQuery = [
    lookup.street ? `${lookup.street}, ${number}` : undefined,
    lookup.neighborhood,
    lookup.city,
    lookup.state,
    lookup.cep,
    "Brasil",
  ]
    .filter(Boolean)
    .join(", ");

  let coords = await geocodeAddress(geocodeQuery);
  if (!coords && lookup.coords) coords = lookup.coords;

  if (!coords) {
    return NextResponse.json(
      {
        error:
          "Não conseguimos localizar esse endereço no mapa. Confira o CEP e o número e tente novamente.",
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
    cep: lookup.cep,
    store: STORE_LOCATION,
    target: coords,
  });
}
