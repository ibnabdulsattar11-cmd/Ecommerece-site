"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { searchAddress } from "@/lib/api/location";

export default function AddressSearch({ onSelect }) {
  const locale = useLocale();
  const t = useTranslations("location");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchAddress(query, { locale });
        setResults(res.data || []);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query, locale]);

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
        placeholder={t("searchPlaceholder")}
        className="w-full rounded border px-3 py-2"
      />
      {loading && <p className="mt-1 text-xs text-gray-400">{t("searching")}</p>}
      {open && results.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded border bg-white shadow-lg">
          {results.map((r, i) => (
            <li
              key={i}
              onClick={() => {
                onSelect(r);
                setQuery(r.displayName);
                setOpen(false);
              }}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-50"
            >
              {r.displayName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
