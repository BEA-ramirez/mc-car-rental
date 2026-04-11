"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getIncomeDashboardData,
  getBookingFolio,
  recordBookingPayment,
  addBookingCharge,
  logMiscIncome,
  refundSecurityDeposit,
  removeBookingChargeAction,
  voidBookingPaymentAction,
  issueBookingRefundAction,
} from "@/actions/incomes";

export const useIncomes = () => {
  const queryClient = useQueryClient();

  // Fetch Dashboard Data
  const dashboardQuery = useQuery({
    queryKey: ["incomes-dashboard"],
    queryFn: async () => {
      const res = await getIncomeDashboardData();
      return res;
    },
    staleTime: 30 * 1000,
  });

  // Mutation: Record Payment
  const recordPaymentMutation = useMutation({
    mutationFn: recordBookingPayment,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: ["incomes-dashboard"],
        });
        queryClient.invalidateQueries({ queryKey: ["booking-folio"] });
        queryClient.invalidateQueries({ queryKey: ["booking-details"] });
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => toast.error("Failed to record payment: " + err.message),
  });

  // Mutation: Add Charge
  const addChargeMutation = useMutation({
    mutationFn: addBookingCharge,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: ["incomes-dashboard"],
        });
        queryClient.invalidateQueries({ queryKey: ["booking-folio"] });
        queryClient.invalidateQueries({ queryKey: ["booking-details"] });
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => toast.error("Failed to add charge: " + err.message),
  });

  // 4. Mutation: Log Misc Income
  const logMiscMutation = useMutation({
    mutationFn: logMiscIncome,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["incomes-dashboard"] });
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => toast.error("Failed to log income: " + err.message),
  });

  const refundMutation = useMutation({
    mutationFn: issueBookingRefundAction,
    onSuccess: async (data) => {
      if (data.success) {
        // Return Promise.all so the mutation waits for the refetches to finish
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["incomes-dashboard"] }),
          queryClient.invalidateQueries({ queryKey: ["booking-folio"] }),
          queryClient.invalidateQueries({ queryKey: ["master-ledger"] }),
          queryClient.invalidateQueries({ queryKey: ["booking-details"] }),
        ]);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => toast.error("Failed to refund deposit: " + err.message),
  });

  const removeCharge = useMutation({
    mutationFn: removeBookingChargeAction,
    onSuccess: async (data) => {
      if (data.success) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["incomes-dashboard"] }),
          queryClient.invalidateQueries({ queryKey: ["booking-folio"] }),
          queryClient.invalidateQueries({ queryKey: ["master-ledger"] }),
          queryClient.invalidateQueries({ queryKey: ["booking-details"] }),
        ]);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => toast.error(`Failed to remove charge: ${err.message}`),
  });

  // 5. Void Payment
  const voidPayment = useMutation({
    mutationFn: voidBookingPaymentAction,
    onSuccess: async (data) => {
      if (data.success) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["incomes-dashboard"] }),
          queryClient.invalidateQueries({ queryKey: ["booking-folio"] }),
          queryClient.invalidateQueries({ queryKey: ["master-ledger"] }),
          queryClient.invalidateQueries({ queryKey: ["booking-details"] }),
        ]);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => toast.error(`Failed to void payment: ${err.message}`),
  });

  return {
    data: dashboardQuery.data,
    isLoading: dashboardQuery.isLoading,

    recordPayment: recordPaymentMutation.mutateAsync,
    isRecordingPayment: recordPaymentMutation.isPending,

    addCharge: addChargeMutation.mutateAsync,
    isAddingCharge: addChargeMutation.isPending,

    logMisc: logMiscMutation.mutateAsync,
    isLoggingMisc: logMiscMutation.isPending,

    refundBooking: refundMutation.mutateAsync,
    isRefunding: refundMutation.isPending,

    removeCharge: removeCharge.mutateAsync,
    voidPayment: voidPayment.mutateAsync,
    isProcessing: removeCharge.isPending || voidPayment.isPending,
  };
};

// Hook strictly for the Folio Modal
export const useBookingFolio = (bookingId: string | undefined | null) => {
  return useQuery({
    queryKey: ["booking-folio", bookingId],
    queryFn: () => getBookingFolio(bookingId!),
    enabled: !!bookingId,
    staleTime: 10 * 1000,
  });
};
