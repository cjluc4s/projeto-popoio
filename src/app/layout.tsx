import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { NavBar } from "@/components/NavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Laticínios Popóio",
  description: "Mercearia online - Laticínios Popóio LTDA, Mooca, São Paulo",
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
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        <Providers>
          <NavBar />
          <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
            {children}
          </main>
          <footer className="border-t bg-white text-center text-xs text-stone-500 py-4 px-4">
            © {new Date().getFullYear()} Laticínios Popóio LTDA — Rua Mad de Deus,
            292 - Mooca, São Paulo - SP
          </footer>
        </Providers>
      </body>
    </html>
  );
}
