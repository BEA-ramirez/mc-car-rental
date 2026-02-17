"use client";

import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "@/actions/user";

export const useCustomers = () => {
  return useQuery({
    queryKey: ["users", "customers"],
    queryFn: () => getCustomers(),
  });
};
