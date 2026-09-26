const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || "USD";
const CURRENCY_LOCALE = process.env.NEXT_PUBLIC_CURRENCY_LOCALE || "en-US";

export function formatPrice(amount, locale = CURRENCY_LOCALE) {
  const value = parseFloat(amount) || 0;
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency: CURRENCY }).format(value);
  } catch {
    return `${CURRENCY} ${value.toFixed(2)}`;
  }
}

export function formatDate(dateString, locale = "en-US") {
  if (!dateString) return "";
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" }).format(
    new Date(dateString)
  );
}
