"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getPublicUrl } from "./helper/upload-file";
import { sendBookingVerificationEmail } from "./helper/mail";

export async function getPendingPayments() {
  const supabase = await createClient();

  // Fetch pending payments AND join the related booking, car, user data, and user documents
  const { data, error } = await supabase
    .from("booking_payments")
    .select(
      `
      *,
      booking:bookings (
        *,
        car:cars (brand, model, plate_number),
        user:users (
          full_name, email, phone_number,
          documents (category, file_path)
        )
      )
    `,
    )
    .eq("status", "PENDING")
    .order("paid_at", { ascending: false });

  if (error) {
    console.error("Error fetching pending payments:", error);
    return { success: false, data: [] };
  }

  // Map through the data and attach the public URL
  const paymentsWithUrls = await Promise.all(
    data.map(async (payment) => {
      // If the user has documents, convert their paths to URLs
      if (payment.booking?.user?.documents) {
        const updatedDocuments = await Promise.all(
          payment.booking.user.documents.map(async (doc: any) => {
            const publicUrl = await getPublicUrl(doc.file_path);

            return {
              ...doc,
              file_url: publicUrl, // Attach it as file_url so the UI doesn't break
            };
          }),
        );
        payment.booking.user.documents = updatedDocuments;
      }

      return payment;
    }),
  );

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

  // 1. Authenticate the Admin performing the action
  const {
    data: { user: adminUser },
  } = await supabase.auth.getUser();

  if (!adminUser) return { success: false, message: "Unauthorized" };

  // 2. Fetch the payment details to get the CUSTOMER'S info, car info, and dates
  const { data: paymentInfo, error: fetchError } = await supabase
    .from("booking_payments")
    .select(
      `
      transaction_reference,
      booking:bookings (
        start_date,
        end_date,
        car:cars (brand, model),
        user:users (full_name, email)
      )
    `,
    )
    .eq("payment_id", paymentId)
    .single();

  if (fetchError || !paymentInfo) {
    console.error("Error fetching payment info:", fetchError);
    return {
      success: false,
      message: "Failed to retrieve booking details for email.",
    };
  }

  // 3. Call the updated RPC with the override parameters
  const { error: rpcError } = await supabase.rpc("verify_booking_payment", {
    p_payment_id: paymentId,
    p_admin_id: adminUser.id,
    p_action: action,
    p_rejection_reason: reason || null,
    p_updated_amount: updatedAmount ? Number(updatedAmount) : null,
    p_updated_ref: updatedRef || null,
  });

  if (rpcError) {
    console.error("RPC Error (Verify Payment):", rpcError);
    return { success: false, message: rpcError.message };
  }

  // 4. Send the Email Notification to the Customer
  try {
    // Safely unwrap the arrays that Supabase returns from nested joins
    const booking = Array.isArray(paymentInfo.booking)
      ? paymentInfo.booking[0]
      : paymentInfo.booking;
    const customer = Array.isArray(booking?.user)
      ? booking.user[0]
      : booking?.user;
    const car = Array.isArray(booking?.car) ? booking.car[0] : booking?.car;

    // Safety check
    if (!booking || !customer || !car) {
      console.error("Missing relation data. Cannot send email.");
    } else {
      // Use the updated reference if the admin changed it, otherwise use the original
      const finalRef = updatedRef || paymentInfo.transaction_reference || "N/A";

      // Format dates to look nice (e.g., "Oct 25, 2026")
      const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      };

      await sendBookingVerificationEmail(
        customer.email,
        customer.full_name,
        action,
        {
          carName: `${car.brand} ${car.model}`,
          startDate: formatDate(booking.start_date),
          endDate: formatDate(booking.end_date),
          referenceNo: finalRef,
        },
        reason,
      );
    }
  } catch (emailError) {
    console.error("Failed to send verification email:", emailError);
  }

  // 5. Clear cache to update UI instantly
  revalidatePath("/admin/bookings");
  revalidatePath("/customer/my-bookings");

  return {
    success: true,
    message: `Payment successfully ${action === "approve" ? "approved" : "rejected"}.`,
  };
}
