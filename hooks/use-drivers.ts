"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CompleteDriverType } from "@/lib/schemas/driver";
import {
  saveDriver,
  saveDriverApplication,
  getDriverSchedulesAction,
  getDriverPerformanceAction,
  getDriverDocumentsAction,
  getPendingDriversAction,
  verifyDriverAction,
  rejectDriverAction,
  deleteDriverAction,
} from "@/actions/manage-driver";
import {
  fetchDispatchAvailability,
  saveDispatchPlan,
} from "@/actions/dispatch";
import { DriverFormValues } from "@/lib/schemas/driver";
import { QUERY_KEYS } from "@/lib/query-keys"; // <-- NEW IMPORT

const fetchDrivers = async () => {
  const response = await fetch("/api/drivers");
  if (!response.ok) throw new Error("Failed to fetch drivers");
  const result = await response.json();
  return result as CompleteDriverType[];
};

export const useDrivers = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.drivers.all, // <-- UPDATED
    queryFn: fetchDrivers,
    staleTime: 60 * 1000,
  });

  // --- MASTER DRIVER INVALIDATOR ---
  const invalidateDriverRipples = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.drivers.all });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.drivers.schedules });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.summary }); // KPI update!
    // Optional: Wipes all cached dispatch lists so the new/deleted driver reflects immediately
    queryClient.invalidateQueries({ queryKey: ["dispatch-availability"] });
  };

  const saveMutation = useMutation({
    mutationFn: async (data: DriverFormValues) => {
      return await saveDriver(data);
    },
    onSuccess: (result) => {
      if (result.success) {
        invalidateDriverRipples();
      }
    },
    onError: (error: Error) => {
      toast.error("Network error. Please try again.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (driverId: string) => {
      const result = await deleteDriverAction(driverId);
      if (!result.success)
        throw new Error(result.message || "Failed to delete driver.");
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message || "Driver deleted successfully.");
      invalidateDriverRipples();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    ...query,
    saveDriver: saveMutation.mutateAsync,
    deleteDriver: deleteMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useDriverDispatch = (startDate?: Date, endDate?: Date) => {
  const queryClient = useQueryClient();

  const availabilityQuery = useQuery({
    queryKey: QUERY_KEYS.drivers.dispatch(
      startDate?.toISOString(),
      endDate?.toISOString(),
    ), // <-- UPDATED
    queryFn: async () => {
      if (!startDate || !endDate) return [];
      return await fetchDispatchAvailability(startDate, endDate);
    },
    enabled: !!startDate && !!endDate,
    staleTime: 0,
  });

  const savePlanMutation = useMutation({
    mutationFn: async (params: {
      bookingId: string;
      segments: { driverId: string; start: Date; end: Date }[];
    }) => {
      const result = await saveDispatchPlan(params.bookingId, params.segments);
      if (!result.success)
        throw new Error(result.message || "Failed to save dispatch plan.");
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message || "Dispatch plan saved successfully!");

      // --- DISPATCH RIPPLES ---
      // Fixes the scheduler typo and updates all related booking UI!
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.bookings.scheduler(),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all }); // Updates main booking table
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.bookings.detailsBase,
      }); // Updates specific booking view
      queryClient.invalidateQueries({ queryKey: ["dispatch-availability"] }); // Refreshes the local modal list
    },
    onError: (error: Error) => {
      toast.error(error.message);
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
      if (!result.success)
        throw new Error(
          result.message || "Failed to submit driver application",
        );
      return result;
    },
    onSuccess: (result) => {
      toast.success(
        result.message || "Driver application submitted successfully!",
      );
      // Fixed: Pings the admin's pending queue instead of the main list!
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.drivers.pending });
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
    queryKey: QUERY_KEYS.drivers.schedules, // <-- UPDATED
    queryFn: async () => {
      const result = await getDriverSchedulesAction();
      if (!result.success || !result.data) throw new Error(result.message);
      return result.data;
    },
  });
};

export const useDriverPerformance = (driverId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.drivers.performance(driverId), // <-- UPDATED
    queryFn: async () => {
      const result = await getDriverPerformanceAction(driverId);
      if (!result.success || !result.data) throw new Error(result.message);
      return result.data;
    },
    enabled: !!driverId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useDriverDocuments = (driverId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.drivers.documents(driverId), // <-- UPDATED
    queryFn: async () => {
      const result = await getDriverDocumentsAction(driverId);
      if (!result.success || !result.data) throw new Error(result.message);
      return result.data;
    },
    enabled: !!driverId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useDriverApplications = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: QUERY_KEYS.drivers.pending, // <-- UPDATED
    queryFn: async () => {
      const result = await getPendingDriversAction();
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ driverId }: { driverId: string }) => {
      const result = await verifyDriverAction(driverId);
      if (!result.success)
        throw new Error(result.message || "Failed to verify driver.");
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message || "Driver verified successfully.");
      // Ripples: Removes from queue, adds to main, updates schedules & KPIs
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.drivers.pending });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.drivers.schedules });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.drivers.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.summary });
    },
    onError: (error: Error) => {
      toast.error(error.message);
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
      if (!result.success)
        throw new Error(result.message || "Failed to reject driver.");
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message || "Driver rejected successfully.");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.drivers.pending });
    },
    onError: (error: Error) => {
      toast.error(error.message);
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
