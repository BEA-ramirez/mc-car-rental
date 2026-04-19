import { useInfiniteQuery } from "@tanstack/react-query";
import { getCustomerFleet } from "@/actions/customer-fleet";
import { FilterState } from "@/components/customer/fleet-filters";

export function useCustomerFleet(filters: FilterState) {
  return useInfiniteQuery({
    queryKey: ["customer-fleet-infinite", filters],
    queryFn: async ({ pageParam = 0 }) => {
      return await getCustomerFleet(pageParam, filters);
    },
    initialPageParam: 0,
    // how to find the next page number
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 60 * 1000,
  });
}
