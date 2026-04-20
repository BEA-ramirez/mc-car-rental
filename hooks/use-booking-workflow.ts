"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBookingDocumentsAction,
  generateContractAction,
  startTripAction,
} from "@/actions/booking-workflow"; // Ensure this matches your file name
import { getInspectionTemplate } from "@/actions/settings";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys"; // <-- NEW IMPORT

export const useBookingWorkflows = (bookingId: string | undefined) => {
  const queryClient = useQueryClient();

  // 1. Fetch documents specific to this booking
  const query = useQuery({
    // Fallback to empty string for TS if undefined
    queryKey: QUERY_KEYS.bookings.workflowDocs(bookingId || ""),
    queryFn: async () => {
      const res = await getBookingDocumentsAction(bookingId!);
      if (!res.success) throw new Error("Failed to fetch documents");
      return res;
    },
    enabled: !!bookingId,
  });

  // 2. Fetch the global inspection template from Settings
  const templateQuery = useQuery({
    queryKey: QUERY_KEYS.documents.inspectionTemplate,
    queryFn: async () => await getInspectionTemplate(),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  // 3. Generate Contract Mutation
  const generateContractMutation = useMutation({
    mutationFn: generateContractAction,
    onSuccess: (data) => {
      if (data.success && bookingId) {
        // Ripple 1: Update the specific booking's document list
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.bookings.workflowDocs(bookingId),
        });
        // Ripple 2: Update the specific booking details (readiness checks)
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.bookings.details(bookingId),
        });
        // Ripple 3: Update the Global Documents -> Contracts tab
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.documents.contracts,
        });

        // No toast needed as requested, happens silently in background
      } else if (!data.success) {
        toast.error(data.message || "Failed to generate contract.");
      }
    },
  });

  // 4. Start Trip Mutation (Changes status to ONGOING)
  const startTripMutation = useMutation({
    mutationFn: startTripAction,
    onSuccess: (data) => {
      if (data.success && bookingId) {
        toast.success("Vehicle officially handed over. Trip is now ongoing!");

        // --- THE "TRIP STARTED" RIPPLES ---

        // 1. Sync the specific booking details
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.bookings.details(bookingId),
        });

        // 2. Sync all Booking views (Admin List, Scheduler Timeline, Customer List)
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all });

        // 3. Sync Dashboard (KPIs like "Active Rentals" go up!)
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.dashboard.summary,
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.dashboard.recentBookings,
        });

        // 4. Sync Car Details (Car is now actively on the road)
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
    generateContract: generateContractMutation.mutateAsync,
    isGeneratingContract: generateContractMutation.isPending,
    startTrip: startTripMutation.mutateAsync,
    isStartingTrip: startTripMutation.isPending,
  };
};
