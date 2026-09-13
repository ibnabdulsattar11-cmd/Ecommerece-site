"use client";

import { useTranslations } from "next-intl";

export default function DeliveryZoneStatus({ deliveryInfo, loading }) {
  const t = useTranslations("location");

  if (loading) {
    return <p className="text-sm text-gray-400">{t("checkingDelivery")}</p>;
  }
  if (!deliveryInfo) return null;

  if (!deliveryInfo.available) {
    return (
      <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
        {deliveryInfo.reason || t("notAvailable")}
      </p>
    );
  }

  return (
    <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">
      {t("availableWithCharge", {
        charge: deliveryInfo.shippingCharge,
        days: deliveryInfo.estimatedDeliveryDays,
      })}
    </p>
  );
}
