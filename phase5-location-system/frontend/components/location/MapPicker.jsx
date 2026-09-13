"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window` at import time, so it can only run in the
// browser. Loading it this way keeps the rest of the app (and SSR) safe.
const MapPickerInner = dynamic(() => import("./MapPickerInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 w-full items-center justify-center rounded-lg border bg-gray-50 text-sm text-gray-500">
      Loading map…
    </div>
  ),
});

export default function MapPicker(props) {
  return <MapPickerInner {...props} />;
}
