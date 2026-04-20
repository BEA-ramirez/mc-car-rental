"use client";

import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  generateOwnerPayout,
  logManualExpense,
  markPayoutAsPaid,
  getExpenseTableData,
  getExpenseWidgets,
  getPayoutBreakdown,
  voidOwnerPayoutAction,
} from "@/actions/financials";
import { QUERY_KEYS } from "@/lib/query-keys"; // <-- NEW IMPORT

interface IncomeDashboardParams {
  tab?: string;
  page?: number;
  search?: string;
  sort?: string;
  method?: string;
}

export const useFinancials = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterType, setFilterType] = useState("All");

  // --- THE MASTER EXPENSE INVALIDATOR ---
  const invalidateExpenseRipples = (isPayout = false) => {
    // 1. Sync global financial tables
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.financials.expenseWidgets,
    });
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.financials.expenseTableBase,
    });
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.financials.masterLedger,
    });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.summary });

    // 2. If it's a Payout, sync the Partner's specific history and the Bookings
    if (isPayout) {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all });
      // Fuzzy match to hit all partner payout histories
      queryClient.invalidateQueries({ queryKey: ["partner-payout-history"] });
    }
  };

  const generatePayoutMutation = useMutation({
    mutationFn: async ({
      ownerId,
      startDate,
      endDate,
    }: {
      ownerId: string;
      startDate: Date;
      endDate: Date;
    }) => {
      const res = await generateOwnerPayout(ownerId, startDate, endDate);
      if (!res.success)
        throw new Error(res.message || "Failed to generate payout");
      return res;
    },
    onSuccess: (data) => {
      invalidateExpenseRipples(true); // true = it's a payout
      toast.success(data.message);
    },
    onError: (err) => toast.error(err.message),
  });

  const logExpenseMutation = useMutation({
    mutationFn: logManualExpense,
    onSuccess: (data) => {
      if (data.success) {
        invalidateExpenseRipples(); // false = just a manual expense
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => toast.error("Failed to log expense: " + err.message),
  });

  const markPaidMutation = useMutation({
    mutationFn: markPayoutAsPaid,
    onSuccess: (data) => {
      if (data.success) {
        invalidateExpenseRipples(true);
        // If they have the breakdown modal open, refresh it!
        queryClient.invalidateQueries({ queryKey: ["payout-details"] });
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => toast.error("Failed to update status: " + err.message),
  });

  const voidPayoutMutation = useMutation({
    mutationFn: voidOwnerPayoutAction,
    onSuccess: (data) => {
      if (data.success) {
        invalidateExpenseRipples(true);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => toast.error("Failed to void payout: " + err.message),
  });

  return {
    page,
    setPage,
    limit,
    setLimit,
    filterType,
    setFilterType,
    logExpense: logExpenseMutation.mutateAsync,
    isLogging: logExpenseMutation.isPending,
    markAsPaid: markPaidMutation.mutateAsync,
    isMarkingPaid: markPaidMutation.isPending,
    generatePayout: generatePayoutMutation.mutateAsync,
    isGeneratingPayout: generatePayoutMutation.isPending,
    voidPayout: voidPayoutMutation.mutateAsync,
    isVoiding: voidPayoutMutation.isPending,
  };
};

export const usePayoutDetails = (payoutId: string | null) => {
  return useQuery({
    queryKey: QUERY_KEYS.financials.payoutDetails(payoutId!),
    queryFn: () => getPayoutBreakdown(payoutId!),
    enabled: !!payoutId,
    staleTime: 60 * 1000,
  });
};

export function useExpenseWidgets() {
  return useQuery({
    queryKey: QUERY_KEYS.financials.expenseWidgets,
    queryFn: async () => await getExpenseWidgets(),
    staleTime: 60 * 1000,
  });
}

export function useExpenseTable(params: {
  tab: string;
  page: number;
  search?: string;
  sort?: string;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.financials.expenseTable(params),
    queryFn: async () => await getExpenseTableData(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}
