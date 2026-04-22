"use server"; // MUST BE AT THE VERY TOP

import { getContractTemplate, getInspectionTemplate } from "@/actions/settings";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/utils/supabase/admin";

export async function getBookingDocumentsAction(bookingId: string) {
  const supabase = await createClient();

  // FIX 1: Use maybeSingle() so it doesn't crash if no contract exists yet
  const { data: contract } = await supabase
    .from("booking_contracts")
    .select("*")
    .eq("booking_id", bookingId)
    .maybeSingle();

  const { data: inspections } = await supabase
    .from("booking_inspections")
    .select("*, users!conducted_by(full_name)")
    .eq("booking_id", bookingId);

  // Fetch the inspection template from settings
  const inspectionTemplate = await getInspectionTemplate();

  return {
    success: true,
    contract,
    inspections: inspections || [],
    inspectionTemplate: inspectionTemplate || [],
  };
}

export async function generateContractAction(
  bookingId: string,
  overrides?: { destination?: string; fuelLevel?: string },
) {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  // 1. Get the current staff/admin generating the contract
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  let staffName = "Admin Staff";

  if (authUser) {
    const { data: staffProfile } = await supabase
      .from("users")
      .select("first_name, last_name, full_name")
      .eq("user_id", authUser.id)
      .single();

    if (staffProfile) {
      staffName =
        staffProfile.full_name ||
        `${staffProfile.first_name || ""} ${staffProfile.last_name || ""}`.trim();
    }
  }

  // 2. Fetch Booking Data
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      users!bookings_user_id_fkey(first_name, last_name, full_name, address, phone_number, license_number),
      cars!bookings_car_id_fkey(
        brand, 
        model, 
        plate_number, 
        color,
        car_specifications!cars_spec_id_fkey(fuel_type)
      ),
      drivers!bookings_driver_id_fkey(
        users!drivers_user_id_fkey(full_name, license_number)
      )
    `,
    )
    .eq("booking_id", bookingId)
    .single();

  if (error || !booking) {
    console.error("Error fetching booking for contract:", error);
    return { success: false, message: "Booking not found" };
  }

  let htmlContent = await getContractTemplate();
  if (!htmlContent) {
    return {
      success: false,
      message: "Contract template missing in settings.",
    };
  }

  // Flatten the relations
  const customer = Array.isArray(booking.users)
    ? booking.users[0]
    : booking.users;
  const car = Array.isArray(booking.cars) ? booking.cars[0] : booking.cars;
  const spec = car?.car_specifications
    ? Array.isArray(car.car_specifications)
      ? car.car_specifications[0]
      : car.car_specifications
    : null;

  const driverRecord = Array.isArray(booking.drivers)
    ? booking.drivers[0]
    : booking.drivers;
  const assignedDriverUser = driverRecord?.users
    ? Array.isArray(driverRecord.users)
      ? driverRecord.users[0]
      : driverRecord.users
    : null;

  const customerName =
    customer?.full_name ||
    `${customer?.first_name || ""} ${customer?.last_name || ""}`.trim() ||
    "N/A";

  let authorizedDrivers = customerName;
  let licenseNumbers = customer?.license_number || "Not Provided";

  if (booking.is_with_driver && assignedDriverUser) {
    authorizedDrivers = assignedDriverUser.full_name || "Company Driver";
    licenseNumbers = assignedDriverUser.license_number || "On File";
  }

  // 3. Prepare variables map
  // THE FIX: We check if `overrides` were passed in. If they were, we use them. If not, we fall back to the defaults.
  const variables: Record<string, string> = {
    "{{COMPANY_NAME}}": "S.T.S. TRANSPORT SERVICES",
    "{{COMPANY_ADDRESS}}": "Brgy. Sabang Bao Ormoc City, Leyte",
    "{{COMPANY_PHONE}}": "09677015349",
    "{{STAFF_NAME}}": staffName,
    "{{CUSTOMER_NAME}}": customerName,
    "{{CUSTOMER_ADDRESS}}": customer?.address || "N/A",
    "{{CUSTOMER_PHONE}}": customer?.phone_number || "N/A",
    "{{CAR_BRAND_MODEL}}":
      `${car?.brand || ""} ${car?.model || ""}`.trim() || "N/A",
    "{{PLATE_NUMBER}}": car?.plate_number || "N/A",
    "{{CAR_COLOR}}": car?.color || "N/A",
    "{{FUEL_TYPE}}": spec?.fuel_type || "Unleaded / Diesel",
    "{{FUEL_LEVEL}}":
      overrides?.fuelLevel && overrides.fuelLevel.trim() !== ""
        ? overrides.fuelLevel
        : "Full Tank",
    "{{START_DATE}}": new Date(booking.start_date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    "{{END_DATE}}": new Date(booking.end_date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    "{{TOTAL_PRICE}}": Number(booking.total_price).toLocaleString("en-US", {
      minimumFractionDigits: 2,
    }),
    "{{DESTINATION}}":
      overrides?.destination && overrides.destination.trim() !== ""
        ? overrides.destination
        : booking.dropoff_location || "N/A",
    "{{AUTHORIZED_DRIVERS}}": authorizedDrivers,
    "{{LICENSE_NUMBERS}}": licenseNumbers,
  };

  // 4. Safely Replace All Tags Globally
  Object.entries(variables).forEach(([tag, value]) => {
    htmlContent = htmlContent.replace(new RegExp(tag, "g"), value);
  });

  // 5. Upsert the generated contract into the database
  const { data: existingContract } = await supabaseAdmin
    .from("booking_contracts")
    .select("contract_id")
    .eq("booking_id", bookingId)
    .maybeSingle();

  let actionError;

  if (existingContract) {
    const { error: updateErr } = await supabaseAdmin
      .from("booking_contracts")
      .update({ contract_html: htmlContent })
      .eq("contract_id", existingContract.contract_id);
    actionError = updateErr;
  } else {
    const { error: insertErr } = await supabaseAdmin
      .from("booking_contracts")
      .insert({
        booking_id: bookingId,
        contract_html: htmlContent,
        is_signed: false,
      });
    actionError = insertErr;
  }

  if (actionError) {
    console.error("Database operation failed:", actionError);
    return { success: false, message: actionError.message };
  }

  revalidatePath(`/admin/bookings/${bookingId}`);
  return {
    success: true,
    message: overrides
      ? "Contract updated successfully!"
      : "Contract generated successfully.",
  };
}

export async function startTripAction(bookingId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("bookings")
    .update({ booking_status: "ONGOING" })
    .eq("booking_id", bookingId);

  if (error) return { success: false, message: error.message };
  revalidatePath(`/admin/bookings/${bookingId}`);
  return { success: true };
}
