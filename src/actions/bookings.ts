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
      p_start_date: input.start_date,
      p_end_date: input.end_date,
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
  id: string,
  status: string,
): Promise<ActionState> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .update({
      booking_status: status,
      last_updated_at: new Date().toISOString(),
    })
    .eq("booking_id", id);

  if (error) return { success: false, message: error.message };

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${id}`);
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
