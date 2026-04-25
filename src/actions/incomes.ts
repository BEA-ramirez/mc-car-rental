"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type ActionState = {
  success?: boolean;
  message: string;
};

export async function getIncomeWidgets() {
  const supabase = await createClient();

  const { data: kpis } = await supabase.rpc("get_income_kpis");
  const { data: awaitingPayment } = await supabase.rpc("get_collection_queue");

  return {
    kpis: kpis || {
      grossRevenue: 0,
      grossRevenueGrowth: 0,
      outstandingReceivables: 0,
      outstandingReceivablesGrowth: 0,
      ancillaryIncome: 0,
      ancillaryIncomeGrowth: 0,
    },
    awaitingPayment: awaitingPayment || [],
  };
}

export async function getIncomeTableData(params?: {
  tab?: string;
  page?: number;
  search?: string;
  sort?: string;
  method?: string;
}) {
  const supabase = await createClient();
  const activeTab = params?.tab || "booking_income";
  const page = params?.page || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  // 1. Declare the unified variables that we will return at the end
  let tableData: any[] = [];
  let totalPages = 1;

  if (activeTab === "booking_income") {
    let query = supabase
      .from("booking_payments")
      .select(
        `
        payment_id, amount, payment_method, transaction_reference, paid_at, status,
        bookings!inner(booking_id, users(full_name))
      `,
        { count: "exact" }, // Ask Supabase for the total count for pagination
      )
      .eq("status", "COMPLETED");

    // Apply Search (Matches Payment ID or Booking ID)
    if (params?.search) {
      query = query.or(
        `payment_id.ilike.%${params.search}%,bookings.booking_id.ilike.%${params.search}%`,
      );
    }

    // Apply Filter (Payment Method)
    if (params?.method && params.method !== "ALL") {
      query = query.eq("payment_method", params.method);
    }

    // Apply Sorting
    if (params?.sort) {
      const [column, direction] = params.sort.split(".");
      query = query.order(column, { ascending: direction === "asc" });
    } else {
      query = query.order("paid_at", { ascending: false }); // Default
    }

    // Apply Pagination and assign to our unified variables
    const { data, count } = await query.range(offset, offset + limit - 1);
    tableData = data || [];
    totalPages = Math.ceil((count || 0) / limit) || 1;
  } else if (activeTab === "security_deposits") {
    // Note: Added { count: "exact" } and .range() so pagination works on this tab too!
    const { data, count } = await supabase
      .from("bookings")
      .select(
        `booking_id, start_date, security_deposit, booking_status, users(full_name), booking_charges(category, amount)`,
        { count: "exact" },
      )
      .gt("security_deposit", 0)
      .order("start_date", { ascending: false })
      .range(offset, offset + limit - 1);

    tableData = data || [];
    totalPages = Math.ceil((count || 0) / limit) || 1;
  } else if (activeTab === "misc_income") {
    // Note: Added { count: "exact" } and .range() so pagination works on this tab too!
    const { data, count } = await supabase
      .from("financial_transactions")
      .select("*", { count: "exact" })
      .eq("transaction_type", "INCOME")
      .is("booking_id", null)
      .order("transaction_date", { ascending: false })
      .range(offset, offset + limit - 1);

    tableData = data || [];
    totalPages = Math.ceil((count || 0) / limit) || 1;
  }

  // 2. Return the unified payload that React Query is expecting
  return { tableData, totalPages };
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
      booking_id, 
      start_date, 
      end_date, 
      total_price, 
      base_rate_snapshot, 
      rate_snapshot_24h,
      rate_snapshot_12h,
      security_deposit, 
      payment_status, 
      booking_status,
      is_with_driver,
      pickup_type,
      dropoff_type,
      pickup_location,
      dropoff_location,
      pickup_coordinates,
      dropoff_coordinates,
      users(full_name, phone_number, email), 
      cars(brand, model, plate_number, rental_rate_per_day, rental_rate_per_12h)
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
    .eq("status", "COMPLETED")
    .order("paid_at", { ascending: true });

  return { booking, charges: charges || [], payments: payments || [] };
}

// Record a Booking Payment
export async function recordBookingPayment(input: {
  bookingId: string;
  amount: number;
  method: string;
  reference?: string;
  title?: string;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User authentication error:", userError);
      return {
        success: false,
        message: "You must be logged in.",
      };
    }

    const { error } = await supabase.rpc("record_booking_payment", {
      p_booking_id: input.bookingId,
      p_admin_id: user.id,
      p_amount: input.amount,
      p_method: input.method,
      p_reference: input.reference || null,
      p_title: input.title || "General Payment",
    });

    if (error) {
      console.error("RPC Error (recordBookingPayment):", error);
      return {
        success: false,
        message: error.message || "Failed to record payment.",
      };
    }

    revalidatePath("/admin/financials/incomes");
    return { success: true, message: "Payment recorded successfully." };
  } catch (error) {
    console.error("Unexpected error occurred.", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

// --- WRITE: Add a Booking Charge ---
export async function addBookingCharge(input: {
  bookingId: string;
  category: string;
  description: string;
  amount: number;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User authentication error:", userError);
      return {
        success: false,
        message: "You must be logged in.",
      };
    }

    const { error } = await supabase.rpc("add_booking_charge_v2", {
      p_booking_id: input.bookingId,
      p_admin_id: user.id,
      p_category: input.category,
      p_description: input.description,
      p_amount: input.amount,
    });

    if (error) {
      console.error("RPC Error (addBookingCharge):", error);
      return {
        success: false,
        message: error.message || "Failed to add charge.",
      };
    }

    revalidatePath("/admin/financials/incomes");
    return { success: true, message: "Charge added to folio successfully." };
  } catch (error) {
    console.error("Unexpected error occurred.", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

// Log Misc Income
export async function logMiscIncome(input: {
  amount: number;
  category: string;
  notes: string;
}): Promise<ActionState> {
  const supabase = await createClient();

  // 1. Transform the category text here!
  // "Asset Sale" -> "ASSET_SALE"
  const formattedCategory = input.category
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

  // 2. Insert into the master ledger
  const { error } = await supabase.from("financial_transactions").insert({
    transaction_type: "INCOME",
    category: formattedCategory, // <-- Use the formatted string!
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
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User authentication error:", userError);
      return {
        success: false,
        message: "You must be logged in.",
      };
    }

    const { error } = await supabase.rpc("refund_security_deposit", {
      p_booking_id: input.bookingId,
      p_admin_id: user.id,
      p_amount: input.amount,
      p_method: input.method,
      p_reference: input.reference,
    });

    if (error) return { success: false, message: error.message };

    revalidatePath("/admin/financials/incomes");
    return { success: true, message: "Security Deposit Refunded." };
  } catch (error) {
    console.error("Unexpected error occurred.", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

export async function removeBookingChargeAction(input: { chargeId: string }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) return { success: false, message: "Unauthorized" };

    const { error } = await supabase.rpc("remove_booking_charge", {
      p_charge_id: input.chargeId,
      p_admin_id: user.id,
    });

    if (error) return { success: false, message: error.message };

    revalidatePath("/admin/financials/incomes");
    return { success: true, message: "Charge removed successfully." };
  } catch (err: any) {
    return {
      success: false,
      message: `Unexpected error occurred: ${err.message}`,
    };
  }
}

// --- 4. VOID BOOKING PAYMENT ---
export async function voidBookingPaymentAction(input: {
  paymentId: string;
  reason: string;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) return { success: false, message: "Unauthorized" };

    const { error } = await supabase.rpc("void_booking_payment", {
      p_payment_id: input.paymentId,
      p_admin_id: user.id,
      p_reason: input.reason,
    });

    if (error) return { success: false, message: error.message };

    revalidatePath("/admin/financials/incomes");
    return { success: true, message: "Payment voided successfully." };
  } catch (err: any) {
    return {
      success: false,
      message: `Unexpected error occurred: ${err.message}`,
    };
  }
}

export async function issueBookingRefundAction(input: {
  bookingId: string;
  amount: number;
  category: string;
  description: string;
  method: string;
  reference?: string;
  deductFromInvoice: boolean; // <-- Catch it from the UI
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) return { success: false, message: "Unauthorized" };

    const { error } = await supabase.rpc("issue_booking_refund", {
      p_booking_id: input.bookingId,
      p_admin_id: user.id,
      p_amount: input.amount,
      p_category: input.category,
      p_description: input.description,
      p_method: input.method,
      p_reference: input.reference || null,
      p_deduct_from_invoice: input.deductFromInvoice, // <-- Pass it to the DB
    });

    if (error) return { success: false, message: error.message };

    revalidatePath("/admin/financials/incomes");
    revalidatePath(`/admin/bookings/${input.bookingId}`);
    return { success: true, message: "Refund issued successfully." };
  } catch (err: any) {
    return {
      success: false,
      message: `Unexpected error occurred: ${err.message}`,
    };
  }
}
