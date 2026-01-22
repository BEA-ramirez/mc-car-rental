import { createClient } from "@/utils/supabase/server";

import { FleetPartnerProfileType } from "@/lib/schemas/car-owner";

export async function getCarOwners(): Promise<FleetPartnerProfileType[]> {
  const supabase = await createClient();
  const { data: rawData, error } = await supabase
    .from("car_owner")
    .select(`*, users!inner(*)`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching car owners:", error);
    return [];
  }

  const formattedData: FleetPartnerProfileType[] = (rawData || []).map(
    (row: any) => {
      const userObj = row.users || {};

      return { ...userObj, ...row, total_units: 0 };
    },
  );

  return formattedData;
}
