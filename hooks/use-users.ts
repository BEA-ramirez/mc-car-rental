"use client";

import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "@/actions/user";
import { QUERY_KEYS } from "@/lib/query-keys";

export const useCustomers = () => {
  return useQuery({
    queryKey: QUERY_KEYS.users.customers,
    queryFn: () => getCustomers(),
  });
};
