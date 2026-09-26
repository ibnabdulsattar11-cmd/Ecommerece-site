"use client";

import { useSearchParams } from "next/navigation";
import { usePathname } from "@/lib/i18n/navigation";

export default function Pagination({ currentPage, totalPages }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const buildHref = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page);
    return `${pathname}?${params.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2
  );

  return (
    <nav aria-label="Pagination" className="mt-8 flex justify-center gap-1">
      {currentPage > 1 && (
        <a href={buildHref(currentPage - 1)} className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50">
          Prev
        </a>
      )}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-gray-400">…</span>}
          <a
            href={buildHref(p)}
            aria-current={p === currentPage ? "page" : undefined}
            className={`rounded border px-3 py-1.5 text-sm ${
              p === currentPage ? "border-primary bg-primary text-white" : "hover:bg-gray-50"
            }`}
          >
            {p}
          </a>
        </span>
      ))}
      {currentPage < totalPages && (
        <a href={buildHref(currentPage + 1)} className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50">
          Next
        </a>
      )}
    </nav>
  );
}
