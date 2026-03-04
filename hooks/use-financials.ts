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
  getFinancialDashboardData,
  getPayoutBreakdown,
} from "@/actions/financials";

// Placeholder for your future fetch function when you display the ledger table
// const fetchFinancialsList = async (page: number, limit: number, type: string) => { ... }

export const useFinancials = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterType, setFilterType] = useState("All"); // e.g., 'INCOME', 'EXPENSE'

  // Placeholder query for when you build the table UI
  /*
  const query = useQuery({
    queryKey: ["financials", page, limit, filterType],
    queryFn: () => fetchFinancialsList(page, limit, filterType),
    placeholderData: keepPreviousData,
  });
  */

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
      // Invalidate bookings too, since their status changes to 'SETTLED'
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success(data.message);
    },
    onError: (err) => toast.error(err.message),
  });

  const dashboardQuery = useQuery({
    queryKey: ["financial-dashboard"],
    queryFn: async () => {
      const res = await getFinancialDashboardData();
      return res;
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  const logExpenseMutation = useMutation({
    mutationFn: logManualExpense,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["financial-dashboard"] });
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
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["financial-dashboard"] });
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => toast.error("Failed to update status: " + err.message),
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
    data: dashboardQuery.data,
    isLoading: dashboardQuery.isLoading,
    logExpense: logExpenseMutation.mutateAsync,
    isLogging: logExpenseMutation.isPending,
    markAsPaid: markPaidMutation.mutateAsync,
    isMarkingPaid: markPaidMutation.isPending,
    generatePayout: generatePayoutMutation.mutateAsync,
    isGeneratingPayout: generatePayoutMutation.isPending,
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
