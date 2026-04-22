"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBookingDocumentsAction,
  generateContractAction,
  startTripAction,
} from "@/actions/booking-workflow";
import { getInspectionTemplate } from "@/actions/settings";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys";

export const useBookingWorkflows = (bookingId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.bookings.workflowDocs(bookingId || ""),
    queryFn: async () => {
      const res = await getBookingDocumentsAction(bookingId!);
      if (!res.success) throw new Error("Failed to fetch documents");
      return res;
    },
    enabled: !!bookingId,
  });

  const templateQuery = useQuery({
    queryKey: QUERY_KEYS.documents.inspectionTemplate,
    queryFn: async () => await getInspectionTemplate(),
    staleTime: 1000 * 60 * 60,
  });

  const generateContractMutation = useMutation({
    mutationFn: (bookingId: string) => generateContractAction(bookingId),
    onSuccess: (data, bookingId) => {
      if (data.success && bookingId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.bookings.workflowDocs(bookingId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.bookings.details(bookingId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.documents.contracts,
        });
      } else if (!data.success) {
        toast.error(data.message || "Failed to generate contract.");
      }
    },
  });

  // --- THE FIX: We just re-use the generator with overrides! ---
  const updateContractFieldsMutation = useMutation({
    mutationFn: ({
      bookingId,
      destination,
      fuelLevel,
    }: {
      bookingId: string;
      destination: string;
      fuelLevel: string;
    }) => generateContractAction(bookingId, { destination, fuelLevel }),
    onSuccess: (data) => {
      if (data.success && bookingId) {
        toast.success("Contract variables updated!");
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.bookings.workflowDocs(bookingId),
        });
      } else {
        toast.error(data.message || "Failed to update contract.");
      }
    },
  });

  const startTripMutation = useMutation({
    mutationFn: startTripAction,
    onSuccess: (data) => {
      if (data.success && bookingId) {
        toast.success("Vehicle officially handed over. Trip is now ongoing!");
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.bookings.details(bookingId),
        });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.dashboard.summary,
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.dashboard.recentBookings,
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.fleet.detailBase,
        });
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
    // Original Generator
    generateContract: generateContractMutation.mutateAsync,
    isGeneratingContract: generateContractMutation.isPending,
    // The Quick Edit Updater
    updateContractFields: updateContractFieldsMutation.mutateAsync,
    isUpdatingContract: updateContractFieldsMutation.isPending,
    // Trip Start
    startTrip: startTripMutation.mutateAsync,
    isStartingTrip: startTripMutation.isPending,
  };
};
