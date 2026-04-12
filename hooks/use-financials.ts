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

export const useFinancials = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterType, setFilterType] = useState("All"); // e.g., 'INCOME', 'EXPENSE'

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
      queryClient.invalidateQueries({ queryKey: ["financials"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["expense-widgets"] });
      queryClient.invalidateQueries({ queryKey: ["expense-table"] });
      toast.success(data.message);
    },
    onError: (err) => toast.error(err.message),
  });

  const logExpenseMutation = useMutation({
    mutationFn: logManualExpense,
    onSuccess: async (data) => {
      if (data.success) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["expense-widgets"] }),
          queryClient.invalidateQueries({ queryKey: ["expense-table"] }),
        ]);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => toast.error("Failed to log expense: " + err.message),
  });

  const markPaidMutation = useMutation({
    mutationFn: markPayoutAsPaid,
    onSuccess: async (data) => {
      if (data.success) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["expense-widgets"] }),
          queryClient.invalidateQueries({ queryKey: ["expense-table"] }),
        ]);
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
        queryClient.invalidateQueries({ queryKey: ["expense-widgets"] });
        queryClient.invalidateQueries({ queryKey: ["expense-table"] });
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => toast.error("Failed to void payout: " + err.message),
  });

  return {
    // financials: query.data || [],
    // isLoading: query.isLoading,
    // isError: query.isError,
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
    queryKey: ["payout-details", payoutId],
    queryFn: () => getPayoutBreakdown(payoutId!),
    enabled: !!payoutId, // Only fetch if a payout ID is actually provided (modal is open)
    staleTime: 60 * 1000,
  });
};

export function useExpenseWidgets() {
  return useQuery({
    queryKey: ["expense-widgets"],
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
    queryKey: ["expense-table", params],
    queryFn: async () => await getExpenseTableData(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}
