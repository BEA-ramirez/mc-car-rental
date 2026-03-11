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
}): Promise<ActionResponse> {
  const supabase = await createClient();
  const parsed = searchSchema.safeParse(input);

  if (!parsed.success)
    return { success: false, message: "Invalid search parameters." };

  try {
    // Step 1: Find cars that match the category (if not "any")
    let carQuery = supabase
      .from("cars")
      .select(
        `
        car_id, brand, model, plate_number, rental_rate_per_day, availability_status,
        car_specifications!inner(body_type)
      `,
      )
      .eq("is_archived", false);

    if (parsed.data.category !== "any") {
      // Assuming 'body_type' maps to SUV, Sedan, Van
      carQuery = carQuery.ilike(
        "car_specifications.body_type",
        `%${parsed.data.category}%`,
      );
    }

    const { data: cars, error: carErr } = await carQuery;
    if (carErr) throw new Error(carErr.message);

    // Step 2: Get overlapping bookings for the selected date
    const targetDate = new Date(parsed.data.date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(
      targetDate.setHours(23, 59, 59, 999),
    ).toISOString();

    const { data: bookings, error: bkgErr } = await supabase
      .from("bookings")
      .select("car_id")
      .in("booking_status", ["Confirmed", "Ongoing"])
      .lte("start_date", endOfDay)
      .gte("end_date", startOfDay);

    if (bkgErr) throw new Error(bkgErr.message);

    // Step 3: Filter out booked cars
    const bookedCarIds = new Set(bookings.map((b) => b.car_id));
    const availableCars = cars.filter((c) => !bookedCarIds.has(c.car_id));

    return {
      success: true,
      message: "Availability checked",
      data: availableCars,
    };
  } catch (error) {
    console.error("Error checking availability:", error);
    return { success: false, message: "Failed to check fleet availability." };
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
