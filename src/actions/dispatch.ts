"use server";

import { createClient } from "@/utils/supabase/server";

export async function fetchDispatchAvailability(start: Date, end: Date) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_dispatch_availability", {
    p_start: start.toISOString(),
    p_end: end.toISOString(),
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function saveDispatchPlan(
  bookingId: string,
  segments: { driverId: string; start: Date; end: Date }[],
) {
  const supabase = await createClient();

  // Format the dates so Postgres JSON parser understands them perfectly
  const formattedSegments = segments.map((seg) => ({
    driverId: seg.driverId,
    start: seg.start.toISOString(),
    end: seg.end.toISOString(),
  }));

  const { error } = await supabase.rpc("save_dispatch_plan_transaction", {
    p_booking_id: bookingId,
    p_segments: formattedSegments, // Send as JSON array
  });

  if (error) {
    console.error("Error saving dispatch plan:", error);
    return {
      success: false,
      message: error.message || "Failed to save dispatch plan via RPC.",
    };
  }

  return { success: true, message: "Dispatch plan saved successfully!" };
}
