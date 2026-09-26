"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/lib/i18n/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import SearchBar from "@/components/ui/SearchBar";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const itemCount = useCartStore((s) => s.cart?.itemCount || 0);

  const switchLocale = (nextLocale) => {
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-primary-700">
          Trendstars
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 lg:flex">
          <Link href="/products" className="hover:text-primary-700">
            {t("products")}
          </Link>
          <Link href="/products?category=men" className="hover:text-primary-700">
            {t("men")}
          </Link>
          <Link href="/products?category=women" className="hover:text-primary-700">
            {t("women")}
          </Link>
        </nav>

        <div className="hidden max-w-md flex-1 md:block">
          <SearchBar />
        </div>

        <div className="flex items-center gap-4">
          <select
            value={locale}
            onChange={(e) => switchLocale(e.target.value)}
            className="hidden rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs sm:block"
            aria-label="Language switcher"
          >
            <option value="en">EN</option>
            <option value="ar">AR</option>
          </select>

          <Link href="/wishlist" aria-label="Wishlist" className="text-gray-600 hover:text-primary-700">
            ♡
          </Link>

          <Link href="/cart" aria-label="Cart" className="relative text-gray-600 hover:text-primary-700">
            🛒
            {itemCount > 0 && (
              <span className="absolute -end-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-primary-900">
                {itemCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <Link href="/account" className="text-sm font-medium text-gray-700 hover:text-primary-700">
              {user?.name?.split(" ")[0] || t("account")}
            </Link>
          ) : (
            <Link href="/login" className="btn-primary !px-4 !py-2 text-xs">
              {t("login")}
            </Link>
          )}

          <button
            className="text-gray-600 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            ☰
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-100 px-4 py-3 lg:hidden">
          <SearchBar />
          <nav className="mt-3 flex flex-col gap-2 text-sm font-medium text-gray-600">
            <Link href="/products">{t("products")}</Link>
            <Link href="/products?category=men">{t("men")}</Link>
            <Link href="/products?category=women">{t("women")}</Link>
            <Link href="/wishlist">{t("wishlist")}</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
