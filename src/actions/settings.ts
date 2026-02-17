"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  BookingFeesSchema,
  BusinessHubsSchema,
  TaxSettingsSchema,
  PaymentMethodsSchema,
  CompanyProfileSchema,
  ServiceAreaSchema,
  type ServiceArea,
} from "@/lib/schemas/settings";

// --- 1. GET SETTINGS (Generic) ---
export async function getSystemSettings(keys: string[]) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", keys);

  if (error) {
    console.error("Error fetching system settings:", error);
    return {};
  }

  const settingsMap = data.reduce(
    (acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    },
    {} as Record<string, any>,
  );

  return settingsMap;
}

// --- 2. UPDATE SETTING (Generic) ---
export async function updateSystemSetting(key: string, rawValue: unknown) {
  const supabase = await createClient();

  let schema;
  switch (key) {
    case "booking_fees":
      schema = BookingFeesSchema;
      break;
    case "business_hubs":
      schema = BusinessHubsSchema;
      break;
    case "tax_settings":
      schema = TaxSettingsSchema;
      break;
    case "payment_methods":
      schema = PaymentMethodsSchema;
      break;
    case "company_profile":
      schema = CompanyProfileSchema;
      break;
    default:
      return { success: false, message: "Invalid settings key" };
  }

  const result = schema.safeParse(rawValue);
  if (!result.success) {
    return {
      success: false,
      message: "Invalid Data",
      errors: result.error.flatten(),
    };
  }

  const { error } = await supabase
    .from("settings")
    .upsert({ key, value: result.data }, { onConflict: "key" });

  if (error) return { success: false, message: error.message };

  revalidatePath("/admin/settings");
  return { success: true, message: "Settings saved" };
}

// --- 3. SERVICE AREA (Specific) ---
export async function saveServiceArea(data: ServiceArea) {
  const result = ServiceAreaSchema.safeParse(data);

  if (!result.success) {
    const errorMessage =
      result.error.issues[0]?.message || "Invalid data format";
    return { error: errorMessage };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized access" };
  }

  const { error } = await supabase
    .from("settings")
    .update({ value: result.data })
    .eq("key", "service_area_boundary");

  if (error) {
    console.error("Supabase Error:", error);
    return { error: "Failed to save settings to database." };
  }

  revalidatePath("/admin/settings");
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
  return data?.value || [];
}
