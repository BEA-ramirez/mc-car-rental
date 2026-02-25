"use server";

import { createClient } from "@/utils/supabase/server";
import {
  AdminCreateBookingSchema,
  AdminBookingInput,
  CompleteBookingType,
} from "@/lib/schemas/booking";
import { revalidatePath } from "next/cache";

export type ActionState = {
  success?: boolean;
  message: string | null;
  errors?: Record<string, string[]>;
  bookingId?: string;
};

// --- 1. CREATE (Admin Super Form) ---
export async function createAdminBooking(data: unknown) {
  const supabase = await createClient();

  // 1. Validate Input
  const result = AdminCreateBookingSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      message: "Validation Failed",
      errors: result.error.flatten().fieldErrors,
    };
  }
  const input = result.data;

  // =========================================================================
  // NEW: CONFLICT CHECK (The "Block and Alert" Method)
  // =========================================================================
  // This looks for any active booking where:
  // Existing Start < New End  AND  Existing End > New Start
  const { data: conflicts, error: conflictError } = await supabase
    .from("bookings")
    .select("booking_id")
    .eq("car_id", input.car_id)
    // We only care about blocking statuses. Pending requests don't block admins.
    .in("booking_status", ["confirmed", "ongoing", "maintenance"])
    .lt("start_date", input.end_date.toISOString())
    .gt("end_date", input.start_date.toISOString())
    .limit(1); // We only need to find 1 to know there's a conflict

  if (conflictError) {
    console.error("Conflict Check Error:", conflictError);
    return {
      success: false,
      message: "Database error while verifying availability.",
    };
  }

  if (conflicts && conflicts.length > 0) {
    return {
      success: false,
      message:
        "Conflict: This vehicle is already booked or under maintenance during the selected dates.",
    };
  }
  // =========================================================================

  // 2. Calculate Base Rent Logic
  const days =
    Math.ceil(
      (input.end_date.getTime() - input.start_date.getTime()) /
        (1000 * 60 * 60 * 24),
    ) || 1;

  let dailyRate = input.custom_daily_rate;
  if (!dailyRate) {
    const { data: car } = await supabase
      .from("cars")
      .select("rental_rate_per_day")
      .eq("car_id", input.car_id)
      .single();
    if (!car) return { success: false, message: "Car not found" };
    dailyRate = car.rental_rate_per_day;
  }
  const baseRent = days * dailyRate!;

  // 3. COMPILE ALL CHARGES
  const charges = [];

  // A. Base Rent
  charges.push({
    category: "Base Rate",
    amount: baseRent,
    description: `${days} days @ ₱${dailyRate}/day`,
  });

  // B. Driver Fee
  if (input.with_driver) {
    const driverTotal = days * input.driver_fee_per_day;
    charges.push({
      category: "Driver Fee",
      amount: driverTotal,
      description: `Chauffeur service (${days} days)`,
    });
  }

  // C. Pickup/Dropoff Fees
  if (input.pickup_price > 0) {
    charges.push({
      category: "Delivery Fee",
      amount: input.pickup_price,
      description: "Pickup: " + input.pickup_location,
    });
  }
  if (input.dropoff_price > 0) {
    charges.push({
      category: "Delivery Fee",
      amount: input.dropoff_price,
      description: "Dropoff: " + input.dropoff_location,
    });
  }

  // D. Additional Charges
  if (input.additional_charges && input.additional_charges.length > 0) {
    input.additional_charges.forEach((c) => {
      charges.push({
        category: c.category,
        amount: c.amount,
        description: c.description || "Extra Item",
      });
    });
  }

  // E. Discount
  if (input.discount_amount > 0) {
    charges.push({
      category: "Discount",
      amount: -input.discount_amount,
      description: "Admin Discount",
    });
  }

  if (input.initial_payment && isNaN(input.initial_payment.amount)) {
    return { success: false, message: "Invalid Payment Amount" };
  }

  // 4. Call the RPC
  const { data: bookingId, error } = await supabase.rpc(
    "admin_create_booking_v1",
    {
      p_user_id: input.user_id,
      p_car_id: input.car_id,
      p_start_date: input.start_date.toISOString(), // Ensure ISO string format
      p_end_date: input.end_date.toISOString(), // Ensure ISO string format
      p_pickup_loc: input.pickup_location,
      p_dropoff_loc: input.dropoff_location,

      // --- NEW PARAMS ---
      p_pickup_coordinates: input.pickup_coordinates || null,
      p_dropoff_coordinates: input.dropoff_coordinates || null,
      p_pickup_type: input.pickup_type,
      p_dropoff_type: input.dropoff_type,
      p_pickup_price: input.pickup_price,
      p_dropoff_price: input.dropoff_price,
      p_is_with_driver: input.with_driver,
      // ------------------

      p_base_rate_snapshot: dailyRate,
      p_security_deposit: input.security_deposit,
      p_charges_json: charges,
      p_initial_payment_json: input.initial_payment ?? null,
    },
  );

  if (error) {
    console.error("RPC Error:", error);
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/bookings");
  return { success: true, message: "Booking created successfully", bookingId };
}

// --- 2. READ (Single Booking) ---
export async function getBookingById(
  id: string,
): Promise<CompleteBookingType | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      user: users(full_name, email, phone_number, profile_picture_url),
      car: cars(brand, model, plate_number, car_images(image_url, is_primary))
    `,
    )
    .eq("booking_id", id)
    .single();

  if (error) return null;

  const booking = data as any;
  if (booking.car && booking.car.car_images) {
    const primary = booking.car.car_images.find((img: any) => img.is_primary);
    booking.car.image_url = primary
      ? primary.image_url
      : booking.car.car_images[0]?.image_url;
  }

  return booking as CompleteBookingType;
}

// --- 3. UPDATE STATUS ---
export async function updateBookingStatus(
  bookingId: string,
  newStatus: string,
): Promise<ActionState> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .update({
      booking_status: newStatus,
      last_updated_at: new Date().toISOString(),
    })
    .eq("booking_id", bookingId);

  if (error) return { success: false, message: error.message };

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);
  return { success: true, message: "Status updated" };
}

// --- 4. DELETE ---
export async function deleteBooking(id: string): Promise<ActionState> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .update({ is_archived: true })
    .eq("booking_id", id);

  if (error) return { success: false, message: error.message };

  revalidatePath("/admin/bookings");
  return { success: true, message: "Booking archived" };
}

// udpate booking dates
export async function updateBookingDates(
  bookingId: string,
  newEndDate: Date,
): Promise<ActionState> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .update({
      end_date: newEndDate.toISOString(),
      last_updated_at: new Date().toISOString(),
    })
    .eq("booking_id", bookingId);

  if (error) {
    console.error("Error updating booking dates:", error);
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/bookings");
  return { success: true, message: "Booking dates updated" };
}

// update buffer duration
export async function updateBufferDuration(
  bookingId: string,
  newBufferMinutes: number,
): Promise<ActionState> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookigns")
    .update({
      buffer_duration_minutes: newBufferMinutes,
      last_updated_at: new Date().toISOString(),
    })
    .eq("booking_id", bookingId);

  if (error) {
    console.error("Error updating buffer duration:", error);
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/bookings");
  return { success: true, message: "Buffer duration updated" };
}

export async function processEarlyReturn(
  bookindId: string,
  newEndDate: Date,
  finalPrice: number,
  refundAmount: number,
  shouldRefund: boolean,
): Promise<ActionState> {
  const supabase = await createClient();

  try {
    const { error } = await supabase.rpc("process_early_return", {
      p_booking_id: bookindId,
      p_new_end_date: newEndDate,
      p_final_price: finalPrice,
      p_refund_amount: refundAmount,
      p_should_refund: shouldRefund,
    });

    if (error) throw error;
    return { success: true, message: "Early return processed successfully" };
  } catch (error) {
    console.error("Failed to process early return via RPC:", error);
    return { success: false, message: "Failed to process early return" };
  }
}

export async function createMaintenanceBlock(
  carId: string,
  startDate: Date,
  endDate: Date,
): Promise<ActionState> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        car_id: carId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        booking_status: "maintenance",
        total_price: 0,
      })
      .select("booking_id")
      .single();

    if (error) throw error;
    revalidatePath("/admin/bookings");
    return {
      success: true,
      message: "Maintenance block created",
      bookingId: data.booking_id,
    };
  } catch (error) {
    console.error("Error creating maintenance block:", error);
    return { success: false, message: "Failed to create maintenance block" };
  }
}

export async function splitBooking(
  bookingId: string,
  splitDate: Date,
): Promise<ActionState> {
  const supabase = await createClient();

  try {
    const { error } = await supabase.rpc("split_booking", {
      p_booking_id: bookingId,
      p_split_date: splitDate.toISOString(),
    });

    if (error) throw error;
    revalidatePath("/admin/bookings");
    return { success: true, message: "Booking split successfully" };
  } catch (error: any) {
    console.error("Error splitting booking:", error);
    return { success: false, message: error.message };
  }
}

export async function reassignBooking(
  bookingId: string,
  newCarId: string,
  newPrice: number,
): Promise<ActionState> {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("bookings")
      .update({
        car_id: newCarId,
        total_price: newPrice, // THE CRUCIAL PRICE UPDATE!
        booking_status: "confirmed", // Since they accepted the proposal
        last_updated_at: new Date().toISOString(),
      })
      .eq("booking_id", bookingId);

    if (error) throw error;

    revalidatePath("/admin/bookings");
    return { success: true, message: "Booking reassigned and price updated" };
  } catch (error: any) {
    console.error("Failed to reassign booking:", error);
    return { success: false, message: error.message };
  }
}
