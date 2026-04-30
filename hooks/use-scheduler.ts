"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSchedulerData } from "@/actions/scheduler";
import { startOfMonth, endOfMonth, addMonths, format } from "date-fns";
import {
  updateBookingStatus,
  updateBookingDates,
  updateBufferDuration,
  processEarlyReturn,
  createMaintenanceBlock,
  splitBooking,
  reassignBooking,
  deleteBooking,
} from "@/actions/bookings";
import {
  executeHandoverAction,
  executeReturnAction,
  executeNoShowAction,
  validateHandoverRequirements,
  validateReturnRequirements,
} from "@/actions/scheduler";
import { toast } from "sonner";
import { SchedulerEvent } from "@/components/scheduler/timeline-scheduler";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useScheduler(currentDate: Date) {
  const queryClient = useQueryClient();
  const baseQueryKey = QUERY_KEYS.bookings.scheduler();

  // The exact month view the user is currently looking at
  const currentQueryKey = QUERY_KEYS.bookings.scheduler(
    format(currentDate, "yyyy-MM"),
  );

  const invalidateAllRelatedQueries = (id?: string) => {
    // 1. Invalidate the month the user is actively viewing
    queryClient.invalidateQueries({ queryKey: currentQueryKey });

    // FIX: Explicitly invalidate the REAL-WORLD current month.
    // Actions like Handover/Return update dates to now(), which might fall outside the currentQueryKey!
    const realWorldCurrentMonthKey = QUERY_KEYS.bookings.scheduler(
      format(new Date(), "yyyy-MM"),
    );
    queryClient.invalidateQueries({ queryKey: realWorldCurrentMonthKey });

    // 2. Invalidate everything else
    queryClient.invalidateQueries({ queryKey: baseQueryKey });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.summary });
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.financials.masterLedger,
    });
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.financials.incomesDashboard,
    });

    if (id) {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.bookings.details(id),
      });
    }

    queryClient.invalidateQueries({ queryKey: ["pendingPayments"] });
  };

  const query = useQuery({
    queryKey: currentQueryKey,
    queryFn: async () => {
      const start = startOfMonth(addMonths(currentDate, -1));
      const end = endOfMonth(addMonths(currentDate, 1));
      return await getSchedulerData(start, end);
    },
    staleTime: 1000 * 60 * 5,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const result = await updateBookingStatus(id, status);
      if (!result.success)
        throw new Error(result.message || "Failed to update booking status");
      return result;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: baseQueryKey });
      const previousData = queryClient.getQueryData(currentQueryKey);

      queryClient.setQueryData(currentQueryKey, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          events: oldData.events.map((event: SchedulerEvent) =>
            event.id === variables.id
              ? { ...event, status: variables.status }
              : event,
          ),
        };
      });
      return { previousData };
    },
    onSuccess: (data, variables) => {
      toast.success("Booking marked as " + variables.status);
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(currentQueryKey, context.previousData);
      }
      toast.error(
        `Failed to update status to ${variables.status}: ${error.message}`,
      );
      console.error(error);
    },
    onSettled: (data, error, variables) => {
      invalidateAllRelatedQueries(variables.id);
    },
  });

  const updateDatesMutation = useMutation({
    mutationFn: async ({
      id,
      newEndDate,
      addedCharge = 0,
    }: {
      id: string;
      newEndDate: Date;
      addedCharge?: number;
    }) => {
      const result = await updateBookingDates(id, newEndDate, addedCharge);
      if (!result.success)
        throw new Error(result.message || "Failed to update booking dates");
      return result;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: baseQueryKey });
      const previousData = queryClient.getQueryData(currentQueryKey);

      queryClient.setQueryData(currentQueryKey, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          events: oldData.events.map((event: SchedulerEvent) =>
            event.id === variables.id
              ? { ...event, end: variables.newEndDate }
              : event,
          ),
        };
      });
      return { previousData };
    },
    onSuccess: (data) => {
      if (data.driverConflict) {
        toast.warning(
          "Booking extended, but the assigned driver has a scheduling conflict. Please reassign a new driver for the extended duration.",
          { duration: 6000 },
        );
      } else {
        toast.success("Booking dates updated successfully");
      }
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(currentQueryKey, context.previousData);
      }
      toast.error(`Failed to update dates: ${error.message}`);
      console.error(error);
    },
    onSettled: (data, error, variables) => {
      invalidateAllRelatedQueries(variables.id);
    },
  });

  const updateBufferMutation = useMutation({
    mutationFn: async ({
      id,
      newBuffer,
    }: {
      id: string;
      newBuffer: number;
    }) => {
      const result = await updateBufferDuration(id, newBuffer);
      if (!result.success)
        throw new Error(result.message || "Failed to update buffer duration");
      return result;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: baseQueryKey });
      const previousData = queryClient.getQueryData(currentQueryKey);

      queryClient.setQueryData(currentQueryKey, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          events: oldData.events.map((event: SchedulerEvent) =>
            event.id === variables.id
              ? { ...event, bufferDuration: variables.newBuffer }
              : event,
          ),
        };
      });
      return { previousData };
    },
    onSuccess: () => {
      toast.success("Buffer duration updated");
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(currentQueryKey, context.previousData);
      }
      toast.error(`Failed to update buffer duration: ${error.message}`);
      console.error(error);
    },
    onSettled: (data, error, variables) => {
      invalidateAllRelatedQueries(variables.id);
    },
  });

  const earlyReturnMutation = useMutation({
    mutationFn: async ({
      id,
      newEnd,
      finalPrice,
      refundAmount,
      shouldRefund,
    }: {
      id: string;
      newEnd: Date;
      finalPrice: number;
      refundAmount: number;
      shouldRefund: boolean;
    }) => {
      const result = await processEarlyReturn(
        id,
        newEnd,
        finalPrice,
        refundAmount,
        shouldRefund,
      );
      if (!result.success)
        throw new Error(result.message || "Failed to process early return");
      return result;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: baseQueryKey });
      const previousData = queryClient.getQueryData(currentQueryKey);
      queryClient.setQueryData(currentQueryKey, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          events: oldData.events.map((evt: SchedulerEvent) =>
            evt.id === variables.id
              ? {
                  ...evt,
                  end: variables.newEnd,
                  status: "COMPLETED",
                  amount: variables.finalPrice,
                  subtitle: "Returned Early",
                }
              : evt,
          ),
        };
      });
      return { previousData };
    },
    onSuccess: () => {
      toast.success("Early return processed");
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(currentQueryKey, context.previousData);
      }
      toast.error(`Failed to process early return: ${error.message}`);
      console.error(error);
    },
    onSettled: (data, error, variables) => {
      invalidateAllRelatedQueries(variables.id);
    },
  });

  const createMaintenanceMutation = useMutation({
    mutationFn: async ({
      carId,
      start,
      end,
    }: {
      carId: string;
      start: Date;
      end: Date;
    }) => {
      const result = await createMaintenanceBlock(carId, start, end);
      if (!result.success)
        throw new Error(result.message || "Failed to create maintenance block");
      return result;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: baseQueryKey });
      const previousData = queryClient.getQueryData(currentQueryKey);
      const tempId = `temp-maint-${Date.now()}`;
      queryClient.setQueryData(currentQueryKey, (oldData: any) => {
        if (!oldData) return oldData;
        const newBlock: SchedulerEvent = {
          id: tempId,
          resourceId: variables.carId,
          start: variables.start,
          end: variables.end,
          title: "Maintenance",
          subtitle: "Blocked",
          status: "MAINTENANCE",
          amount: 0,
        };
        return {
          ...oldData,
          events: [...oldData.events, newBlock],
        };
      });
      return { previousData };
    },
    onSuccess: () => {
      toast.success("Maintenance block created");
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(currentQueryKey, context.previousData);
      }
      toast.error(`Failed to create maintenance block: ${error.message}`);
      console.error(error);
    },
    onSettled: () => {
      invalidateAllRelatedQueries();
    },
  });

  const splitMutation = useMutation({
    mutationFn: async ({ id, splitDate }: { id: string; splitDate: Date }) => {
      const result = await splitBooking(id, splitDate);
      if (!result.success)
        throw new Error(result.message || "Failed to split booking");
      return result;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: baseQueryKey });
      const previousData = queryClient.getQueryData(currentQueryKey);
      queryClient.setQueryData(currentQueryKey, (oldData: any) => {
        if (!oldData) return oldData;
        const originalEvent = oldData.events.find(
          (e: SchedulerEvent) => e.id === variables.id,
        );
        if (!originalEvent) return oldData;
        const part2: SchedulerEvent = {
          ...originalEvent,
          id: `temp-split-${Date.now()}`,
          start: variables.splitDate,
          title: `${originalEvent.title} (Part 2)`,
          status: "PENDING",
        };
        return {
          ...oldData,
          events: [
            ...oldData.events.map((evt: SchedulerEvent) =>
              evt.id === variables.id
                ? { ...evt, end: variables.splitDate }
                : evt,
            ),
            part2,
          ],
        };
      });
      return { previousData };
    },
    onSuccess: () => {
      toast.success("Booking split into two parts");
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(currentQueryKey, context.previousData);
      }
      toast.error(`Failed to split booking: ${err.message}`);
      console.error(err);
    },
    onSettled: (data, error, variables) => {
      invalidateAllRelatedQueries(variables.id);
    },
  });

  const reassignMutation = useMutation({
    mutationFn: async ({
      id,
      newCarId,
      newPrice,
      isOverride,
    }: {
      id: string;
      newCarId: string;
      newPrice: number;
      isOverride: boolean;
    }) => {
      const result = await reassignBooking(id, newCarId, newPrice, isOverride);
      if (!result.success)
        throw new Error(result.message || "Failed to reassign");
      return result;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: currentQueryKey });
      const previousData = queryClient.getQueryData(currentQueryKey);

      queryClient.setQueryData(currentQueryKey, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          events: oldData.events.map((evt: SchedulerEvent) =>
            evt.id === variables.id
              ? {
                  ...evt,
                  resourceId: variables.newCarId,
                  amount: variables.newPrice,
                  status: "CONFIRMED",
                }
              : evt,
          ),
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(currentQueryKey, context.previousData);
      }
      toast.error("Failed to reassign booking");
    },
    onSuccess: () => {
      toast.success("Booking reassigned successfully!");
    },
    onSettled: (data, error, variables) => {
      invalidateAllRelatedQueries(variables?.id);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (variables: { id: string; reason: string }) => {
      const result = await deleteBooking(variables.id, variables.reason);
      if (!result.success)
        throw new Error(result.message || "Failed to delete booking");
      return result;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: currentQueryKey });
      const previousData = queryClient.getQueryData(currentQueryKey);
      queryClient.setQueryData(currentQueryKey, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          events: oldData.events.filter(
            (evt: SchedulerEvent) => evt.id !== variables.id,
          ),
        };
      });
      return { previousData };
    },
    onSuccess: () => toast.success("Booking deleted successfully"),
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(currentQueryKey, context.previousData);
      }
      toast.error(`Failed to delete: ${err.message}`);
    },
    onSettled: (data, error, variables) => {
      invalidateAllRelatedQueries(variables.id);
    },
  });

  // 1. Validate Handover
  const checkHandover = async (bookingId: string) => {
    const res = await validateHandoverRequirements(bookingId);
    if (!res.success) throw new Error(res.message);
    return res.data;
  };

  // 2. Validate Return
  const checkReturn = async (bookingId: string) => {
    const res = await validateReturnRequirements(bookingId);
    if (!res.success) throw new Error(res.message);
    return res.data;
  };

  // 3. Execute Handover (CONFIRMED -> ONGOING)
  const handoverMutation = useMutation({
    mutationFn: (bookingId: string) => executeHandoverAction(bookingId),
    onSuccess: (res, bookingId) => {
      if (res.success) {
        if (res.driverConflict) {
          toast.warning(
            "Vehicle released, but the time shift caused a driver scheduling conflict. Please review the driver's schedule.",
            { duration: 6000 },
          );
        } else {
          toast.success(res.message);
        }
        // Passes the booking ID to the master invalidator
        invalidateAllRelatedQueries(bookingId);
      } else {
        toast.error(res.message);
      }
    },
    onError: (error: any) =>
      toast.error(error.message || "Failed to handover vehicle."),
  });

  // 4. Execute Return (ONGOING -> COMPLETED)
  const returnMutation = useMutation({
    mutationFn: (bookingId: string) => executeReturnAction(bookingId),
    onSuccess: (res, bookingId) => {
      if (res.success) {
        toast.success(res.message);
        invalidateAllRelatedQueries(bookingId);
      } else {
        toast.error(res.message);
      }
    },
    onError: (error: any) =>
      toast.error(error.message || "Failed to return vehicle."),
  });

  // 5. Execute No-Show
  const noShowMutation = useMutation({
    mutationFn: (bookingId: string) => executeNoShowAction(bookingId),
    onSuccess: (res, bookingId) => {
      if (res.success) {
        toast.success(res.message);
        // FIX: Now uses the robust invalidateAllRelatedQueries instead of invalidateQueries
        invalidateAllRelatedQueries(bookingId);
      } else {
        toast.error(res.message);
      }
    },
    onError: (error: any) =>
      toast.error(error.message || "Failed to process no-show."),
  });

  const refreshScheduler = async () => {
    // We invalidate the queries to trigger a background refetch
    invalidateAllRelatedQueries();

    // We explicitly refetch the active query so we can await its completion
    // This allows you to show a loading spinner on your refresh button!
    await queryClient.refetchQueries({ queryKey: currentQueryKey });
    toast.success("Timeline synchronized");
  };

  return {
    ...query,
    checkHandover,
    checkReturn,
    refreshScheduler,
    isRefreshing: query.isFetching && !query.isLoading,
    executeHandover: handoverMutation.mutateAsync,
    isExecutingHandover: handoverMutation.isPending,
    executeReturn: returnMutation.mutateAsync,
    isExecutingReturn: returnMutation.isPending,
    executeNoShow: noShowMutation.mutateAsync,
    isExecutingNoShow: noShowMutation.isPending,
    updateStatus: updateStatusMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,
    updateDates: updateDatesMutation.mutate,
    isUpdatingDates: updateDatesMutation.isPending,
    updateBuffer: updateBufferMutation.mutate,
    isUpdatingBuffer: updateBufferMutation.isPending,
    processEarlyReturn: earlyReturnMutation.mutate,
    isProcessingEarlyReturn: earlyReturnMutation.isPending,
    createMaintenance: createMaintenanceMutation.mutate,
    isCreatingMaintenance: createMaintenanceMutation.isPending,
    splitBooking: splitMutation.mutate,
    isSplittingBooking: splitMutation.isPending,
    reassignBooking: reassignMutation.mutate,
    isReassigning: reassignMutation.isPending,
    deleteBooking: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
