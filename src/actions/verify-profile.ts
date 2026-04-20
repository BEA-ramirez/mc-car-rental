"use server";

import { createClient } from "@/utils/supabase/server";

export async function checkCustomerProfileStatus() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return { isComplete: false, missingFields: ["User authentication failed"] };
  }

  const userId = authData.user.id;

  // Check personal information
  const { data: userProfile } = await supabase
    .from("users")
    .select("first_name, last_name, phone_number, address")
    .eq("user_id", userId)
    .single();

  const missing = [];
  if (!userProfile?.first_name) missing.push("First Name");
  if (!userProfile?.last_name) missing.push("Last Name");
  if (!userProfile?.phone_number) missing.push("Phone Number");
  if (!userProfile?.address) missing.push("Complete Address");

  // Check uploaded documents
  const { data: docs } = await supabase
    .from("documents")
    .select("category")
    .eq("user_id", userId)
    .in("category", ["license_id", "valid_id"]);

  const hasLicense = docs?.some((d) => d.category === "license_id");
  const hasValidId = docs?.some((d) => d.category === "valid_id");

  // Only push to missing array if BOTH are false
  if (!hasLicense && !hasValidId) {
    missing.push("Driver's License or Valid ID");
  }

  return {
    isComplete: missing.length === 0,
    missingFields: missing,
  };
}
