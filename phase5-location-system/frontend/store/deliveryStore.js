import { create } from "zustand";
import { checkDelivery } from "@/lib/api/location";

/**
 * Single source of truth for "where is this order going and can we deliver
 * there". Set once from the address form / LocationPicker; read again by
 * the cart page (shipping estimate) and Phase 6's checkout flow.
 */
export const useDeliveryStore = create((set) => ({
  selectedAddress: null, // { city, area, country, street, latitude, longitude, displayName }
  deliveryInfo: null, // { available, shippingCharge?, estimatedDeliveryDays?, reason? }
  loading: false,

  setSelectedAddress: async (address) => {
    set({ selectedAddress: address, loading: true });
    try {
      const res = await checkDelivery({
        city: address.city,
        area: address.area,
        latitude: address.latitude,
        longitude: address.longitude,
      });
      set({ deliveryInfo: res.data, loading: false });
    } catch (err) {
      set({
        deliveryInfo: { available: false, reason: "Could not verify delivery for this address" },
        loading: false,
      });
    }
  },

  clear: () => set({ selectedAddress: null, deliveryInfo: null }),
}));
