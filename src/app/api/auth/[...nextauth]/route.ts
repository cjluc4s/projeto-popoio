import { handlers } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export const GET = handlers.GET;

export async function POST(req: NextRequest) {
	const forwardedFor = req.headers.get("x-forwarded-for") || "";
	const ip = forwardedFor.split(",")[0]?.trim() || "unknown";
	const limited = checkRateLimit({
		key: `auth:${ip}`,
		limit: 20,
		windowMs: 10 * 60 * 1000,
	});

	if (!limited.allowed) {
		return NextResponse.json(
			{ error: "Muitas tentativas de login. Aguarde alguns minutos e tente novamente." },
			{
				status: 429,
				headers: {
					"Retry-After": String(Math.ceil((limited.resetAt - Date.now()) / 1000)),
				},
			},
		);
	}

	return handlers.POST(req);
}
