// Configuração da área de entrega — Laticínios Popoio
export const STORE_LOCATION = {
  lat: -23.55974,
  lng: -46.5986,
  address: "Rua Madre de Deus, 292 — Mooca, São Paulo / SP",
};

// Raio de entrega em quilômetros
export const DELIVERY_RADIUS_KM = 5;
export const DELIVERY_BASE_FEE_CENTS = 700;
export const DELIVERY_EXTRA_PER_KM_CENTS = 180;
export const DELIVERY_BASE_DISTANCE_KM = 2;

export type Coords = { lat: number; lng: number };

export type DeliveryInput = {
  cep: string;
  number: string;
  complement?: string;
};

export type DeliveryAssessment = {
  ok: boolean;
  distanceKm: number;
  radiusKm: number;
  address?: string;
  cep: string;
  store: { lat: number; lng: number; address: string };
  target: { lat: number; lng: number };
  feeCents: number;
  windowLabel: string;
};

/** Distância Haversine em km entre dois pontos (lat/lng em graus). */
export function haversineKm(a: Coords, b: Coords): number {
  const R = 6371; // raio médio da Terra em km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Remove tudo que não é dígito e valida 8 dígitos. */
export function normalizeCep(input: string): string | null {
  const digits = (input || "").replace(/\D+/g, "");
  return digits.length === 8 ? digits : null;
}

export function formatCep(cep: string): string {
  const d = normalizeCep(cep);
  if (!d) return cep;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export type CepLookup = {
  cep: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  coords?: Coords;
  source: "brasilapi" | "viacep";
};

/**
 * Consulta um CEP brasileiro e retorna endereço + coordenadas (quando possível).
 * Primeiro tenta BrasilAPI v2 (já traz coordenadas para boa parte dos CEPs);
 * cai para ViaCEP em seguida (sem coordenadas) e depois geocodifica via Nominatim.
 */
export async function lookupCep(cepInput: string): Promise<CepLookup | null> {
  const cep = normalizeCep(cepInput);
  if (!cep) return null;

  // 1) BrasilAPI v2 — pode trazer coordenadas
  try {
    const r = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`, {
      // a Vercel/Next cacheia por padrão; pequeno cache é ok
      next: { revalidate: 60 * 60 * 24 },
    });
    if (r.ok) {
      const data = await r.json();
      const lat = data?.location?.coordinates?.latitude;
      const lng = data?.location?.coordinates?.longitude;
      const coords =
        lat && lng
          ? { lat: Number(lat), lng: Number(lng) }
          : undefined;
      return {
        cep,
        street: data.street || undefined,
        neighborhood: data.neighborhood || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        coords,
        source: "brasilapi",
      };
    }
  } catch {
    /* segue para fallback */
  }

  // 2) Fallback ViaCEP (sem coordenadas)
  try {
    const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      next: { revalidate: 60 * 60 * 24 },
    });
    if (r.ok) {
      const data = await r.json();
      if (!data?.erro) {
        return {
          cep,
          street: data.logradouro || undefined,
          neighborhood: data.bairro || undefined,
          city: data.localidade || undefined,
          state: data.uf || undefined,
          source: "viacep",
        };
      }
    }
  } catch {
    /* ignore */
  }

  return null;
}

/** Geocodifica um endereço livre via Nominatim (OpenStreetMap). */
export async function geocodeAddress(query: string): Promise<Coords | null> {
  if (!query?.trim()) return null;
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "br");
    url.searchParams.set("q", query);
    const r = await fetch(url.toString(), {
      headers: {
        // Nominatim exige User-Agent identificável
        "User-Agent": "LaticiniosPopoio/1.0 (contato@popoio.local)",
        "Accept-Language": "pt-BR",
      },
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!r.ok) return null;
    const arr = (await r.json()) as Array<{ lat: string; lon: string }>;
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return { lat: Number(arr[0].lat), lng: Number(arr[0].lon) };
  } catch {
    return null;
  }
}

export function computeDeliveryFeeCents(distanceKm: number): number {
  const extraKm = Math.max(0, distanceKm - DELIVERY_BASE_DISTANCE_KM);
  return DELIVERY_BASE_FEE_CENTS + Math.ceil(extraKm) * DELIVERY_EXTRA_PER_KM_CENTS;
}

export function buildDeliveryWindowLabel(now = new Date()): string {
  const current = new Date(now);
  const hour = current.getHours();

  if (hour >= 9 && hour < 19) {
    const start = new Date(current.getTime() + 60 * 60 * 1000);
    const end = new Date(current.getTime() + 120 * 60 * 1000);
    return `Hoje entre ${start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} e ${end.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  }

  const nextDay = new Date(current);
  nextDay.setDate(nextDay.getDate() + 1);
  return `Amanhã entre 09:00 e 12:00 (${nextDay.toLocaleDateString("pt-BR")})`;
}

export async function assessDelivery(input: DeliveryInput): Promise<
  { ok: false; status: number; error: string } | { ok: true; data: DeliveryAssessment }
> {
  const cepInput = (input.cep || "").trim();
  const number = (input.number || "").trim();
  const complement = (input.complement || "").trim();

  if (!cepInput) {
    return { ok: false, status: 400, error: "Informe um CEP para verificarmos." };
  }
  const normalizedCep = normalizeCep(cepInput);
  if (!normalizedCep) {
    return { ok: false, status: 400, error: "CEP inválido. Use o formato 00000-000." };
  }
  if (!number) {
    return { ok: false, status: 400, error: "Informe o número do endereço." };
  }

  const lookup = await lookupCep(normalizedCep);
  if (!lookup) {
    return {
      ok: false,
      status: 404,
      error: "Não encontramos esse CEP. Confira o número e tente de novo.",
    };
  }

  const streetWithNumber = lookup.street
    ? `${lookup.street}, ${number}${complement ? ` — ${complement}` : ""}`
    : `Número ${number}${complement ? ` — ${complement}` : ""}`;

  const addressLabel = [
    streetWithNumber,
    lookup.neighborhood,
    lookup.city && lookup.state ? `${lookup.city} / ${lookup.state}` : lookup.city || lookup.state,
  ]
    .filter(Boolean)
    .join(" — ");

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
    return {
      ok: false,
      status: 422,
      error:
        "Não conseguimos localizar esse endereço no mapa. Confira o CEP e o número e tente novamente.",
    };
  }

  const distanceKmRaw = haversineKm(STORE_LOCATION, coords);
  const distanceKm = Math.round(distanceKmRaw * 100) / 100;
  const feeCents = computeDeliveryFeeCents(distanceKmRaw);

  return {
    ok: true,
    data: {
      ok: distanceKmRaw <= DELIVERY_RADIUS_KM,
      distanceKm,
      radiusKm: DELIVERY_RADIUS_KM,
      address: addressLabel || undefined,
      cep: lookup.cep,
      store: STORE_LOCATION,
      target: coords,
      feeCents,
      windowLabel: buildDeliveryWindowLabel(),
    },
  };
}
