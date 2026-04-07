"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getPendingPayments() {
  const supabase = await createClient();

  // Fetch pending payments AND join the related booking, car, and user data
  const { data, error } = await supabase
    .from("booking_payments")
    .select(
      `
      *,
      booking:bookings (
        *,
        car:cars (brand, model, plate_number),
        user:users (full_name, email, phone_number)
      )
    `,
    )
    .eq("status", "Pending")
    .order("paid_at", { ascending: false });

  if (error) {
    console.error("Error fetching pending payments:", error);
    return { success: false, data: [] };
  }

  return { success: true, data };
}

export async function verifyPayment(
  paymentId: string,
  action: "approve" | "reject",
  reason?: string,
  updatedAmount?: string | number, // NEW
  updatedRef?: string, // NEW
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "Unauthorized" };

  // Call the updated RPC with the override parameters
  const { error } = await supabase.rpc("verify_booking_payment_v1", {
    p_payment_id: paymentId,
    p_admin_id: user.id,
    p_action: action,
    p_rejection_reason: reason || null,
    p_updated_amount: updatedAmount ? Number(updatedAmount) : null, // Convert to number for DB
    p_updated_ref: updatedRef || null,
  });

  if (error) {
    console.error("RPC Error (Verify Payment):", error);
    return { success: false, message: error.message };
  }

  // Clear cache for both admin and customer views
  revalidatePath("/admin/bookings");
  revalidatePath("/customer/my-bookings");

  return {
    success: true,
    message: `Payment successfully ${action === "approve" ? "approved" : "rejected"}.`,
  };
}
