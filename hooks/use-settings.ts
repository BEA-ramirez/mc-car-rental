"use client";

import { useQuery } from "@tanstack/react-query";
import { getSystemSettings } from "@/actions/settings";

const BOOKING_KEYS = [
  "booking_fees",
  "business_hubs",
  "tax_settings",
  "payment_methods",
];

export const useBookingSettings = () => {
  return useQuery({
    queryKey: ["settings", "booking"],
    queryFn: async () => {
      const data = await getSystemSettings(BOOKING_KEYS);
      return {
        fees: data.booking_fees || {},
        hubs: data.business_hubs || [],
        tax: data.tax_settings || {},
        payments: data.payment_methods || {},
      };
    },
    // Reduced to 2 minutes so updates appear faster for admins
    staleTime: 1000 * 60 * 2,
  });
};
