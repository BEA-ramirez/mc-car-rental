"use server";

import { createClient } from "@/utils/supabase/server";
import { UserType } from "@/lib/schemas/user";

export async function getEligibleUsers(): Promise<UserType[]> {
  const supabase = await createClient();

  //get all customers
  const { data: customers, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", "customer");

  if (error || !customers) return [];

  // get ids of users who are already partners (for the pending scenario, not yet verified)
  const { data: existingPartners } = await supabase
    .from("car_owner")
    .select("user_id");

  const existingIds = new Set(
    existingPartners?.map((partner) => partner.user_id),
  );

  // filter out users who are already partners
  const eligibleUsers = customers.filter(
    (user) => !existingIds.has(user.user_id),
  );

  return eligibleUsers;
}

export async function getCustomers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("user_id, full_name, email")
    .eq("role", "customer")
    .eq("is_archived", false)
    .order("full_name", { ascending: true });

  if (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
  return data;
}
