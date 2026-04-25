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
import { QUERY_KEYS } from "@/lib/query-keys";

interface IncomeDashboardParams {
  tab?: string;
  page?: number;
  search?: string;
  sort?: string;
  method?: string;
}

export const useIncomes = (params?: IncomeDashboardParams) => {
  const queryClient = useQueryClient();

  // --- THE MASTER INVALIDATOR ---
  // Call this whenever money moves to sync the entire app instantly.
  const invalidateFinancials = () => {
    // No awaits! Just fire them off in the background.
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.financials.incomesDashboard,
    });
    queryClient.invalidateQueries({ queryKey: ["incomes-table"] });
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.financials.incomesWidgets,
    });
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.financials.masterLedger,
    });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.folioBase });
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.bookings.detailsBase,
    });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.summary });
  };

  // 1. Mutation: Record Payment
  const recordPaymentMutation = useMutation({
    mutationFn: recordBookingPayment,
    onSuccess: async (data) => {
      if (data.success) {
        invalidateFinancials();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => toast.error("Failed to record payment: " + err.message),
  });

  // 2. Mutation: Add Charge
  const addChargeMutation = useMutation({
    mutationFn: addBookingCharge,
    onSuccess: async (data) => {
      if (data.success) {
        invalidateFinancials();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => toast.error("Failed to add charge: " + err.message),
  });

  // 3. Mutation: Log Misc Income
  const logMiscMutation = useMutation({
    mutationFn: logMiscIncome,
    onSuccess: async (data) => {
      if (data.success) {
        invalidateFinancials();

        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => toast.error("Failed to log income: " + err.message),
  });

  // 4. Refund Mutation
  const refundMutation = useMutation({
    mutationFn: issueBookingRefundAction,
    onSuccess: async (data) => {
      if (data.success) {
        invalidateFinancials();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => toast.error("Failed to refund deposit: " + err.message),
  });

  // 5. Remove Charge
  const removeCharge = useMutation({
    mutationFn: removeBookingChargeAction,
    onSuccess: async (data) => {
      if (data.success) {
        await invalidateFinancials();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => toast.error(`Failed to remove charge: ${err.message}`),
  });

  // 6. Void Payment
  const voidPayment = useMutation({
    mutationFn: voidBookingPaymentAction,
    onSuccess: async (data) => {
      if (data.success) {
        await invalidateFinancials();
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
    queryKey: QUERY_KEYS.bookings.folio(bookingId!),
    queryFn: () => getBookingFolio(bookingId!),
    enabled: !!bookingId,
    staleTime: 10 * 1000,
  });
};

// Income Widgets
export function useIncomeWidgets() {
  return useQuery({
    queryKey: QUERY_KEYS.financials.incomesWidgets,
    queryFn: async () => await getIncomeWidgets(),
    staleTime: 60 * 1000,
  });
}

// Hook for the Table (Fetches when URL params change)
export function useIncomeTable(params: any) {
  return useQuery({
    queryKey: QUERY_KEYS.financials.incomesTable(params),
    queryFn: async () => await getIncomeTableData(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}
