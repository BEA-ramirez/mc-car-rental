import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  getMasterLedgerWidgets,
  getMasterLedgerTable,
} from "@/actions/financials";

export function useMasterLedgerWidgets() {
  return useQuery({
    queryKey: ["master-ledger-widgets"],
    queryFn: async () => await getMasterLedgerWidgets(),
    staleTime: 60 * 1000,
  });
}

export function useMasterLedgerTable(params: {
  page: number;
  search?: string;
  type?: string;
  period?: string;
}) {
  return useQuery({
    queryKey: ["master-ledger-table", params],
    queryFn: async () => await getMasterLedgerTable(params),
    placeholderData: keepPreviousData, // Keeps old data visible while fetching new pages!
    staleTime: 30 * 1000,
  });
}
