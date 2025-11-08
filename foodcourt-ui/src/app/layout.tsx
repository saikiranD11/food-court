// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { HeaderAuth } from "@/app/parts/HeaderAuth";

export const metadata: Metadata = {
  title: "FoodCourt",
  description: "Smart Billing for Food Courts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        {/* Top Nav (Zomato-style: clean, pill buttons) */}
        <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold text-xl tracking-tight">
              FoodCourt
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/orders"
                className="rounded-full border px-3 py-1 text-sm hover:bg-gray-50"
              >
                Orders
              </Link>
              <Link
                href="/cart"
                className="rounded-full border px-3 py-1 text-sm hover:bg-gray-50"
              >
                Cart
              </Link>
              <HeaderAuth />
            </div>
          </nav>
        </header>

        {/* Page Content */}
        <main className="mx-auto max-w-5xl p-4">{children}</main>

        {/* Footer (optional) */}
        <footer className="border-t bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 text-sm text-gray-600">
            <span>© {new Date().getFullYear()} FoodCourt</span>
            <div className="flex gap-4">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <Link href="/orders" className="hover:underline">
                Orders
              </Link>
              <Link href="/cart" className="hover:underline">
                Cart
              </Link>
              <Link href="/login" className="hover:underline">
                Login
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
