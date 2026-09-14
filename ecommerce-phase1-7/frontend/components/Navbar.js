"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/lib/i18n/navigation";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (nextLocale) => {
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <nav className="flex items-center justify-between border-b px-6 py-4">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-bold text-primary">
          Shop
        </Link>
        <Link href="/products?category=men">{t("men")}</Link>
        <Link href="/products?category=women">{t("women")}</Link>
        <Link href="/products">{t("products")}</Link>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/cart">{t("cart")}</Link>
        <Link href="/wishlist">{t("wishlist")}</Link>
        <Link href="/account">{t("account")}</Link>

        <select
          value={locale}
          onChange={(e) => switchLocale(e.target.value)}
          className="rounded border px-2 py-1 text-sm"
          aria-label="Language switcher"
        >
          <option value="en">🇬🇧 English</option>
          <option value="ar">🇸🇦 العربية</option>
        </select>
      </div>
    </nav>
  );
}
