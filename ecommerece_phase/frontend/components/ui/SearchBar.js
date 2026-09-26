"use client";

import { useState } from "react";
import { useRouter } from "@/lib/i18n/navigation";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="relative">
      <label htmlFor="site-search" className="sr-only">
        Search products
      </label>
      <input
        id="site-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products…"
        className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-primary-400 focus:bg-white"
      />
    </form>
  );
}
