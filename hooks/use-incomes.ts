"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getBookingFolio,
  recordBookingPayment,
  addBookingCharge,
  logMiscIncome,
  removeBookingChargeAction,
  voidBookingPaymentAction,
  issueBookingRefundAction,
  getIncomeTableData,
  getIncomeWidgets,
} from "@/actions/incomes";

interface IncomeDashboardParams {
  tab?: string;
  page?: number;
  search?: string;
  sort?: string;
  method?: string;
}

export const useIncomes = (params?: IncomeDashboardParams) => {
  const queryClient = useQueryClient();

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

export function useIncomeWidgets() {
  return useQuery({
    queryKey: ["incomes-widgets"],
    queryFn: async () => await getIncomeWidgets(),
    staleTime: 60 * 1000,
  });
}

// 2. Hook for the Table (Fetches when URL params change)
export function useIncomeTable(params: any) {
  return useQuery({
    queryKey: [
      "incomes-table",
      params.tab,
      params.page,
      params.search,
      params.sort,
      params.method,
    ],
    queryFn: async () => await getIncomeTableData(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}
