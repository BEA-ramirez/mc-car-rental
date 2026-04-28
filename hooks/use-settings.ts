"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSystemSettings,
  savePaymentMethods,
  PaymentMethods,
} from "@/actions/settings";
import { QUERY_KEYS } from "@/lib/query-keys";
import { toast } from "sonner";

const BOOKING_KEYS = [
  "booking_fees",
  "business_hubs",
  "tax_settings",
  "payment_methods",
  "vehicle_types",
];

export const useBookingSettings = () => {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: QUERY_KEYS.settings.booking,
    queryFn: async () => {
      const data = await getSystemSettings(BOOKING_KEYS);
      return {
        fees: data.booking_fees || {},
        hubs: data.business_hubs || [],
        tax: data.tax_settings || {},
        payments: data.payment_methods || {},
        vehicleTypes: data.vehicle_types || [],
      };
    },
    staleTime: 1000 * 60 * 2,
  });

  // --- MUTATIONS ---
  const savePaymentsMutation = useMutation({
    mutationFn: (methods: PaymentMethods) => savePaymentMethods(methods),
    onSuccess: () => {
      toast.success("Payment configurations saved successfully!");
      // Force a refresh of the settings so the UI updates instantly
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settings.booking });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save payment methods.");
    },
  });

  return {
    data: settingsQuery.data,
    isLoading: settingsQuery.isLoading || settingsQuery.isFetching,

    // Export mutation tools
    savePaymentMethods: savePaymentsMutation.mutateAsync,
    isSavingPayments: savePaymentsMutation.isPending,
  };
};
