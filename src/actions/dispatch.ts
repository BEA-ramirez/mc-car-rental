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

  // 1. Wipe existing SCHEDULED assignments for this booking to allow clean replacements
  await supabase
    .from("booking_driver_assignments")
    .delete()
    .eq("booking_id", bookingId)
    .in("status", ["SCHEDULED"]);

  // 2. Insert the new segmented shifts
  const assignments = segments.map((seg) => ({
    booking_id: bookingId,
    driver_id: seg.driverId,
    shift_start: seg.start.toISOString(),
    shift_end: seg.end.toISOString(),
    status: "SCHEDULED",
  }));

  const { error } = await supabase
    .from("booking_driver_assignments")
    .insert(assignments);
  if (error) throw new Error(error.message);

  // 3. Update the main booking table to reflect the primary driver (for legacy UI support)
  // We just take the driver from the first segment
  if (segments.length > 0) {
    await supabase
      .from("bookings")
      .update({ driver_id: segments[0].driverId })
      .eq("booking_id", bookingId);
  }

  return { success: true };
}
