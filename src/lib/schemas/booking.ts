import { z } from "zod";

export const bookingSchema = z
  .object({
    booking_id: z.string().uuid(),
    user_id: z.string().uuid(),
    car_id: z.string().uuid(),
    driver_id: z.string().uuid().nullable().optional(),
    pickup_location: z
      .string()
      .min(1, { message: "Pickup location is required" }),
    dropoff_location: z
      .string()
      .min(1, { message: "Dropoff location is required" }),
    start_date: z.coerce.date(),
    end_date: z.coerce.date(),
    booking_status: z.enum([
      "pending",
      "confirmed",
      "completed",
      "cancelled",
      "active",
    ]),
    payment_method: z.enum(["credit_card", "debit_card", "paypal", "cash"]),
    created_at: z.coerce.date().optional(),
    last_updated_at: z.coerce.date().optional(),
  })
  .refine((data) => data.end_date > data.start_date, {
    message: "End date must be after start date",
    path: ["end_date"],
  });

export type BookingType = z.infer<typeof bookingSchema>;
