"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

// --- SERVER ACTION (Can also be placed in your actions folder) ---
export async function getMasterLedgerData() {
  const supabase = createClient();

  const { data: kpis } = await supabase.rpc("get_global_financial_kpis");

  // Fetch everything, ordered by newest first
  const { data: transactions } = await supabase
    .from("financial_transactions")
    .select(
      `
      *,
      car:car_id(plate_number),
      booking:booking_id(users(full_name))
    `,
    )
    .order("transaction_date", { ascending: false })
    .limit(100);

  return {
    kpis: kpis || { totalIncome: 0, totalExpense: 0, netCashFlow: 0 },
    transactions: transactions || [],
  };
}

// --- REACT QUERY HOOK ---
export const useMasterLedger = () => {
  return useQuery({
    queryKey: ["master-ledger"],
    queryFn: getMasterLedgerData,
    staleTime: 30 * 1000,
  });
};
