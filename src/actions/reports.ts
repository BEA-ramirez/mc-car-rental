"use server";

import { createClient } from "@/utils/supabase/server";

export async function fetchMasterReportData(
  startDate: string,
  endDate: string,
  partnerId?: string,
) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_master_report_data", {
    p_start_date: startDate,
    p_end_date: endDate,
    p_partner_id: partnerId || null,
  });

  if (error) {
    console.error("Error fetching master report:", error);
    throw new Error("Failed to load report data.");
  }

  console.log("Master report", data);

  return data;
}
