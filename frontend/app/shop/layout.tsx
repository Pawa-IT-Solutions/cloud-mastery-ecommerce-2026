"use client";

import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
import { ShopProvider, useShop } from "./ShopProvider";
import { Toaster } from "react-hot-toast";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-shop",
  weight: ["400", "500", "700"],
});

function ShopNavigation() {
  const { cartCount } = useShop();

  const links = [
    { href: "/shop", label: "Home" },
    { href: "/shop/products", label: "Products" },
    { href: "/shop/car-parts", label: "Car Parts" },
    { href: "/shop/finance", label: "Finance" },
    { href: "/shop/orders", label: "My Orders" },
    { href: "/shop/cart", label: `Cart (${cartCount})` },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-amber-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <Link href="/shop" className="text-xl font-bold tracking-tight text-slate-900">
          Hazel Market
        </Link>

        <nav className="flex items-center gap-2 rounded-full bg-amber-50 p-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShopProvider>
      <div
        className={`${spaceGrotesk.variable} min-h-screen bg-[radial-gradient(circle_at_20%_20%,#fff1d6_0,#fff9ec_35%,#f6f7fb_100%)] font-sans text-slate-900`}
      >
        <ShopNavigation />
        <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">{children}</main>
        <Toaster />
      </div>
    </ShopProvider>
  );
}
