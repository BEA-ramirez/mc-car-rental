import { useQuery } from "@tanstack/react-query";
import { fetchMasterReportData } from "@/actions/reports";

export function useReportsDashboard(
  startDate: Date,
  endDate: Date,
  partnerId?: string,
) {
  return useQuery({
    queryKey: [
      "reports_master",
      startDate.toISOString(),
      endDate.toISOString(),
      partnerId,
    ],
    queryFn: async () => {
      // The RPC expects an actual Date object or ISO string.
      // We pass undefined if "all" is selected so the SQL ignores the filter.
      const data = await fetchMasterReportData(
        startDate.toISOString(),
        endDate.toISOString(),
        partnerId === "all" ? undefined : partnerId,
      );
      return data;
    },
    // Reports don't change by the second, so we cache it aggressively
    // and don't refetch just because the user switches browser tabs.
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 Minutes Cache
  });
}
