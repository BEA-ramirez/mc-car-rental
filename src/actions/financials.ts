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

export async function getExpenseWidgets() {
  const supabase = await createClient();

  const { data: kpis } = await supabase.rpc("get_expense_kpis_v2");

  const { data: readyToSettle } = await supabase.rpc(
    "get_unsettled_fleet_revenue",
  );

  return {
    kpis: kpis || {
      totalOutflow: 0,
      totalOutflowGrowth: 0,
      pendingLiabilities: 0,
      pendingLiabilitiesGrowth: 0,
      maintenanceSpend: 0,
      maintenanceSpendGrowth: 0,
    },
    readyToSettle: readyToSettle || [],
  };
}

// 2. DYNAMIC TABLE DATA
export async function getExpenseTableData(params: {
  tab: string;
  page: number;
  search?: string;
  sort?: string;
}) {
  const supabase = await createClient();
  const limit = 10;
  const offset = (params.page - 1) * limit;

  let tableData: any[] = [];
  let totalPages = 1;

  if (params.tab === "payouts") {
    let query = supabase.from("owner_payouts").select(
      `
        payout_id, period_start, period_end, net_payout, status, created_at,
        car_owner:car_owner_id(users(full_name))
      `,
      { count: "exact" },
    );

    if (params.search) {
      query = query.ilike("car_owner.users.full_name", `%${params.search}%`);
    }

    const { data, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    tableData = data || [];
    totalPages = Math.ceil((count || 0) / limit) || 1;
  } else {
    // Operational tab
    let query = supabase
      .from("financial_transactions")
      .select("*", { count: "exact" })
      .eq("transaction_type", "EXPENSE")
      .neq("category", "OWNER_PAYOUT");

    if (params.search) {
      query = query.ilike("notes", `%${params.search}%`);
    }

    const { data, count } = await query
      .order("transaction_date", { ascending: false })
      .range(offset, offset + limit - 1);

    tableData = data || [];
    totalPages = Math.ceil((count || 0) / limit) || 1;
  }

  return { tableData, totalPages };
}

export async function logManualExpense(input: {
  amount: number;
  category: string;
  notes: string;
  car_id?: string;
  booking_id?: string;
  chargeToOwner?: boolean;
}) {
  const supabase = await createClient();

  // FORMATTER: Forces UPPERCASE and replaces spaces with underscores
  const formattedCategory = input.category.toUpperCase().replace(/\s+/g, "_");

  const { error } = await supabase.rpc("log_manual_expense", {
    p_amount: input.amount,
    p_category: formattedCategory,
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

  const { data, error } = await supabase.rpc("get_payout_breakdown", {
    p_payout_id: payoutId,
  });

  if (error) {
    console.error("Failed to fetch breakdown:", error);
    throw new Error(error.message);
  }

  // The RPC returns { payout, bookings, maintenance } perfectly formatted
  return data;
}

export async function voidOwnerPayoutAction(payoutId: string) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("void_owner_payout", {
    p_payout_id: payoutId,
  });

  if (error) {
    console.error("Failed to void payout:", error);
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/financials/expenses");
  return { success: true, message: "Payout successfully voided and reversed." };
}

export async function getMasterLedgerWidgets() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_master_ledger_kpis");

  return (
    data || {
      totalIncome: 0,
      totalExpense: 0,
      netCashFlow: 0,
    }
  );
}

// 2. Fetch Table Data with Filters
export async function getMasterLedgerTable(params: {
  page: number;
  search?: string;
  type?: string; // "ALL", "INCOME", "EXPENSE"
  period?: string; // "ALL", "TODAY", "MONTH", "3MONTHS"
}) {
  const supabase = await createClient();
  const limit = 10;
  const offset = (params.page - 1) * limit;

  let query = supabase
    .from("financial_transactions")
    .select(
      `
      *,
      car:car_id(plate_number),
      booking:booking_id(users(full_name))
    `,
      { count: "exact" },
    )
    .eq("status", "COMPLETED");

  // Apply Type Filter
  if (params.type && params.type !== "ALL") {
    query = query.eq("transaction_type", params.type);
  }

  // Apply Search Filter (searches notes or category)
  if (params.search) {
    query = query.or(
      `notes.ilike.%${params.search}%,category.ilike.%${params.search}%`,
    );
  }

  // Apply Date Filter
  if (params.period && params.period !== "ALL") {
    const now = new Date();
    if (params.period === "TODAY") {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      query = query.gte("transaction_date", startOfDay);
    } else if (params.period === "MONTH") {
      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ).toISOString();
      query = query.gte("transaction_date", startOfMonth);
    } else if (params.period === "3MONTHS") {
      const startOf3Months = new Date(
        now.getFullYear(),
        now.getMonth() - 3,
        1,
      ).toISOString();
      query = query.gte("transaction_date", startOf3Months);
    }
  }

  const { data, count, error } = await query
    .order("transaction_date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Ledger fetch error:", error);
    return { transactions: [], totalPages: 1 };
  }

  return {
    transactions: data || [],
    totalPages: Math.ceil((count || 0) / limit) || 1,
  };
}
