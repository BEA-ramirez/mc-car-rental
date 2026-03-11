import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getDashboardSummary,
  getRecentBookings,
  checkFleetAvailability,
  getChartAnalytics,
} from "@/actions/dashboard";

// Internal fetchers to unpack the ActionResponse
const fetchSummary = async () => {
  const res = await getDashboardSummary();
  if (!res.success) throw new Error(res.message);
  return res.data;
};

const fetchRecent = async (limit: number) => {
  const res = await getRecentBookings(limit);
  if (!res.success) throw new Error(res.message);
  return res.data;
};

const fetchCharts = async (timeframe: string) => {
  const res = await getChartAnalytics(timeframe);
  if (!res.success) throw new Error(res.message);
  return res.data;
};

export const useDashboard = () => {
  // 1. Main Dashboard Summary (KPIs, Alerts, Logistics)
  const summaryQuery = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: fetchSummary,
    staleTime: 60 * 1000, // 1 minute cache
    refetchInterval: 5 * 60 * 1000, // Auto-poll every 5 mins
  });

  // 2. Recent Bookings Table
  const recentBookingsQuery = useQuery({
    queryKey: ["dashboard", "recent-bookings"],
    queryFn: () => fetchRecent(6),
    staleTime: 60 * 1000,
  });

  // 3. Availability Checker Mutation (Triggered by button click)
  const checkAvailabilityMutation = useMutation({
    mutationFn: async (params: { category: string; date: Date }) => {
      const res = await checkFleetAvailability({
        category: params.category,
        date: params.date.toISOString(),
      });
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to check availability");
    },
  });

  return {
    // Data
    summary: summaryQuery.data,
    recentBookings: recentBookingsQuery.data || [],

    // Loading States
    isSummaryLoading: summaryQuery.isLoading || summaryQuery.isFetching,
    isRecentLoading:
      recentBookingsQuery.isLoading || recentBookingsQuery.isFetching,

    // Mutations
    checkAvailability: checkAvailabilityMutation.mutateAsync,
    isSearchingAvailability: checkAvailabilityMutation.isPending,
  };
};

export function useDashboardCharts(
  timeframe: "daily" | "weekly" | "monthly" | "yearly",
) {
  return useQuery({
    // By putting 'timeframe' in the queryKey array, React Query knows to
    // automatically re-fetch the data whenever the user changes the dropdown!
    queryKey: ["dashboard", "charts", timeframe],
    queryFn: () => fetchCharts(timeframe),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
