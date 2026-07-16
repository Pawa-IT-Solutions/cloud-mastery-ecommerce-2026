"use client";

import Link from "next/link";
import { useState } from "react";
import { Hanken_Grotesk } from "next/font/google";
import { ShopProvider, useShop } from "./ShopProvider";
import { Toaster } from "react-hot-toast";

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-shop",
});

function ShopNavigation() {
  const { cartCount, resetShopState } = useShop();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const links = [
    { href: "/shop", label: "Home" },
    { href: "/shop/products", label: "Products" },
    { href: "/shop/car-parts", label: "Car Parts" },
    { href: "/shop/finance", label: "Finance" },
    { href: "/shop/orders", label: "My Orders" },
    { href: "/shop/cart", label: `Cart (${cartCount})` },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#aa9284] text-[#f5ede9] shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <Link href="/shop" className="text-2xl font-bold tracking-tight">
          Soko Marketplace
        </Link>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          aria-controls="shop-mobile-nav"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-lg border border-[#6b5247] bg-[#4a3b32] p-2 text-[#f5ede9] transition hover:bg-[#6b5247] md:hidden"
        >
          <span className="sr-only">Open menu</span>
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {isMenuOpen ? (
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <path
                d="M4 7H20M4 12H20M4 17H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        </button>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#f5ede9] transition hover:text-[#d6cfc9]"
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={resetShopState}
            className="rounded-full border border-[#6b5247] bg-[#6b5247] px-4 py-1.5 text-sm font-medium text-[#f5ede9] transition hover:bg-[#d6cfc9] hover:text-[#4a3b32]"
          >
            Reset
          </button>
        </nav>
      </div>

      {isMenuOpen && (
        <nav id="shop-mobile-nav" className="border-t border-[#6b5247] bg-[#4a3b32] px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-[#f5ede9] transition hover:bg-[#6b5247]"
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                resetShopState();
                setIsMenuOpen(false);
              }}
              className="w-full text-left rounded-lg px-3 py-2 text-sm font-medium text-[#f5ede9] transition hover:bg-[#6b5247]"
            >
              Reset
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShopProvider>
      <div
        className={`${hankenGrotesk.variable} min-h-screen bg-[#f5f1ee] font-sans text-[#1f2937]`}
      >
        <ShopNavigation />
        <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">{children}</main>
        <Toaster />
      </div>
    </ShopProvider>
  );
}
