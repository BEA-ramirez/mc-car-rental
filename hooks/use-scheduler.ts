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
} from "@/actions/bookings";
import { toast } from "sonner";
import { SchedulerEvent } from "@/components/scheduler/timeline-scheduler";

export function useScheduler(currentDate: Date) {
  const queryClient = useQueryClient();
  const baseQueryKey = ["scheduler-data"];
  const currentQueryKey = [...baseQueryKey, format(currentDate, "yyyy-MM")];

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
    //runs instantly before the server is called
    onMutate: async (variables) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: baseQueryKey });

      // snapshot the current data in case we need to roll back
      const previousData = queryClient.getQueryData(currentQueryKey);

      // update the react query cache with the new status directly
      queryClient.setQueryData(currentQueryKey, (oldData: any) => {
        if (!oldData) return oldData; // if no data, do nothing
        return {
          ...oldData,
          events: oldData.events.map((event: SchedulerEvent) =>
            event.id === variables.id
              ? { ...event, booking_status: variables.status }
              : event,
          ),
        };
      });
      // return the snapshot as context for potential rollback in case of error
      return { previousData };
    },
    onSuccess: (data, variables) => {
      toast.success("Booking marked as " + variables.status);
    },
    // if server fails, rollback the cache to the snapshot
    onError: (error: Error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(currentQueryKey, context.previousData);
      }
      toast.error(
        `Failed to update status to ${variables.status}: ${error.message}`,
      );
      console.error(error);
    },
    // regardless of success/fail: ensure we are synced with the database
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: baseQueryKey });
    },
  });

  const updateDatesMutation = useMutation({
    mutationFn: async ({
      id,
      newEndDate,
    }: {
      id: string;
      newEndDate: Date;
    }) => {
      const result = await updateBookingDates(id, newEndDate);
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
              ? { ...event, end_date: variables.newEndDate }
              : event,
          ),
        };
      });
      return { previousData };
    },
    onSuccess: () => {
      toast.success("Booking dates updated");
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(currentQueryKey, context.previousData);
      }
      toast.error(`Failed to update dates: ${error.message}`);
      console.error(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: baseQueryKey });
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: baseQueryKey });
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
                  status: "completed",
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: baseQueryKey });
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
      // Create a temporary ID for the UI until the server responds with the real one
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
          status: "maintenance",
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
      queryClient.invalidateQueries({ queryKey: baseQueryKey });
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
        // find the original event
        const originalEvent = oldData.events.find(
          (e: SchedulerEvent) => e.id === variables.id,
        );
        if (!originalEvent) return oldData;
        //create new part 2 event
        const part2: SchedulerEvent = {
          ...originalEvent,
          id: `temp-split-${Date.now()}`,
          start: variables.splitDate,
          title: `${originalEvent.title} (Part 2)`,
          status: "pending",
        };
        // update the array: modify part 1 and part 2
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: baseQueryKey });
    },
  });

  const reassignMutation = useMutation({
    mutationFn: async ({
      id,
      newCarId,
      newPrice,
    }: {
      id: string;
      newCarId: string;
      newPrice: number;
    }) => {
      const result = await reassignBooking(id, newCarId, newPrice);
      if (!result.success)
        throw new Error(result.message || "Failed to reassign");
      return result;
    },

    // OPTIMISTIC UPDATE
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
                  resourceId: variables.newCarId, // Move to the new row!
                  amount: variables.newPrice, // Update the price!
                  status: "confirmed", // Lock it in!
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduler-data"] });
    },
  });

  return {
    ...query,
    updateStatus: updateStatusMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending, //loading state
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
  };
}
