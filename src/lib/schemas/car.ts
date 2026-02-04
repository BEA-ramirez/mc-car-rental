import { z } from "zod";

// --- Enums ---
export const TransmissionEnum = z.enum(["Automatic", "Manual", "CVT"]);
export const FuelTypeEnum = z.enum([
  "Gasoline",
  "Diesel",
  "Electric",
  "Hybrid",
]);
export const BodyTypeEnum = z.enum([
  "Sedan",
  "SUV",
  "Hatchback",
  "Coupe",
  "Van",
  "Truck",
]);
export const CarStatusEnum = z.enum([
  "Available",
  "Rented",
  "Maintenance",
  "Reserved",
]);

// --- Features ---
export const featureSchema = z.object({
  feature_id: z.string().uuid().optional(),
  name: z.string().min(2, "Feature name is too short"),
  description: z.string().optional(),
});

// --- Car Specification ---
export const carSpecificationSchema = z.object({
  spec_id: z.string().uuid().optional(),
  engine_type: z.string().min(2, "Engine type required"),
  transmission: TransmissionEnum,
  fuel_type: FuelTypeEnum,
  body_type: BodyTypeEnum,
  passenger_capacity: z.coerce.number().min(1).max(20),
  luggage_capacity: z.coerce.number().min(0),
  buffer_hours: z.coerce.number().min(0).default(12),
});

// --- Car Images ---
export const carImageSchema = z.object({
  image_id: z.string().uuid().optional(),
  car_id: z.string().uuid(),
  image_url: z.string().url(),
  storage_path: z.string().optional(),
  is_primary: z.boolean().default(false),
});

// --- Main Car Schema ---
export const carSchema = z.object({
  car_id: z.string().uuid().optional(),
  car_owner_id: z.string().uuid(),
  spec_id: z.string().uuid(),

  plate_number: z
    .string()
    .min(3)
    .regex(/^[A-Z0-9\s-]+$/),
  brand: z.string().min(2),
  model: z.string().min(2),
  year: z.coerce
    .number()
    .min(1990)
    .max(new Date().getFullYear() + 1),
  color: z.string().min(2),
  vin: z.string().length(17).optional(),

  rental_rate_per_day: z.coerce.number().positive(),
  availability_status: CarStatusEnum.default("Available"),
  current_mileage: z.coerce.number().min(0).optional(),

  created_at: z.string().datetime().optional(),
  last_updated_at: z.string().datetime().optional(),
  is_archived: z.boolean().default(false),
});
