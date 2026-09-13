import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  localePrefix: "always", // /en/... , /ar/...
});

export const LOCALE_DIRECTION = {
  en: "ltr",
  ar: "rtl",
};
