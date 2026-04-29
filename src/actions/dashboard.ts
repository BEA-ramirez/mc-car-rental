"use server";

import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

// Types
export type ActionResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
};

// 1. Fetch Summary Data (KPIs, Alerts, Logistics) via RPC
export async function getDashboardSummary(): Promise<ActionResponse> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc("get_dashboard_summary");

    if (error) throw new Error(error.message);

    return { success: true, message: "Summary fetched", data };
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    return { success: false, message: "Failed to load dashboard data." };
  }
}

// 2. Fetch Recent Bookings for the Table
export async function getRecentBookings(
  limit: number = 6,
): Promise<ActionResponse> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        booking_id,
        start_date,
        end_date,
        booking_status,
        total_price,
        users ( full_name, phone_number ),
        cars ( brand, model, plate_number )
      `,
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);

    // Map relationships to flat objects for the UI
    const formattedData = data.map((b) => {
      // FIX: Handle Supabase TypeScript inference (safely extract single object from array if needed)
      const user = Array.isArray(b.users) ? b.users[0] : b.users;
      const car = Array.isArray(b.cars) ? b.cars[0] : b.cars;

      return {
        id: b.booking_id,
        customer: user?.full_name || "Unknown",
        phone: user?.phone_number || "N/A",
        car: `${car?.brand} ${car?.model}`,
        plate: car?.plate_number,
        start: b.start_date,
        end: b.end_date,
        status: b.booking_status,
        amount: b.total_price,
      };
    });

    return {
      success: true,
      message: "Recent bookings fetched",
      data: formattedData,
    };
  } catch (error) {
    console.error("Error fetching recent bookings:", error);
    return { success: false, message: "Failed to load recent bookings." };
  }
}

// 3. Check Fleet Availability (For the right-side sheet)
const searchSchema = z.object({
  category: z.string(),
  date: z.string(), // ISO string from frontend
});

export async function checkFleetAvailability(input: {
  category: string;
  date: string;
}) {
  const supabase = await createClient();

  try {
    // Step 1: Find cars that match the category
    let carQuery = supabase
      .from("cars")
      .select(
        `
        car_id, brand, model, plate_number, rental_rate_per_day, availability_status,
        car_specifications!inner(body_type)
      `,
      )
      .eq("is_archived", false);

    if (input.category !== "any") {
      carQuery = carQuery.ilike(
        "car_specifications.body_type",
        `%${input.category}%`,
      );
    }

    const { data: cars, error: carErr } = await carQuery;
    if (carErr) throw new Error(carErr.message);

    // Step 2: Get overlapping BOOKINGS for the selected date
    const targetDate = new Date(input.date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(
      targetDate.setHours(23, 59, 59, 999),
    ).toISOString();

    const { data: bookings, error: bkgErr } = await supabase
      .from("bookings")
      .select("car_id")
      // FIX: Added case-insensitivity and "PENDING" to ensure total safety
      .in("booking_status", [
        "CONFIRMED",
        "ONGOING",
        "PENDING",
        "confirmed",
        "ongoing",
        "pending",
      ])
      .lte("start_date", endOfDay)
      .gte("end_date", startOfDay)
      .eq("is_archived", false);

    if (bkgErr) throw new Error(bkgErr.message);

    // Step 3: FIX - Get overlapping MAINTENANCE LOGS for the selected date
    const { data: maintenance, error: maintErr } = await supabase
      .from("maintenance_logs")
      .select("car_id")
      .in("status", ["SCHEDULED", "IN_PROGRESS", "scheduled", "in_progress"])
      .lte("start_date", endOfDay)
      .gte("end_date", startOfDay);

    if (maintErr) throw new Error(maintErr.message);

    // Step 4: Filter out booked OR broken down cars
    const unavailableCarIds = new Set([
      ...(bookings || []).map((b) => b.car_id),
      ...(maintenance || []).map((m) => m.car_id),
    ]);

    const availableCars = (cars || []).filter(
      (c) => !unavailableCarIds.has(c.car_id),
    );

    return availableCars; // Return raw data directly if unwrapped in hook
  } catch (error) {
    console.error("Error checking availability:", error);
    throw error;
  }
}

export async function getChartAnalytics(
  timeframe: string,
): Promise<ActionResponse> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.rpc("get_chart_analytics", {
      p_timeframe: timeframe,
    });

    if (error) throw new Error(error.message);

    return { success: true, message: "Chart data fetched", data };
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return { success: false, message: "Failed to load chart data." };
  }
}

export async function getQuickInsightsData() {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.rpc("get_quick_insights");
    if (error) throw new Error(error.message);

    // Apply UI classes for Inventory based on percentage
    const inventory = (data.inventory || []).map((inv: any) => {
      let indicatorClass = "[&>div]:bg-emerald-500";
      if (inv.percentage >= 100) indicatorClass = "[&>div]:bg-red-500";
      else if (inv.percentage > 75) indicatorClass = "[&>div]:bg-amber-500";
      else if (inv.percentage > 50) indicatorClass = "[&>div]:bg-blue-500";
      return { ...inv, indicatorClass };
    });

    // Apply UI classes and format time for NEW Master Logs
    const logs = (data.logs || []).map((log: any) => {
      let dotClass = "bg-slate-500 ring-slate-100";
      const entity = (log.entity_type || "").toUpperCase();
      const action = (log.action_type || "").toUpperCase();

      if (entity.includes("FINANCIAL") || entity.includes("PAYOUT"))
        dotClass = "bg-purple-500 ring-purple-100 dark:ring-purple-900";
      else if (entity.includes("BOOKING"))
        dotClass = "bg-blue-500 ring-blue-100 dark:ring-blue-900";
      else if (entity.includes("DRIVER") || entity.includes("USER"))
        dotClass = "bg-emerald-500 ring-emerald-100 dark:ring-emerald-900";
      else if (entity.includes("MAINTENANCE") || action === "DELETE")
        dotClass = "bg-red-500 ring-red-100 dark:ring-red-900";

      const time = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(log.created_at));

      return { ...log, time, dotClass };
    });

    return { success: true, data: { inventory, logs } };
  } catch (error) {
    console.error("Error fetching quick insights:", error);
    return { success: false, message: "Failed to load insights." };
  }
}
