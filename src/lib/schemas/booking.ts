import { z } from "zod";

// ==========================================
// 1. CORE BOOKING (Read from DB)
// ==========================================
export const BookingSchema = z.object({
  booking_id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  car_id: z.string().uuid(),
  driver_id: z.string().uuid().nullable().optional(),

  // --- LOCATION LOGIC ---
  pickup_location: z.string().min(1, "Pickup location is required"),
  dropoff_location: z.string().min(1, "Dropoff location is required"),
  pickup_coordinates: z.string().optional().nullable(),
  dropoff_coordinates: z.string().optional().nullable(),

  // New Fields
  pickup_type: z.enum(["hub", "custom"]).default("hub"),
  dropoff_type: z.enum(["hub", "custom"]).default("hub"),
  pickup_price: z.number().default(0),
  dropoff_price: z.number().default(0),

  // --- DRIVER LOGIC ---
  is_with_driver: z.boolean().default(false), // The flag we added

  start_date: z.string().or(z.date()),
  end_date: z.string().or(z.date()),

  total_price: z.number().min(0),
  security_deposit: z.number().default(0),
  base_rate_snapshot: z.number().default(0),

  booking_status: z.enum([
    "Pending",
    "Confirmed",
    "Ongoing",
    "Completed",
    "Cancelled",
  ]),
  payment_status: z.enum(["Unpaid", "Partial", "Paid", "Refunded"]),

  notes: z.string().optional().nullable(),

  // Relations (Fetched data)
  user: z
    .object({
      full_name: z.string().optional(),
      email: z.string().optional(),
      phone_number: z.string().optional(),
      profile_picture_url: z.string().optional().nullable(),
    })
    .optional(),

  car: z
    .object({
      brand: z.string().optional(),
      model: z.string().optional(),
      plate_number: z.string().optional(),
      image_url: z.string().optional(),
    })
    .optional(),
});

// Helper for dynamic charges in the form
const ExtraChargeSchema = z.object({
  category: z.string(),
  amount: z
    .number()
    .finite("Amount must be a valid number")
    .min(1, "Amount must be at least 1"),
  description: z.string().optional(),
});

// ==========================================
// 2. ADMIN CREATE FORM (The "Super Form")
// ==========================================
export const AdminCreateBookingSchema = z.object({
  // Who & What
  user_id: z.string().uuid({ message: "Customer is required" }),
  car_id: z.string().uuid({ message: "Car is required" }),

  // When
  start_date: z.date(),
  end_date: z.date(),

  // Where (Split Logic)
  pickup_type: z.enum(["hub", "custom"]),
  pickup_location: z.string().min(1, "Pickup location is required"),
  pickup_coordinates: z.string().optional().nullable(),
  pickup_price: z.number().default(0),

  dropoff_type: z.enum(["hub", "custom"]),
  dropoff_location: z.string().min(1, "Dropoff location is required"),
  dropoff_coordinates: z.string().optional().nullable(),
  dropoff_price: z.number().default(0),

  // Driver Options
  with_driver: z.boolean().default(false), // Maps to 'is_with_driver'
  driver_fee_per_day: z.number().default(500), // Used for calculation

  // Financial Overrides
  custom_daily_rate: z.number().optional(),
  discount_amount: z.number().default(0),
  security_deposit: z.number().default(0),

  // Dynamic Extras (e.g., Child Seat)
  additional_charges: z.array(ExtraChargeSchema).optional(),

  // Initial Payment
  initial_payment: z
    .object({
      amount: z
        .number()
        .positive("Amount must be positive")
        .finite("Amount must be a valid number") // <--- BLOCKS NaN/Infinity
        .positive("Amount must be positive"),
      method: z.enum(["Cash", "GCash", "Card", "Bank Transfer"]),
      reference: z.string().optional(),
    })
    .optional(),
});

// ==========================================
// 3. SUB-SCHEMAS (Charges & Payments)
// ==========================================
export const BookingChargeSchema = z.object({
  charge_id: z.string().uuid().optional(),
  booking_id: z.string().uuid(),
  category: z.string(), // Changed from enum to string to allow custom categories like "Cooler Box"
  description: z.string().optional().nullable(),
  amount: z.number(),
  created_at: z.string().or(z.date()).optional(),
});

export const BookingPaymentSchema = z.object({
  payment_id: z.string().uuid().optional(),
  booking_id: z.string().uuid(),
  amount: z.number().positive(),
  payment_method: z.enum([
    "Cash",
    "GCash",
    "Credit Card",
    "Bank Transfer",
    "PayPal",
  ]),
  transaction_reference: z.string().optional().nullable(),
  status: z.enum(["Pending", "Paid", "Failed", "Refunded"]).default("Pending"),
  paid_at: z.string().or(z.date()).optional().nullable(),
});

// Export Types
export type CompleteBookingType = z.infer<typeof BookingSchema>;
export type AdminBookingInput = z.infer<typeof AdminCreateBookingSchema>;
export type CompleteChargeType = z.infer<typeof BookingChargeSchema>;
export type CompletePaymentType = z.infer<typeof BookingPaymentSchema>;
