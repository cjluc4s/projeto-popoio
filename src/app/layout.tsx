import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { NavBar } from "@/components/NavBar";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Laticínios Popoio — Mercearia online",
  description:
    "Laticínios Popoio LTDA — produtos frescos da Mooca, São Paulo. Peça pelo WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <NavBar />
          <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
            {children}
          </main>
          <footer className="mt-8 bg-[var(--brand-dark)] text-white">
            <div className="mx-auto max-w-6xl px-4 py-6 grid gap-4 sm:grid-cols-3 text-sm">
              <div>
                <p className="logo-wordmark text-lg">
                  Laticínios <span className="accent">Popoio</span>
                </p>
                <p className="text-white/70 mt-1">
                  Tradição na Mooca há mais de 45 anos.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">Endereço</p>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Rua+Madre+de+Deus+292+Mooca+São+Paulo+SP"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-[var(--butter)] underline-offset-2 hover:underline inline-flex items-start gap-1 transition-colors"
                  title="Ver no Google Maps"
                >
                  <span aria-hidden>📍</span>
                  <span>
                    Rua Mad de Deus, 292 — Mooca
                    <br />
                    São Paulo / SP — 03119-000
                  </span>
                </a>
              </div>
              <div>
                <p className="font-semibold mb-1">Pedidos</p>
                <p className="text-white/80">
                  Pelo site • Entrega na região
                </p>
                <p className="text-white/60 text-xs mt-2">
                  CNPJ 60.285.178/0001-58
                </p>
              </div>
            </div>
            <div className="bg-black/20 text-center text-xs text-white/70 py-3 px-4 flex flex-col sm:flex-row items-center justify-center gap-x-4 gap-y-1">
              <span>© {new Date().getFullYear()} Laticínios Popoio LTDA</span>
              <span className="hidden sm:inline opacity-50">•</span>
              <Link href="/termos" className="hover:text-[var(--butter)] hover:underline underline-offset-2">
                Termos de Uso
              </Link>
              <span className="hidden sm:inline opacity-50">•</span>
              <Link href="/privacidade" className="hover:text-[var(--butter)] hover:underline underline-offset-2">
                Política de Privacidade
              </Link>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
