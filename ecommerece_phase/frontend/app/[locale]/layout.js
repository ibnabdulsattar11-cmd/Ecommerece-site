import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { routing, LOCALE_DIRECTION } from "@/lib/i18n/routing";
import AuthProvider from "@/components/AuthProvider";
import CartProvider from "@/components/CartProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "../globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SITE_NAME = "Shop";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — Quality products, delivered fast`, template: `%s | ${SITE_NAME}` },
  description:
    "Shop quality products with fast, reliable delivery. Browse our full catalog of electronics, fashion, and more.",
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  const dir = LOCALE_DIRECTION[locale] || "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body className="flex min-h-screen flex-col bg-gray-50 text-gray-900 antialiased">
        <NextIntlClientProvider>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <div className="flex-1">{children}</div>
              <Footer />
            </CartProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
