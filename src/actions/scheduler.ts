"use server";

import { createClient } from "@/utils/supabase/server";
import {
  SchedulerEvent,
  SchedulerResource,
} from "@/components/scheduler/timeline-scheduler";

export async function getSchedulerData(rangeStart: Date, rangeEnd: Date) {
  const supabase = await createClient();

  // 1. Fetch Cars with Nested Spec (Including buffer_hours)
  const { data: cars, error: carError } = await supabase
    .from("cars")
    .select(
      `car_id, brand, model, plate_number, 
       spec:car_specifications!spec_id(transmission, fuel_type, buffer_hours), 
       car_images(image_url, is_primary)`,
    )
    .eq("is_archived", false)
    .order("brand");

  if (carError) {
    console.error("Error fetching cars:", carError);
    return { resources: [], events: [] };
  }

  // 2. Create a Map of CarID -> BufferHours for quick lookup
  const bufferMap = new Map<string, number>();
  cars.forEach((c: any) => {
    const spec = Array.isArray(c.spec) ? c.spec[0] : c.spec;
    // Default to 0 if buffer_hours is missing or null
    bufferMap.set(c.car_id, spec?.buffer_hours || 0);
  });

  // 3. Fetch Bookings
  const { data: bookings, error: bookingError } = await supabase
    .from("bookings")
    .select(
      `booking_id, start_date, end_date, booking_status, payment_status, 
       total_price, pickup_location, dropoff_location, car_id, 
       user:users!user_id(full_name, email, phone_number)`,
    )
    .eq("is_archived", false)
    .lte("start_date", rangeEnd.toISOString())
    .gte("end_date", rangeStart.toISOString());

  if (bookingError) {
    console.error("Error fetching bookings:", bookingError);
    return { resources: [], events: [] };
  }

  // 4. Transform Data

  const resources: SchedulerResource[] = cars.map((car: any) => {
    const spec = Array.isArray(car.spec) ? car.spec[0] : car.spec;

    return {
      id: car.car_id,
      title: `${car.brand} ${car.model}`,
      subtitle: car.plate_number,
      tags: [
        spec?.transmission || "Unknown",
        spec?.fuel_type || "Gas",
        car.availability_status || "Available",
      ].filter(Boolean),
      image:
        car.car_images?.find((img: any) => img.is_primary)?.image_url ||
        car.car_images?.[0]?.image_url,
    };
  });

  const events: SchedulerEvent[] = bookings.map((b: any) => {
    const user = Array.isArray(b.user) ? b.user[0] : b.user;

    let status: "confirmed" | "pending" | "maintenance" = "pending";
    const s = b.booking_status?.toLowerCase();

    if (["confirmed", "ongoing", "completed", "paid"].includes(s)) {
      status = "confirmed";
    } else if (["cancelled", "rejected", "maintenance"].includes(s)) {
      status = "maintenance";
    }

    // Get the buffer hours for this specific car
    const bufferHrs = bufferMap.get(b.car_id) || 0;

    return {
      id: b.booking_id,
      resourceId: b.car_id,
      start: new Date(
        b.start_date.endsWith("Z") ? b.start_date : b.start_date + "Z",
      ),
      end: new Date(b.end_date.endsWith("Z") ? b.end_date : b.end_date + "Z"),
      title: user?.full_name || "Guest User",
      subtitle: b.booking_status,
      status: status,

      // NEW FIELD: Convert buffer hours to minutes for the frontend
      bufferDuration: bufferHrs * 60,

      amount: b.total_price,
      paymentStatus: b.payment_status,
      customerEmail: user?.email,
      customerPhone: user?.phone_number,
      pickupLocation: b.pickup_location,
      dropoffLocation: b.dropoff_location,
    };
  });

  return { resources, events };
}
