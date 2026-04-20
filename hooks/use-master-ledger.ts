import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  getMasterLedgerWidgets,
  getMasterLedgerTable,
} from "@/actions/financials";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useMasterLedgerWidgets() {
  return useQuery({
    queryKey: QUERY_KEYS.financials.ledgerWidgets,
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
    queryKey: QUERY_KEYS.financials.ledgerTable(params),
    queryFn: async () => await getMasterLedgerTable(params),
    placeholderData: keepPreviousData, // Keeps old data visible while fetching new pages!
    staleTime: 30 * 1000,
  });
}
