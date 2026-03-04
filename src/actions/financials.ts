"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type ActionState = {
  success?: boolean;
  message: string;
  payoutId?: string;
};

export async function generateOwnerPayout(
  ownerId: string,
  startDate: Date,
  endDate: Date,
): Promise<ActionState> {
  const supabase = await createClient();

  try {
    // Format dates to YYYY-MM-DD for PostgreSQL Date type compatibility
    const formattedStart = startDate.toISOString().split("T")[0];
    const formattedEnd = endDate.toISOString().split("T")[0];

    const { data: payoutId, error } = await supabase.rpc(
      "generate_owner_payout",
      {
        p_owner_id: ownerId,
        p_start_date: formattedStart,
        p_end_date: formattedEnd,
      },
    );

    if (error) {
      console.error("RPC Error:", error);
      // Catch our custom safety net exception gracefully
      if (error.message.includes("No unsettled")) {
        return {
          success: false,
          message:
            "No unsettled bookings or maintenance records found for this period.",
        };
      }
      return { success: false, message: error.message };
    }

    // Revalidate the expenses page so the new master ledger record shows up instantly
    revalidatePath("/admin/financials/expenses");

    return {
      success: true,
      message: "Payout generated and locked successfully.",
      payoutId,
    };
  } catch (error: any) {
    console.error("Failed to generate payout:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

export async function getFinancialDashboardData() {
  const supabase = await createClient();

  // Fetch KPIs
  const { data: kpis } = await supabase.rpc("get_financial_kpis");

  // Fetch Settlement Queue
  const { data: readyToSettle } = await supabase.rpc(
    "get_unsettled_fleet_revenue",
  );

  // Fetch Payout History
  const { data: payouts } = await supabase
    .from("owner_payouts")
    .select(
      `
      payout_id, period_start, period_end, net_payout, status, created_at,
      car_owner:car_owner_id(users(full_name))
    `,
    )
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch Operational Expenses (Exclude Payouts)
  const { data: operational } = await supabase
    .from("financial_transactions")
    .select("*")
    .eq("transaction_type", "EXPENSE")
    .neq("category", "OWNER_PAYOUT")
    .order("transaction_date", { ascending: false })
    .limit(50);

  return {
    kpis: kpis || {
      totalOutflow: 0,
      pendingLiabilities: 0,
      maintenanceSpend: 0,
    },
    readyToSettle: readyToSettle || [],
    payouts: payouts || [],
    operational: operational || [],
  };
}

export async function logManualExpense(input: {
  amount: number;
  category: string;
  notes: string;
  car_id?: string;
  booking_id?: string;
  chargeToOwner?: boolean;
}): Promise<ActionState> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("log_manual_expense", {
    p_amount: input.amount,
    p_category: input.category,
    p_notes: input.notes,
    p_car_id: input.car_id || null,
    p_booking_id: input.booking_id || null,
    p_charge_to_owner: input.chargeToOwner || false,
  });

  if (error) {
    console.error("Failed to log expense:", error);
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/financials/expenses");
  return {
    success: true,
    message: "Expense logged successfully to the ledger.",
  };
}

export async function markPayoutAsPaid(payoutId: string): Promise<ActionState> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("mark_payout_paid", {
    p_payout_id: payoutId,
  });

  if (error) return { success: false, message: error.message };

  revalidatePath("/admin/financials/expenses");
  return {
    success: true,
    message: "Payout marked as Paid and Ledger updated.",
  };
}

export async function getPayoutBreakdown(payoutId: string) {
  const supabase = await createClient();

  // 1. Get the main payout record and the owner's details
  const { data: payout, error: payoutError } = await supabase
    .from("owner_payouts")
    .select(
      "*, car_owner:car_owner_id(business_name, revenue_share_percentage, users(full_name))",
    ) // <-- FLATTENED HERE
    .eq("payout_id", payoutId)
    .single();

  if (payoutError) throw new Error(payoutError.message);

  // 2. Get all locked bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      "booking_id, start_date, end_date, total_price, car:car_id(brand, plate_number)",
    ) // <-- FLATTENED HERE
    .eq("owner_payout_id", payoutId)
    .order("end_date", { ascending: true });

  // 3. Get all locked maintenance deductions
  const { data: maintenance } = await supabase
    .from("maintenance_logs")
    .select(
      "maintenance_id, service_type, cost, car:car_id(brand, plate_number)",
    ) // <-- FLATTENED HERE
    .eq("owner_payout_id", payoutId)
    .order("end_date", { ascending: true });

  return {
    payout,
    bookings: bookings || [],
    maintenance: maintenance || [],
  };
}
