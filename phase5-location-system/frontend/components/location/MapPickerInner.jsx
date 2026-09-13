"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet's default marker icon paths break under Next.js/webpack bundling
// unless pointed at absolute URLs explicitly.
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ClickHandler({ onMove }) {
  useMapEvents({
    click(e) {
      onMove(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Default center: Karachi — change to whatever city your store mainly serves.
const DEFAULT_CENTER = [24.8607, 67.0011];

export default function MapPickerInner({ latitude, longitude, onChange, zoom = 15 }) {
  const [position, setPosition] = useState(latitude && longitude ? [latitude, longitude] : DEFAULT_CENTER);

  useEffect(() => {
    if (latitude && longitude) setPosition([latitude, longitude]);
  }, [latitude, longitude]);

  const handleMove = (lat, lng) => {
    setPosition([lat, lng]);
    onChange(lat, lng);
  };

  return (
    <div className="h-72 w-full overflow-hidden rounded-lg border">
      <MapContainer center={position} zoom={zoom} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={position}
          icon={markerIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = e.target.getLatLng();
              handleMove(lat, lng);
            },
          }}
        />
        <ClickHandler onMove={handleMove} />
      </MapContainer>
    </div>
  );
}
