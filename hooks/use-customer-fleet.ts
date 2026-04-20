import { useInfiniteQuery } from "@tanstack/react-query";
import { getCustomerFleet } from "@/actions/customer-fleet";
import { FilterState } from "@/components/customer/fleet-filters";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useCustomerFleet(filters: FilterState) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.fleet.customerFleet(filters),
    queryFn: async ({ pageParam = 0 }) => {
      return await getCustomerFleet(pageParam, filters);
    },
    initialPageParam: 0,
    // how to find the next page number
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 60 * 1000,
  });
}
