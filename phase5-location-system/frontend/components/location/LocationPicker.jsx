"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import MapPicker from "./MapPicker";
import AddressSearch from "./AddressSearch";
import DeliveryZoneStatus from "./DeliveryZoneStatus";
import { reverseGeocode, checkDelivery } from "@/lib/api/location";

/**
 * Combines map + search + "use my location" + delivery-zone check into one
 * reusable block. Calls onChange with a full resolved address object every
 * time the location changes — spread the result straight into an Address
 * form (Phase 2) or the checkout step (Phase 6).
 */
export default function LocationPicker({ onChange, initialLatitude, initialLongitude }) {
  const locale = useLocale();
  const t = useTranslations("location");

  const [coords, setCoords] = useState(
    initialLatitude && initialLongitude ? { latitude: initialLatitude, longitude: initialLongitude } : null
  );
  const [address, setAddress] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState("");

  const resolve = async (latitude, longitude) => {
    setCoords({ latitude, longitude });
    setLoading(true);
    setGeoError("");
    try {
      const geo = await reverseGeocode(latitude, longitude, locale);
      const resolved = { ...geo.data, latitude, longitude };
      setAddress(resolved);
      onChange?.(resolved);

      const delivery = await checkDelivery({ city: resolved.city, area: resolved.area, locale });
      setDeliveryInfo(delivery.data);
    } catch (err) {
      setGeoError(t("resolveFailed"));
    } finally {
      setLoading(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError(t("geolocationUnsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords.latitude, pos.coords.longitude),
      () => setGeoError(t("geolocationDenied")),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <AddressSearch onSelect={(r) => resolve(r.latitude, r.longitude)} />

      <button type="button" onClick={useMyLocation} className="self-start text-sm text-primary hover:underline">
        {t("useMyLocation")}
      </button>

      <MapPicker
        latitude={coords?.latitude}
        longitude={coords?.longitude}
        onChange={(lat, lng) => resolve(lat, lng)}
      />

      {geoError && <p className="text-sm text-red-600">{geoError}</p>}

      {address && <p className="rounded border p-3 text-sm text-gray-600">{address.displayName}</p>}

      <DeliveryZoneStatus deliveryInfo={deliveryInfo} loading={loading} />
    </div>
  );
}
