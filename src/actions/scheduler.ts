"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  SchedulerEvent,
  SchedulerResource,
} from "@/components/scheduler/timeline-scheduler";

export async function getSchedulerData(startDate: Date, endDate: Date) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("get_scheduler_view", {
      p_start_date: startDate.toISOString(),
      p_end_date: endDate.toISOString(),
    });

    if (error) {
      console.error("Error fetching scheduler data:", error);
      return { events: [], resources: [] };
    }

    return {
      resources: (data?.resources as SchedulerResource[]) || [],
      events: (data?.events as SchedulerEvent[]) || [],
    };
  } catch (error) {
    console.error("Unexpected error fetching scheduler data:", error);
    return { events: [], resources: [] };
  }
}

export async function validateHandoverRequirements(bookingId: string) {
  const supabase = await createClient();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      `
      payment_status,
      booking_contracts (is_signed),
      booking_inspections (type)
    `,
    )
    .eq("booking_id", bookingId)
    .single();

  if (error || !booking)
    return { success: false, message: "Booking not found." };

  const isContractSigned =
    booking.booking_contracts?.some((c: any) => c.is_signed) || false;
  const hasPreTrip =
    booking.booking_inspections?.some((i: any) => i.type === "Pre-trip") ||
    false;

  // NEW: Enforcing strict UPPERCASE check for fully paid bookings
  const isPaid = (booking.payment_status || "").toUpperCase() === "PAID";

  return {
    success: true,
    data: {
      isContractSigned,
      hasPreTrip,
      isPaid,
      isReady: isContractSigned && hasPreTrip && isPaid,
    },
  };
}

export async function validateReturnRequirements(bookingId: string) {
  const supabase = await createClient();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`booking_inspections (type)`)
    .eq("booking_id", bookingId)
    .single();

  if (error || !booking)
    return { success: false, message: "Booking not found." };

  const hasPostTrip =
    booking.booking_inspections?.some((i: any) => i.type === "Post-trip") ||
    false;

  return {
    success: true,
    data: {
      hasPostTrip,
      isReady: hasPostTrip,
    },
  };
}

// --- EXECUTORS ---

export async function executeHandoverAction(bookingId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("execute_vehicle_handover", {
    p_booking_id: bookingId,
  });

  if (error) return { success: false, message: error.message };

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/calendar");

  return {
    success: true,
    message: "Vehicle released successfully. Time clock started.",
    driverConflict: data?.driver_conflict || false,
  };
}

export async function executeReturnAction(bookingId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("execute_vehicle_return", {
    p_booking_id: bookingId,
  });

  if (error) return { success: false, message: error.message };
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/calendar");
  return { success: true, message: "Vehicle return processed successfully." };
}

export async function executeNoShowAction(bookingId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("process_no_show_transaction", {
    p_booking_id: bookingId,
  });

  if (error) return { success: false, message: error.message };
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/calendar");
  return {
    success: true,
    message: "Booking marked as No-Show. Assets freed & customer notified.",
  };
}
