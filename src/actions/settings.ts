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
  VehicleTypesSchema,
  type ServiceArea,
  type VehicleType,
} from "@/lib/schemas/settings";
import { createAdminClient } from "@/utils/supabase/admin";

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
  console.dir(settingsMap, { depth: null }); // Log the entire settings map for debugging
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
    case "vehicle_types":
      schema = VehicleTypesSchema;
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

const INSPECTION_TEMPLATE_KEY = "inspection_template";

// 1. The shape of the categories
export type InspectionCategory = {
  id: string;
  name: string;
  items: { id: string; label: string }[];
};

// 2. NEW: The shape of the master template (Blueprint + Categories)
export type MasterInspectionTemplate = {
  blueprint_url: string;
  categories: InspectionCategory[];
};

// 3. Fetch the template
// Note: We return either the new Master object or the old Array to allow your
// frontend's migration logic to safely convert old data!
export async function getInspectionTemplate(): Promise<
  MasterInspectionTemplate | InspectionCategory[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", INSPECTION_TEMPLATE_KEY)
    .single();

  if (error && error.code !== "PGRST116") {
    // Ignore 'Not Found' errors
    console.error("Error fetching template:", error);
    return [];
  }

  return data?.value
    ? (data.value as MasterInspectionTemplate | InspectionCategory[])
    : [];
}

// 4. Save the template
// Note: We now strictly require the new Master format when saving
export async function saveInspectionTemplate(
  template: MasterInspectionTemplate,
) {
  const supabase = await createAdminClient();

  // Use upsert to update if exists, or insert if it doesn't
  const { error } = await supabase
    .from("settings")
    .upsert(
      { key: INSPECTION_TEMPLATE_KEY, value: template as any },
      { onConflict: "key" },
    );

  if (error) throw new Error(error.message);
  return { success: true };
}

const CONTRACT_TEMPLATE_KEY = "contract_template";

// 3. Fetch the Contract Template
export async function getContractTemplate(): Promise<string> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", CONTRACT_TEMPLATE_KEY)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching contract template:", error);
    return "";
  }

  return data?.value ? (data.value as string) : "";
}

// 4. Save the Contract Template
export async function saveContractTemplate(htmlContent: string) {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("settings")
    .upsert(
      { key: CONTRACT_TEMPLATE_KEY, value: htmlContent as any },
      { onConflict: "key" },
    );

  if (error) throw new Error(error.message);
  return { success: true };
}

const COMPANY_PROFILE_KEY = "company_profile";

export type CompanyProfile = {
  name: string;
  email: string;
  address: string;
  website: string;
  contact_number: string;
};

// 5. Fetch Company Profile
export async function getCompanyProfile(): Promise<CompanyProfile | null> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", COMPANY_PROFILE_KEY)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching company profile:", error);
    return null;
  }

  return data?.value ? (data.value as CompanyProfile) : null;
}

// 6. Save Company Profile
export async function saveCompanyProfile(profile: CompanyProfile) {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("settings")
    .upsert(
      { key: COMPANY_PROFILE_KEY, value: profile as any },
      { onConflict: "key" },
    );

  if (error) throw new Error(error.message);
  return { success: true };
}

const PAYMENT_METHODS_KEY = "payment_methods";

export type PaymentMethodDetail = {
  enabled: boolean;
  account_name?: string;
  account_number?: string;
};

export type PaymentMethods = {
  bdo: PaymentMethodDetail;
  cash: PaymentMethodDetail;
  gcash: PaymentMethodDetail;
  [key: string]: PaymentMethodDetail; // Allows flexibility if you add BPI, UnionBank, etc. later
};

// 7. Fetch Payment Methods
export async function getPaymentMethods(): Promise<PaymentMethods | null> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", PAYMENT_METHODS_KEY)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching payment methods:", error);
    return null;
  }

  return data?.value ? (data.value as PaymentMethods) : null;
}

// 8. Save Payment Methods
export async function savePaymentMethods(methods: PaymentMethods) {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("settings")
    .upsert(
      { key: PAYMENT_METHODS_KEY, value: methods as any },
      { onConflict: "key" },
    );

  if (error) throw new Error(error.message);
  return { success: true };
}

const BOOKING_FEES_KEY = "booking_fees";

export type BookingFees = {
  rush_fee: number;
  custom_pickup_fee: number;
  custom_dropoff_fee: number;
  driver_rate_per_day: number;
  security_deposit_default: number;
};

// 9. Fetch Booking Fees
export async function getBookingFees(): Promise<BookingFees | null> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", BOOKING_FEES_KEY)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching booking fees:", error);
    return null;
  }

  return data?.value ? (data.value as BookingFees) : null;
}

// 10. Save Booking Fees
export async function saveBookingFees(fees: BookingFees) {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("settings")
    .upsert(
      { key: BOOKING_FEES_KEY, value: fees as any },
      { onConflict: "key" },
    );

  if (error) throw new Error(error.message);
  return { success: true };
}

const TAX_SETTINGS_KEY = "tax_settings";

export type TaxSettings = {
  enabled: boolean;
  tax_name: string;
  percentage: number;
  is_inclusive: boolean;
  registration_number: string;
};

// 11. Fetch Tax Settings
export async function getTaxSettings(): Promise<TaxSettings | null> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", TAX_SETTINGS_KEY)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching tax settings:", error);
    return null;
  }

  return data?.value ? (data.value as TaxSettings) : null;
}

// 12. Save Tax Settings
export async function saveTaxSettings(settings: TaxSettings) {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("settings")
    .upsert(
      { key: TAX_SETTINGS_KEY, value: settings as any },
      { onConflict: "key" },
    );

  if (error) throw new Error(error.message);
  return { success: true };
}

const BUSINESS_HUBS_KEY = "business_hubs";

export type BusinessHub = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  is_active: boolean;
};

// 13. Fetch Business Hubs
export async function getBusinessHubs(): Promise<BusinessHub[]> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", BUSINESS_HUBS_KEY)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching business hubs:", error);
    return [];
  }

  return data?.value ? (data.value as BusinessHub[]) : [];
}

// 14. Save Business Hubs
export async function saveBusinessHubs(hubs: BusinessHub[]) {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("settings")
    .upsert(
      { key: BUSINESS_HUBS_KEY, value: hubs as any },
      { onConflict: "key" },
    );

  if (error) throw new Error(error.message);
  return { success: true };
}

const VEHICLE_TYPES_KEY = "vehicle_types";

// Note: You must import VehicleType from your schemas at the top of the file if you haven't already:
// import { VehicleType } from "@/lib/schemas/settings";

export async function getVehicleTypes(): Promise<VehicleType[]> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", VEHICLE_TYPES_KEY)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching vehicle types:", error);
    return [];
  }

  return data?.value ? (data.value as VehicleType[]) : [];
}

export async function saveVehicleTypes(types: VehicleType[]) {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("settings")
    .upsert(
      { key: VEHICLE_TYPES_KEY, value: types as any },
      { onConflict: "key" },
    );

  if (error) throw new Error(error.message);
  return { success: true };
}
