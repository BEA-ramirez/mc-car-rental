"use server"; // MUST BE AT THE VERY TOP

import { getContractTemplate, getInspectionTemplate } from "@/actions/settings";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

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

export async function generateContractAction(bookingId: string) {
  const supabase = await createClient();

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      `*, users!user_id(full_name, address, phone_number), cars!car_id(brand, model, plate_number, color)`,
    )
    .eq("booking_id", bookingId)
    .single();

  if (error || !booking)
    return { success: false, message: "Booking not found" };

  let htmlContent = await getContractTemplate();
  if (!htmlContent)
    return { success: false, message: "Contract template missing." };

  const customer = Array.isArray(booking.users)
    ? booking.users[0]
    : booking.users;
  const car = Array.isArray(booking.cars) ? booking.cars[0] : booking.cars;

  htmlContent = htmlContent
    .replace(/{{CUSTOMER_NAME}}/g, customer?.full_name || "N/A")
    .replace(/{{CUSTOMER_ADDRESS}}/g, customer?.address || "N/A")
    .replace(/{{CAR_BRAND_MODEL}}/g, `${car?.brand} ${car?.model}`)
    .replace(/{{PLATE_NUMBER}}/g, car?.plate_number || "N/A")
    .replace(/{{START_DATE}}/g, new Date(booking.start_date).toLocaleString())
    .replace(/{{END_DATE}}/g, new Date(booking.end_date).toLocaleString())
    .replace(/{{TOTAL_PRICE}}/g, Number(booking.total_price).toLocaleString())
    .replace(
      /{{SECURITY_DEPOSIT}}/g,
      Number(booking.security_deposit).toLocaleString(),
    );

  // FIX 2: Safely check if a contract exists instead of using .upsert on a non-unique column
  const { data: existingContract } = await supabase
    .from("booking_contracts")
    .select("contract_id")
    .eq("booking_id", bookingId)
    .maybeSingle();

  let actionError;

  if (existingContract) {
    // Update existing
    const { error: updateErr } = await supabase
      .from("booking_contracts")
      .update({ contract_html: htmlContent, is_signed: false })
      .eq("contract_id", existingContract.contract_id);
    actionError = updateErr;
  } else {
    // Insert new
    const { error: insertErr } = await supabase
      .from("booking_contracts")
      .insert({
        booking_id: bookingId,
        contract_html: htmlContent,
        is_signed: false,
      });
    actionError = insertErr;
  }

  if (actionError) return { success: false, message: actionError.message };

  revalidatePath(`/admin/bookings/${bookingId}`);
  return { success: true, message: "Contract generated." };
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
