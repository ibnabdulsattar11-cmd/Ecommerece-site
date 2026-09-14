import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, LOCALE_DIRECTION } from "@/lib/i18n/routing";
import AuthProvider from "@/components/AuthProvider";
import "../globals.css";

export const metadata = {
  title: "Shop",
  description: "Bilingual e-commerce platform",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const dir = LOCALE_DIRECTION[locale] || "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body className="bg-white text-gray-900 antialiased">
        <NextIntlClientProvider>
          <AuthProvider>{children}</AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
