import { useQuery } from "@tanstack/react-query";
import { fetchMasterReportData } from "@/actions/reports";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useReportsDashboard(
  startDate: Date,
  endDate: Date,
  partnerId?: string,
) {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.reportsMaster(
      startDate.toISOString(),
      endDate.toISOString(),
      partnerId,
    ),
    queryFn: async () => {
      // RPC expects an actual Date object or ISO string.
      // pass undefined if "all" is selected so the SQL ignores the filter.
      const data = await fetchMasterReportData(
        startDate.toISOString(),
        endDate.toISOString(),
        partnerId === "all" ? undefined : partnerId,
      );
      return data;
    },
    // Reports don't change by the second, so cache it aggressively
    // and don't refetch just because the user switches browser tabs.
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 Minutes Cache
  });
}
