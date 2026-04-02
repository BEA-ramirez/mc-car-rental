import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CompleteDriverType } from "@/lib/schemas/driver";
import {
  saveDriver,
  deleteDriver,
  getDriverById,
  saveDriverApplication,
  getDriverSchedulesAction,
  getDriverPerformanceAction,
  getDriverDocumentsAction,
  getPendingDriversAction,
  verifyDriverAction,
  rejectDriverAction,
} from "@/actions/manage-driver";
import {
  fetchDispatchAvailability,
  saveDispatchPlan,
} from "@/actions/dispatch";

const fetchDrivers = async () => {
  const response = await fetch("/api/drivers");
  if (!response.ok) throw new Error("Failed to fetch drivers");
  const result = await response.json();
  return result as CompleteDriverType[];
};

export const useDrivers = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["drivers"],
    queryFn: fetchDrivers,
    staleTime: 60 * 1000,
  });

  const saveMutation = useMutation({
    mutationFn: saveDriver,
    onSuccess: () => {
      toast.success("Driver saved successfully");
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDriver,
    onSuccess: () => {
      toast.success("Driver deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    ...query,
    saveDriver: saveMutation.mutate,
    deleteDriver: deleteMutation.mutate,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useDriverDispatch = (startDate?: Date, endDate?: Date) => {
  const queryClient = useQueryClient();

  // 1. Fetch available drivers for the specific date range
  const availabilityQuery = useQuery({
    queryKey: [
      "dispatch-availability",
      startDate?.toISOString(),
      endDate?.toISOString(),
    ],
    queryFn: async () => {
      if (!startDate || !endDate) return [];
      return await fetchDispatchAvailability(startDate, endDate);
    },
    // Only run this query if we actually have dates (i.e., the modal is open)
    enabled: !!startDate && !!endDate,
    staleTime: 0, // Always fetch fresh data for dispatching to prevent double-booking
  });

  // 2. Save the dispatch segments
  const savePlanMutation = useMutation({
    mutationFn: async (params: {
      bookingId: string;
      segments: { driverId: string; start: Date; end: Date }[];
    }) => {
      return await saveDispatchPlan(params.bookingId, params.segments);
    },
    onSuccess: () => {
      toast.success("Dispatch plan saved successfully!");
      // Invalidate the scheduler so the timeline immediately updates with the new driver names
      queryClient.invalidateQueries({ queryKey: ["scheduler_data"] });
      // Invalidate availability so the next time we open it, it's accurate
      queryClient.invalidateQueries({ queryKey: ["dispatch-availability"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save dispatch plan.");
    },
  });

  return {
    availableDrivers: availabilityQuery.data || [],
    isLoadingAvailability: availabilityQuery.isLoading,
    saveDispatchPlan: savePlanMutation.mutateAsync,
    isSavingDispatch: savePlanMutation.isPending,
  };
};

export const useDriverApplication = () => {
  const queryClient = useQueryClient();
  const saveApplicationMutation = useMutation({
    mutationFn: async () => {
      const result = await saveDriverApplication();
      if (!result.success) {
        throw new Error(
          result.message || "Failed to submit driver application",
        );
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Driver application submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    applyForDriver: saveApplicationMutation.mutateAsync,
    isApplying: saveApplicationMutation.isPending,
  };
};

export const useDriverSchedules = () => {
  return useQuery({
    queryKey: ["driver-schedules"],
    queryFn: async () => {
      const result = await getDriverSchedulesAction();
      if (!result.success || !result.data) {
        throw new Error(result.message);
      }
      return result.data;
    },
  });
};

export const useDriverPerformance = (driverId: string) => {
  return useQuery({
    queryKey: ["driver-performance", driverId],
    queryFn: async () => {
      const result = await getDriverPerformanceAction(driverId);
      if (!result.success || !result.data) {
        throw new Error(result.message);
      }
      return result.data;
    },
    enabled: !!driverId, // Only run if a driverId is provided
    staleTime: 5 * 60 * 1000,
  });
};

export const useDriverDocuments = (driverId: string) => {
  return useQuery({
    queryKey: ["driver-documents", driverId],
    queryFn: async () => {
      const result = await getDriverDocumentsAction(driverId);
      if (!result.success || !result.data) {
        throw new Error(result.message);
      }
      return result.data;
    },
    enabled: !!driverId, // Only fetch if a valid driverId is provided
    staleTime: 5 * 60 * 1000,
  });
};

export const useDriverApplications = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["pending-drivers"],
    queryFn: async () => {
      const result = await getPendingDriversAction();
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ driverId }: { driverId: string }) => {
      const result = await verifyDriverAction(driverId);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-drivers"] });
      // You should also invalidate the active fleet schedule here if needed
      queryClient.invalidateQueries({ queryKey: ["driver-schedules"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({
      driverId,
      reason,
    }: {
      driverId: string;
      reason: string;
    }) => {
      const result = await rejectDriverAction(driverId, reason);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-drivers"] });
    },
  });

  return {
    pendingDrivers: data || [],
    isLoading,
    isFetching,
    verifyDriver: verifyMutation.mutateAsync,
    rejectDriver: rejectMutation.mutateAsync,
  };
};
