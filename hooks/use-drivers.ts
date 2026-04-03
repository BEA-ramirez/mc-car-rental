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

  // FORM ACTION: Passes validation errors back to the component. No throwing!
  const saveMutation = useMutation({
    mutationFn: async (data: DriverFormValues) => {
      return await saveDriver(data);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["drivers"] });
      }
    },
    onError: (error: Error) => {
      toast.error("Network error. Please try again.");
    },
  });

  // NORMAL ACTION: Throws error and handles its own toasts
  const deleteMutation = useMutation({
    mutationFn: async (driverId: string) => {
      const result = await deleteDriverAction(driverId);
      if (!result.success)
        throw new Error(result.message || "Failed to delete driver.");
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message || "Driver deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["driver-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
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
    queryKey: [
      "dispatch-availability",
      startDate?.toISOString(),
      endDate?.toISOString(),
    ],
    queryFn: async () => {
      if (!startDate || !endDate) return [];
      return await fetchDispatchAvailability(startDate, endDate);
    },
    enabled: !!startDate && !!endDate,
    staleTime: 0,
  });

  // NORMAL ACTION: Added the success check and throw translation
  const savePlanMutation = useMutation({
    mutationFn: async (params: {
      bookingId: string;
      segments: { driverId: string; start: Date; end: Date }[];
    }) => {
      const result = await saveDispatchPlan(params.bookingId, params.segments);
      // Ensure we translate the ActionState to a thrown error if it fails
      if (!result.success)
        throw new Error(result.message || "Failed to save dispatch plan.");
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message || "Dispatch plan saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["scheduler_data"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-availability"] });
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

  // NORMAL ACTION
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
      if (!result.success || !result.data) throw new Error(result.message);
      return result.data;
    },
  });
};

export const useDriverPerformance = (driverId: string) => {
  return useQuery({
    queryKey: ["driver-performance", driverId],
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
    queryKey: ["driver-documents", driverId],
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
    queryKey: ["pending-drivers"],
    queryFn: async () => {
      const result = await getPendingDriversAction();
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
  });

  // NORMAL ACTION: Added toasts
  const verifyMutation = useMutation({
    mutationFn: async ({ driverId }: { driverId: string }) => {
      const result = await verifyDriverAction(driverId);
      if (!result.success)
        throw new Error(result.message || "Failed to verify driver.");
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message || "Driver verified successfully.");
      queryClient.invalidateQueries({ queryKey: ["pending-drivers"] });
      queryClient.invalidateQueries({ queryKey: ["driver-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // NORMAL ACTION: Added toasts
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
      queryClient.invalidateQueries({ queryKey: ["pending-drivers"] });
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
