"use server";

import { createClient } from "@/utils/supabase/server";
import {
  AdminCreateBookingSchema,
  AdminBookingInput,
  CompleteBookingType,
} from "@/lib/schemas/booking";
import { CreateBookingPayload } from "@/types/bookings";
import { revalidatePath } from "next/cache";
import { addHours } from "date-fns";
import { sendAdminBookingNotification } from "./helper/mail";

export type ActionState = {
  success?: boolean;
  message: string | null;
  errors?: Record<string, string[]>;
  bookingId?: string;
};

// CREATE (Customer Booking Request)
export async function createCustomerBooking(
  data: CreateBookingPayload,
): Promise<ActionState> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      message: "You must be logged in to book a vehicle.",
    };
  }

  // --- MATH CALCULATION FOR ITEMIZATION ---
  // A 12-hour rental is essentially a 1-day base rate, minus the discount.
  // Standard day calculation:
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);

  // Calculate days on the server so it never fails (returns at least 1)
  const msDiff = endDate.getTime() - startDate.getTime();
  const totalHours = msDiff / (1000 * 60 * 60);
  const calculatedDays = Math.max(1, Math.ceil(totalHours / 24));

  // Now baseRentTotal is guaranteed to be a valid number > 0!
  const baseRentTotal = data.is12HourPromo
    ? data.carDailyRate
    : data.carDailyRate * calculatedDays;

  const discountAmount = data.is12HourPromo
    ? data.carDailyRate - data.car12HourRate
    : 0;

  // --- CALL THE MASTER RPC ---
  const { error } = await supabase.rpc("create_customer_booking_v2", {
    p_user_id: user.id,
    p_car_id: data.car_id,
    p_start_date: new Date(data.start_date).toISOString(),
    p_end_date: new Date(data.end_date).toISOString(), // RPC will override this if 12-hr
    p_pickup_loc: data.pickup_location,
    p_dropoff_loc: data.dropoff_location,
    p_pickup_type: data.pickup_type,
    p_dropoff_type: data.dropoff_type,
    p_pickup_price: data.pickup_price || 0,
    p_dropoff_price: data.dropoff_price || 0,
    p_is_with_driver: data.is_with_driver || false,

    // Financials
    p_base_rate_snapshot: data.carDailyRate,
    p_total_base_rent: baseRentTotal,
    p_total_price: data.grand_total,
    p_security_deposit: data.security_deposit || 0,

    // Coordinates & Promos
    p_pickup_coordinates: data.pickup_coords || null,
    p_dropoff_coordinates: data.dropoff_coords || null,
    p_is_12_hour_promo: data.is12HourPromo || false,
    p_promo_discount_amount: discountAmount,

    // Payment Data
    p_reservation_fee_paid: data.payment_details?.amount || 0,
    p_transaction_reference:
      data.payment_details?.transaction_reference || null,
    p_receipt_url: data.payment_details?.receipt_url || null,
  });

  if (error) {
    console.error("RPC Error (Customer Booking):", error);
    return {
      success: false,
      message: error.message || "Failed to submit booking request.",
    };
  }

  try {
    // Get the emails of all Admins and Staff
    const { data: adminUsers } = await supabase
      .from("users")
      .select("email")
      .in("role", ["ADMIN", "STAFF"]);

    const adminEmails = adminUsers
      ?.map((u) => u.email)
      .filter(Boolean) as string[];

    // Format dates and get Customer name
    const formattedDates = `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`;
    const customerName = user.user_metadata?.full_name || "A Customer";

    // Fire and forget the email (No 'await' so the user doesn't wait for SMTP)
    if (adminEmails && adminEmails.length > 0) {
      sendAdminBookingNotification(
        adminEmails,
        customerName,
        formattedDates,
      ).catch((err) =>
        console.error("Failed to send admin booking email:", err),
      );
    }
  } catch (err) {
    // catch this silently. A failed email shouldn't tell the user their booking failed
    console.error("Email notification block failed:", err);
  }

  revalidatePath("/customer/my-bookings");
  revalidatePath("/admin/bookings");

  return {
    success: true,
    message: "Booking confirmed! Awaiting payment verification.",
  };
}

export async function createAdminBooking(data: AdminBookingInput) {
  const supabase = await createClient();

  // Validate Input
  const result = AdminCreateBookingSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      message: "Validation Failed",
      errors: result.error.flatten().fieldErrors,
    };
  }
  const input = result.data;

  // --- FETCH CAR FOR BASE RATE AND PROMO RATE ---
  const { data: car } = await supabase
    .from("cars")
    .select(
      "rental_rate_per_day, rental_rate_per_12h, brand, model, plate_number",
    )
    .eq("car_id", input.car_id)
    .single();

  if (!car) return { success: false, message: "Car not found" };

  const dailyRate = input.custom_daily_rate || car.rental_rate_per_day;

  // --- DATE & PROMO LOGIC ---
  const startDate = input.start_date;
  let endDate = input.end_date;

  if (input.is_12_hour_promo) {
    endDate = addHours(startDate, 12);
  }

  // =========================================================================
  // CONFLICT CHECK (The "Block and Alert" Method)
  // =========================================================================
  const { data: conflicts, error: conflictError } = await supabase
    .from("bookings")
    .select("booking_id")
    .eq("car_id", input.car_id)
    .in("booking_status", ["CONFIRMED", "ONGOING", "MAINTENANCE"])
    .lt("start_date", endDate.toISOString())
    .gt("end_date", startDate.toISOString())
    .limit(1);

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

  // Calculate Base Rent Logic
  const days =
    Math.ceil(
      (input.end_date.getTime() - input.start_date.getTime()) /
        (1000 * 60 * 60 * 24),
    ) || 1;
  const baseRent = days * dailyRate!;

  // 3. COMPILE ALL CHARGES
  const charges = [];

  // A. Base Rent
  charges.push({
    category: "BASE_RATE",
    amount: baseRent,
    description: `${days} days @ ₱${dailyRate}/day`,
  });

  // B. Promo Discount
  if (input.is_12_hour_promo && car.rental_rate_per_12h > 0) {
    const discount = dailyRate - car.rental_rate_per_12h;
    if (discount > 0) {
      charges.push({
        category: "PROMO_DISCOUNT",
        amount: -discount,
        description: "12-Hour Rental Promo",
      });
    }
  }

  // C. Driver Fee
  if (input.with_driver) {
    const driverTotal = days * input.driver_fee_per_day;
    charges.push({
      category: "DRIVER_FEE",
      amount: driverTotal,
      description: `Chauffeur service (${days} days)`,
    });
  }

  // D. Pickup/Dropoff Fees
  if (input.pickup_price > 0) {
    charges.push({
      category: "DELIVERY_FEE",
      amount: input.pickup_price,
      description: "Pickup: " + input.pickup_location,
    });
  }
  if (input.dropoff_price > 0) {
    charges.push({
      category: "DELIVERY_FEE",
      amount: input.dropoff_price,
      description: "Dropoff: " + input.dropoff_location,
    });
  }

  // E. Additional Charges
  if (input.additional_charges && input.additional_charges.length > 0) {
    input.additional_charges.forEach((c: any) => {
      charges.push({
        category: c.category,
        amount: c.amount,
        description: c.description || "Extra Item",
      });
    });
  }

  // F. Manual Discount
  if (input.discount_amount > 0) {
    charges.push({
      category: "DISCOUNT",
      amount: -input.discount_amount,
      description: "Admin Discount",
    });
  }

  if (input.initial_payment && isNaN(input.initial_payment.amount)) {
    return { success: false, message: "Invalid Payment Amount" };
  }

  // 4. Call the RPC (Removed Template and Contract parameters)
  const { data: bookingId, error } = await supabase.rpc(
    "admin_create_booking_v1",
    {
      p_user_id: input.user_id,
      p_car_id: input.car_id,
      p_start_date: startDate.toISOString(),
      p_end_date: endDate.toISOString(),
      p_pickup_loc: input.pickup_location,
      p_dropoff_loc: input.dropoff_location,
      p_pickup_coordinates: input.pickup_coordinates || null,
      p_dropoff_coordinates: input.dropoff_coordinates || null,
      p_pickup_type: input.pickup_type,
      p_dropoff_type: input.dropoff_type,
      p_pickup_price: input.pickup_price,
      p_dropoff_price: input.dropoff_price,
      p_is_with_driver: input.with_driver,
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
// UPDATE (Admin Super Form)
export async function updateAdminBooking(bookingId: string, data: unknown) {
  const supabase = await createClient();

  const result = AdminCreateBookingSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      message: "Validation Failed",
      errors: result.error.flatten().fieldErrors,
    };
  }
  const input = result.data;

  // --- NEW: FETCH CAR FOR BASE RATE AND PROMO RATE ---
  const { data: car } = await supabase
    .from("cars")
    .select("rental_rate_per_day, rental_rate_per_12h")
    .eq("car_id", input.car_id)
    .single();

  if (!car) return { success: false, message: "Car not found" };

  const dailyRate = input.custom_daily_rate || car.rental_rate_per_day;

  // --- NEW: DATE & PROMO LOGIC ---
  const startDate = input.start_date;
  let endDate = input.end_date;

  if (input.is_12_hour_promo) {
    endDate = addHours(startDate, 12);
  }

  const days =
    Math.ceil(
      (input.end_date.getTime() - input.start_date.getTime()) /
        (1000 * 60 * 60 * 24),
    ) || 1;
  const baseRent = days * dailyRate!;

  const charges = [];

  charges.push({
    category: "BASE_RATE",
    amount: baseRent,
    description: `${days} days @ ₱${dailyRate}/day`,
  });

  if (input.is_12_hour_promo && car.rental_rate_per_12h > 0) {
    const discount = dailyRate - car.rental_rate_per_12h;
    if (discount > 0) {
      charges.push({
        category: "PROMO_DISCOUNT",
        amount: -discount,
        description: "12-Hour Rental Promo",
      });
    }
  }

  if (input.with_driver) {
    const driverTotal = days * input.driver_fee_per_day;
    charges.push({
      category: "DRIVER_FEE",
      amount: driverTotal,
      description: `Chauffeur service (${days} days)`,
    });
  }

  if (input.pickup_price > 0) {
    charges.push({
      category: "DELIVERY_FEE",
      amount: input.pickup_price,
      description: "Pickup: " + input.pickup_location,
    });
  }
  if (input.dropoff_price > 0) {
    charges.push({
      category: "DELIVERY_FEE",
      amount: input.dropoff_price,
      description: "Dropoff: " + input.dropoff_location,
    });
  }

  if (input.additional_charges && input.additional_charges.length > 0) {
    input.additional_charges.forEach((c) => {
      charges.push({
        category: c.category,
        amount: c.amount,
        description: c.description || "Extra Item",
      });
    });
  }

  if (input.discount_amount > 0) {
    charges.push({
      category: "DISCOUNT",
      amount: -input.discount_amount,
      description: "Admin Discount",
    });
  }

  if (input.initial_payment && isNaN(input.initial_payment.amount)) {
    return { success: false, message: "Invalid Payment Amount" };
  }

  const { error } = await supabase.rpc("admin_update_booking_v1", {
    p_booking_id: bookingId,
    p_user_id: input.user_id,
    p_car_id: input.car_id,
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString(), // Adjusted date!
    p_pickup_loc: input.pickup_location,
    p_dropoff_loc: input.dropoff_location,
    p_pickup_coordinates: input.pickup_coordinates || null,
    p_dropoff_coordinates: input.dropoff_coordinates || null,
    p_pickup_type: input.pickup_type,
    p_dropoff_type: input.dropoff_type,
    p_pickup_price: input.pickup_price,
    p_dropoff_price: input.dropoff_price,
    p_is_with_driver: input.with_driver,
    p_base_rate_snapshot: dailyRate,
    p_security_deposit: input.security_deposit,
    p_charges_json: charges,
    p_new_payment_json: input.initial_payment ?? null,
  });

  if (error) {
    console.error("RPC Error:", error);
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/bookings");
  return { success: true, message: "Booking updated successfully" };
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
export async function deleteBooking(id: string, reason?: string) {
  const supabase = await createClient();

  // Call the atomic RPC transaction to handle the booking, driver schedules, payments, and logs safely
  const { error } = await supabase.rpc("archive_booking_transaction", {
    p_booking_id: id,
    p_reason: reason || "Archived by Admin",
  });

  if (error) {
    console.error("Error archiving booking:", error);
    return {
      success: false,
      message: error.message || "Failed to archive booking.",
    };
  }

  // Revalidate the lists and the specific booking page to instantly update the UI
  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${id}`);

  return {
    success: true,
    message: "Booking securely archived and resources freed.",
  };
}

export async function updateBookingDates(bookingId: string, newEndDate: Date) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("update_booking_dates_transaction", {
    p_booking_id: bookingId,
    p_new_end_date: newEndDate.toISOString(),
  });

  if (error) {
    console.error("Error updating booking dates:", error);
    // The RPC raises a specific error message if there is a car conflict
    return {
      success: false,
      message: error.message || "Failed to update booking dates.",
    };
  }

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);

  return {
    success: true,
    message: "Booking dates and calculations updated successfully.",
  };
}

// update buffer duration
export async function updateBufferDuration(
  bookingId: string,
  newBufferMinutes: number,
): Promise<ActionState> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .update({
      buffer_duration: newBufferMinutes,
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
        booking_status: "MAINTENANCE",
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
        booking_status: "CONFIRMED", // Since they accepted the proposal
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

export async function getCustomerBookings() {
  const supabase = await createClient();

  // Get the logged-in user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, message: "Unauthorized", data: [] };
  }

  // Fetch only their bookings, joining the car and payments data
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      car: cars(brand, model, plate_number, car_images(image_url, is_primary)),
      payments: booking_payments(amount, status)
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching customer bookings:", error);
    return { success: false, message: error.message, data: [] };
  }

  // Format the data for the UI
  const formattedData = data.map((b: any) => {
    // Extract Primary Image
    if (b.car && b.car.car_images) {
      const primary = b.car.car_images.find((img: any) => img.is_primary);
      b.car.image_url = primary
        ? primary.image_url
        : b.car.car_images[0]?.image_url;
    }

    // Calculate Payments
    const approvedPayments =
      b.payments?.filter((p: any) => p.status === "COMPLETED") || [];
    const pendingPayments =
      b.payments?.filter((p: any) => p.status === "PENDING") || [];

    const amountPaid = approvedPayments.reduce(
      (sum: number, p: any) => sum + Number(p.amount),
      0,
    );
    const pendingAmount = pendingPayments.reduce(
      (sum: number, p: any) => sum + Number(p.amount),
      0,
    );

    return {
      id: b.booking_id.split("-")[0].toUpperCase(),
      original_id: b.booking_id,
      car: {
        brand: b.car?.brand,
        model: b.car?.model,
        image: b.car?.image_url || "https://placehold.co/600x400?text=No+Image",
      },
      startDate: new Date(b.start_date),
      endDate: new Date(b.end_date),
      status: b.booking_status,
      paymentMethod: b.payment_method || "gcash",
      pickupLocation: b.pickup_location,
      dropoffLocation: b.dropoff_location,
      pickupCoords: b.pickup_coordinates || null,
      dropoffCoords: b.dropoff_coordinates || null,
      totalAmount: Number(b.total_price),
      amountPaid: amountPaid,
      pendingAmount: pendingAmount,
      driver: b.is_with_driver,
    };
  });
  return { success: true, data: formattedData };
}

export async function submitPaymentReceipt(
  bookingId: string,
  amount: number,
  referenceNumber: string,
  receiptUrl: string,
): Promise<ActionState> {
  const supabase = await createClient();

  // Call the atomic RPC
  const { error } = await supabase.rpc("submit_payment_receipt_v1", {
    p_booking_id: bookingId,
    p_amount: amount,
    p_reference_number: referenceNumber || "N/A",
    p_receipt_url: receiptUrl,
  });

  if (error) {
    console.error("RPC Error (Submit Payment):", error);
    return { success: false, message: "Failed to record payment." };
  }

  // Revalidate UI
  revalidatePath("/customer/my-bookings");
  revalidatePath("/admin/bookings");
  return { success: true, message: "Receipt uploaded successfully!" };
}

export async function getCarUnavailableDatesAction(carId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_car_unavailable_dates", {
    p_car_id: carId,
  });

  if (error) {
    console.error("Error fetching unavailable dates:", error);
    return [];
  }

  return data;
}

export async function checkDriverAvailabilityAction(
  startDate: string,
  endDate: string,
) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("check_driver_availability", {
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) {
    console.error("Error checking driver availability:", error);
    return false; // Fail safe: assume no drivers if the query breaks
  }

  // The RPC returns a boolean
  return !!data;
}

export async function getBookingDetailsAction(bookingId: string) {
  const supabase = await createClient();

  if (!bookingId || !bookingId.includes("-")) {
    return { success: false, data: null, message: "Invalid Booking ID" };
  }

  // Fetch the booking with all relational joins
  // NEW: Added booking_driver_assignments to the query string
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      customer:users!user_id(user_id,full_name, email, phone_number),
      car:cars!car_id(brand, model, plate_number, car_images(image_url, is_primary)),
      driver:drivers!driver_id(driver_id, users(full_name)),
      booking_driver_assignments (
        assignment_id,
        driver_id,
        shift_start,
        shift_end,
        status
      ),
      payments:booking_payments(amount, status),
      contracts:booking_contracts(is_signed),
      inspections:booking_inspections(type),
      logs:booking_logs(log_id, action_type, message, created_at)
    `,
    )
    .eq("booking_id", bookingId)
    .single();

  if (error) {
    console.error("Error fetching booking details:", error);
    return { success: false, data: null, message: error.message };
  }

  const primaryImage =
    booking.car?.car_images?.find((img: any) => img.is_primary)?.image_url ||
    booking.car?.car_images?.[0]?.image_url ||
    "https://placehold.co/600x400?text=No+Image";

  const amountPaid =
    booking.payments
      ?.filter((p: any) => p.status === "COMPLETED")
      .reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;

  // Sort logs dynamically so newest is at the top
  const sortedLogs = booking.logs
    ? booking.logs.sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    : [];

  const formattedData = {
    id: booking.booking_id,
    status: booking.booking_status,
    start_date: new Date(booking.start_date),
    end_date: new Date(booking.end_date),
    pickup_location: booking.pickup_location,
    dropoff_location: booking.dropoff_location,
    total_price: Number(booking.total_price),
    security_deposit: Number(booking.security_deposit),
    amount_paid: amountPaid,
    is_with_driver: booking.is_with_driver,
    notes: booking.notes || "",
    logs: sortedLogs,

    // <-- NEW: Passed to the payload so the frontend can detect Dispatch Gaps!
    booking_driver_assignments: booking.booking_driver_assignments || [],

    customer: {
      id: booking.customer?.user_id,
      name: booking.customer?.full_name || "Unknown Customer",
      email: booking.customer?.email || "No Email",
      phone: booking.customer?.phone_number || "No Phone",
    },
    car: {
      id: booking.car_id,
      brand: booking.car?.brand,
      model: booking.car?.model,
      plate: booking.car?.plate_number,
      image: primaryImage,
    },
    driver: booking.driver
      ? {
          id: booking.driver.driver_id,
          name: booking.driver.users?.full_name || "Unknown Driver",
        }
      : null,
    has_contract: booking.contracts && booking.contracts.length > 0,
    is_contract_signed: booking.contracts?.some((c: any) => c.is_signed),
    has_pre_trip: booking.inspections?.some((i: any) => i.type === "Pre-trip"),
    has_post_trip: booking.inspections?.some(
      (i: any) => i.type === "Post-trip",
    ),
  };

  return { success: true, data: formattedData };
}

export async function cancelBookingAction(
  bookingId: string,
  reason: string,
  refundAction: "forfeit" | "refund",
  amountPaid: number,
  refundMethod?: string,
) {
  const supabase = await createClient();

  // Call the single database transaction
  const { error } = await supabase.rpc("cancel_booking_transaction", {
    p_booking_id: bookingId,
    p_reason: reason,
    p_refund_action: refundAction,
    p_amount_paid: amountPaid,
    p_refund_method: refundAction === "refund" ? refundMethod || "Cash" : null,
  });

  if (error) {
    console.error("Transaction Error:", error);
    return {
      success: false,
      message: error.message || "Failed to cancel booking via RPC.",
    };
  }

  // Revalidate the UI so the frontend reflects the cancelled status instantly
  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);

  return { success: true, message: "Booking cancelled successfully." };
}

export async function updateBookingNoteAction(
  bookingId: string,
  note: string,
): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("bookings")
    .update({ notes: note })
    .eq("booking_id", bookingId);

  if (error) return { success: false, message: error.message };

  revalidatePath(`/admin/bookings/${bookingId}`);
  return { success: true, message: "Notes updated." };
}

export async function cancelPendingBooking(bookingId: string) {
  const supabase = await createClient();

  // RLS protects this - they can only update their OWN bookings
  const { error } = await supabase
    .from("bookings")
    .update({
      booking_status: "CANCELLED",
      notes: "Cancelled by customer before verification.",
    })
    .eq("booking_id", bookingId)
    .eq("booking_status", "PENDING"); // Security check: Only allow if still Pending!

  if (error) {
    console.error("Failed to cancel:", error);
    return { success: false, message: "Could not cancel booking." };
  }

  // Log the cancellation
  await supabase.from("booking_logs").insert({
    booking_id: bookingId,
    action_type: "BOOKING_CANCELLED",
    message: "Customer cancelled the booking request.",
  });

  revalidatePath("/customer/my-bookings");
  return { success: true, message: "Booking cancelled successfully." };
}
