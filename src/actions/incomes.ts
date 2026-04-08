"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type ActionState = {
  success?: boolean;
  message: string;
};

// --- READ: Dashboard Data ---
export async function getIncomeDashboardData() {
  const supabase = await createClient();

  const { data: kpis } = await supabase.rpc("get_income_kpis");
  const { data: awaitingPayment } = await supabase.rpc("get_collection_queue");

  // Recent Booking Payments (Joined for context)
  const { data: recentPayments } = await supabase
    .from("booking_payments")
    .select(
      `
      payment_id, amount, payment_method, transaction_reference, paid_at, status,
      bookings(booking_id, users(full_name))
    `,
    )
    .eq("status", "Completed")
    .order("paid_at", { ascending: false })
    .limit(20);

  // Security Deposits (Look for bookings with deposits > 0)
  const { data: deposits } = await supabase
    .from("bookings")
    .select(
      `
      booking_id, start_date, security_deposit, booking_status,
      users(full_name),
      booking_charges(category, amount) -- NEW: Fetch charges to check for refunds
    `,
    )
    .gt("security_deposit", 0)
    .order("start_date", { ascending: false })
    .limit(20);

  // Misc Ledger Income
  const { data: miscIncome } = await supabase
    .from("financial_transactions")
    .select("*")
    .eq("transaction_type", "INCOME")
    .is("booking_id", null) // Ensures it's not tied directly to a booking checkout
    .order("transaction_date", { ascending: false })
    .limit(20);

  return {
    kpis: kpis || {
      grossRevenue: 0,
      outstandingReceivables: 0,
      ancillaryIncome: 0,
    },
    awaitingPayment: awaitingPayment || [],
    recentPayments: recentPayments || [],
    deposits: deposits || [],
    miscIncome: miscIncome || [],
  };
}

// --- READ: Booking Folio Details ---
export async function getBookingFolio(bookingId: string) {
  const supabase = await createClient();

  // Safety check: If a fake ID somehow slips through, don't crash Postgres
  if (!bookingId || !bookingId.includes("-")) {
    return { booking: null, charges: [], payments: [] };
  }

  const { data: booking, error: bErr } = await supabase
    .from("bookings")
    .select(
      `
      booking_id, start_date, end_date, total_price, security_deposit, payment_status,
      users(full_name), cars(brand, plate_number)
    `,
    )
    .eq("booking_id", bookingId)
    .single();

  // Graceful error handling instead of throwing
  if (bErr) {
    console.error("Folio Fetch Error:", bErr.message);
    return { booking: null, charges: [], payments: [] };
  }

  const { data: charges } = await supabase
    .from("booking_charges")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: true });

  const { data: payments } = await supabase
    .from("booking_payments")
    .select("*")
    .eq("booking_id", bookingId)
    .eq("status", "Completed")
    .order("paid_at", { ascending: true });

  return { booking, charges: charges || [], payments: payments || [] };
}

// --- WRITE: Record a Booking Payment ---
export async function recordBookingPayment(input: {
  bookingId: string;
  amount: number;
  method: string;
  reference: string;
}): Promise<ActionState> {
  const supabase = await createClient();

  // 1. Insert into booking_payments
  const { error: pErr } = await supabase.from("booking_payments").insert({
    booking_id: input.bookingId,
    amount: input.amount,
    payment_method: input.method,
    transaction_reference: input.reference,
    status: "Completed",
    paid_at: new Date().toISOString(),
  });

  if (pErr) return { success: false, message: pErr.message };

  // 2. Insert into master financial_transactions ledger
  await supabase.from("financial_transactions").insert({
    transaction_type: "INCOME",
    category: "BOOKING_PAYMENT",
    amount: input.amount,
    booking_id: input.bookingId,
    notes: `Payment via ${input.method} (${input.reference})`,
    status: "COMPLETED",
  });

  // 3. Auto-update booking payment_status
  // Fetch current totals to see if they are now fully paid
  const folio = await getBookingFolio(input.bookingId);
  const totalPaid =
    folio.payments.reduce((sum, p) => sum + Number(p.amount), 0) + input.amount;
  const newStatus =
    totalPaid >= Number(folio?.booking?.total_price) ? "Paid" : "Partial";

  await supabase
    .from("bookings")
    .update({ payment_status: newStatus })
    .eq("booking_id", input.bookingId);

  revalidatePath("/admin/financials/incomes");
  return { success: true, message: "Payment recorded successfully." };
}

// --- WRITE: Add a Booking Charge ---
export async function addBookingCharge(input: {
  bookingId: string;
  category: string;
  description: string;
  amount: number;
}): Promise<ActionState> {
  const supabase = await createClient();

  // 1. Insert the new charge
  const { error: cErr } = await supabase.from("booking_charges").insert({
    booking_id: input.bookingId,
    category: input.category,
    description: input.description,
    amount: input.amount,
  });

  if (cErr) return { success: false, message: cErr.message };

  // 2. Add the charge amount to the booking's total_price
  const { data: bkg } = await supabase
    .from("bookings")
    .select("total_price, payment_status")
    .eq("booking_id", input.bookingId)
    .single();

  if (bkg) {
    const newTotal = Number(bkg.total_price) + input.amount;
    // If they were "Paid" before, they are now "Partial" because the total went up
    const newStatus =
      bkg.payment_status === "Paid" ? "Partial" : bkg.payment_status;

    await supabase
      .from("bookings")
      .update({ total_price: newTotal, payment_status: newStatus })
      .eq("booking_id", input.bookingId);
  }

  revalidatePath("/admin/financials/incomes");
  return { success: true, message: "Charge added to folio." };
}

// --- WRITE: Log Misc Income ---
export async function logMiscIncome(input: {
  amount: number;
  category: string;
  notes: string;
}): Promise<ActionState> {
  const supabase = await createClient();

  const { error } = await supabase.from("financial_transactions").insert({
    transaction_type: "INCOME",
    category: input.category,
    amount: input.amount,
    notes: input.notes,
    reference_type: "MANUAL",
    status: "COMPLETED",
  });

  if (error) return { success: false, message: error.message };

  revalidatePath("/admin/financials/incomes");
  return { success: true, message: "Income logged to ledger." };
}

export async function refundSecurityDeposit(input: {
  bookingId: string;
  amount: number;
  method: string;
  reference: string;
}): Promise<ActionState> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("refund_security_deposit", {
    p_booking_id: input.bookingId,
    p_amount: input.amount,
    p_method: input.method,
    p_reference: input.reference,
  });

  if (error) return { success: false, message: error.message };

  revalidatePath("/admin/financials/incomes");
  return { success: true, message: "Security Deposit Refunded." };
}
