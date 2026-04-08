"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBookingDocumentsAction,
  generateContractAction,
  startTripAction,
} from "@/actions/booking-workflow"; // Ensure this matches your file name
import { getInspectionTemplate } from "@/actions/settings";
import { toast } from "sonner";

export const useBookingWorkflows = (bookingId: string | undefined) => {
  const queryClient = useQueryClient();

  // 1. Fetch documents specific to this booking
  const query = useQuery({
    queryKey: ["booking-docs", bookingId],
    queryFn: async () => {
      const res = await getBookingDocumentsAction(bookingId!);
      if (!res.success) throw new Error("Failed to fetch documents");
      return res;
    },
    enabled: !!bookingId,
  });

  // 2. Fetch the global inspection template from Settings
  const templateQuery = useQuery({
    queryKey: ["inspection-template"],
    queryFn: async () => await getInspectionTemplate(),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  // 3. Generate Contract Mutation
  const generateContractMutation = useMutation({
    mutationFn: generateContractAction,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: ["booking-docs", bookingId],
        });
        // We don't always need a toast here since it happens in the background,
        // but it's good for debugging.
      } else {
        toast.error(data.message || "Failed to generate contract.");
      }
    },
  });

  // 4. Start Trip Mutation (Changes status to ONGOING)
  const startTripMutation = useMutation({
    mutationFn: startTripAction,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Vehicle officially handed over. Trip is now ongoing!");
        queryClient.invalidateQueries({
          queryKey: ["booking-details", bookingId],
        });
        queryClient.invalidateQueries({ queryKey: ["bookings"] }); // Update main table
      } else {
        toast.error(data.message || "Failed to start trip.");
      }
    },
  });

  return {
    contract: query.data?.contract,
    inspections: query.data?.inspections || [],
    inspectionTemplate: templateQuery.data || [],
    isLoadingDocs: query.isLoading || templateQuery.isLoading,
    generateContract: generateContractMutation.mutateAsync,
    isGeneratingContract: generateContractMutation.isPending,
    startTrip: startTripMutation.mutateAsync,
    isStartingTrip: startTripMutation.isPending,
  };
};
