"use server";

import { createClient } from "@/utils/supabase/server";
import { ServiceAreaSchema, type ServiceArea } from "@/lib/schemas/settings";
import { revalidatePath } from "next/cache";

export async function saveServiceArea(data: ServiceArea) {
  // --- FIX 1: Zod Validation ---
  const result = ServiceAreaSchema.safeParse(data);

  if (!result.success) {
    // We use .issues[0] to get the first specific error message safely
    const errorMessage =
      result.error.issues[0]?.message || "Invalid data format";
    return { error: errorMessage };
  }

  const validatedCoordinates = result.data;

  // --- FIX 2: Supabase Await ---
  // createClient is ASYNC. You must use 'await' here!
  const supabase = await createClient();

  // 3. Auth Check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Unauthorized access" };
  }

  // 4. Save to Database
  const { error } = await supabase
    .from("settings")
    .update({ value: validatedCoordinates })
    .eq("key", "service_area_boundary");

  if (error) {
    console.error("Supabase Error:", error);
    return { error: "Failed to save settings to database." };
  }

  // 5. Revalidate
  revalidatePath("/admin/settings");
  revalidatePath("/");

  return { success: true };
}

export async function getServiceArea() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "service_area_boundary")
    .single();

  if (error) return [];

  return data?.value || []; // Returns the array of coordinates
}
