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
} from "@/actions/incomes";

export const useIncomes = () => {
  const queryClient = useQueryClient();

  // 1. Fetch Dashboard Data
  const dashboardQuery = useQuery({
    queryKey: ["incomes-dashboard"],
    queryFn: async () => {
      const res = await getIncomeDashboardData();
      return res;
    },
    staleTime: 30 * 1000,
  });

  // 2. Mutation: Record Payment
  const recordPaymentMutation = useMutation({
    mutationFn: recordBookingPayment,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["incomes-dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["booking-folio"] });
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => toast.error("Failed to record payment: " + err.message),
  });

  // 3. Mutation: Add Charge
  const addChargeMutation = useMutation({
    mutationFn: addBookingCharge,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["incomes-dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["booking-folio"] });
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
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["incomes-dashboard"] });
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => toast.error("Failed to log income: " + err.message),
  });

  const refundMutation = useMutation({
    mutationFn: refundSecurityDeposit,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["incomes-dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["booking-folio"] });
        queryClient.invalidateQueries({ queryKey: ["master-ledger"] }); // Update ledger
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => toast.error("Failed to refund deposit: " + err.message),
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

    refundDeposit: refundMutation.mutateAsync,
    isRefunding: refundMutation.isPending,
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
