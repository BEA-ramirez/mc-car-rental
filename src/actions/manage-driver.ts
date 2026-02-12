"use server";
import { createClient } from "@/utils/supabase/server";
import { CompleteDriverType } from "@/lib/schemas/driver";
import { create } from "domain";
import { SupabaseClient } from "@supabase/supabase-js";

export type ActionState = {
  message: string | null;
  errors?: Record<string, string[]>;
  success?: boolean;
};

export async function saveDriver(
  data: CompleteDriverType,
): Promise<ActionState> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("save_driver_v1", {
    // Map your Zod data to the SQL parameters
    p_user_id: data.user_id,
    p_full_name: data.profiles.full_name,
    p_first_name: data.profiles.first_name,
    p_last_name: data.profiles.last_name,

    p_phone_number: data.profiles.phone_number,
    p_license_number: data.profiles.license_number,
    p_license_expiry_date: data.profiles.license_expiry_date,
    p_driver_status: data.driver_status,
    p_is_verified: data.is_verified,
  });

  if (error) {
    console.error("RPC Error:", error);
    throw new Error("Failed to save driver");
  }

  return { success: true, message: "Driver saved successfully" };
}

export async function getDriverById(
  driverId: string,
): Promise<CompleteDriverType> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("drivers")
    .select(
      "*, profiles: users(full_name, phone_number, license_number, license_expiry_date)",
    )
    .eq("driver_id", driverId)
    .eq("is_archived", false)
    .single();

  if (error) {
    console.error("Error fetching driver:", error);
    throw new Error("Failed to fetch driver");
  }
  return data as CompleteDriverType;
}

export async function deleteDriver(driverId: string): Promise<ActionState> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("drivers")
    .update({ is_archived: true })
    .eq("driver_id", driverId);

  if (error) {
    console.error("Error deleting driver:", error);
    throw new Error("Failed to delete driver");
  }
  return { success: true, message: "Driver deleted successfully" };
}
