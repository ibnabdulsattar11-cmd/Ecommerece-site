"use client";

import { useState } from "react";

export default function ProductGallery({ images, name }) {
  const [active, setActive] = useState(0);

  if (!images.length) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl2 bg-gray-100 text-gray-400">
        No image available
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-xl2 bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active].url}
          alt={`${name} — image ${active + 1}`}
          className="h-full w-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.id || i}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                i === active ? "border-primary-600" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
