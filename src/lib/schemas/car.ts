import { z } from "zod";

// --- Enums ---
export const TRANSMISSION_TYPES = ["Automatic", "Manual", "CVT"];
export const FUEL_TYPES = ["Gasoline", "Diesel", "Electric", "Hybrid"];
export const BODY_TYPES = [
  "Sedan",
  "SUV",
  "Hatchback",
  "Coupe",
  "Van",
  "Truck",
];
export const CAR_STATUSES = ["Available", "Rented", "Maintenance", "Reserved"];

// --- Features ---
export const featureSchema = z.object({
  feature_id: z.string().uuid().optional(),
  name: z.string().min(2, "Feature name is too short"),
  description: z.string().optional(),
  is_archived: z.boolean().default(false),
  last_updated_at: z.string().datetime().optional().nullable(),
});

export const carFeatureSchema = z.object({
  car_feature_id: z.string().uuid().optional(),
  car_id: z.string().uuid(),
  feature_id: z.string().uuid(),
  is_archived: z.boolean().default(false),
});

// --- Car Specification ---
export const carSpecificationSchema = z.object({
  spec_id: z.string().uuid().optional(),
  engine_type: z.string().min(2, "Engine type required"),
  name: z.string().min(3, "Configuration name is required"),
  transmission: z.string().min(1, "Required"),
  fuel_type: z.string().min(1, "Required"),
  body_type: z.string().min(1, "Required"),
  passenger_capacity: z.coerce.number().min(1).max(20),
  luggage_capacity: z.coerce.number().min(0),
  buffer_hours: z.coerce.number().min(0).default(12),
  is_archived: z.boolean().default(false),
});

// --- Car Images ---
export const carImageSchema = z.object({
  image_id: z.string().uuid().optional(),
  car_id: z.string().uuid().optional(),
  image_url: z.string().url(),
  storage_path: z.string().optional(),
  is_primary: z.boolean().default(false),
  is_archived: z.boolean().default(false),
});

// --- Main Car Schema ---
export const carSchema = z.object({
  car_id: z.string().uuid().optional(),
  car_owner_id: z.string().min(1, "Owner is required"),
  spec_id: z.string().min(1, "Configuration is required"),

  plate_number: z
    .string()
    .min(3)
    .regex(/^[A-Z0-9\s-]+$/),
  brand: z.string().min(2),
  model: z.string().min(2),
  year: z.coerce
    .number()
    .min(1990, "Year must be 1990 or later")
    .max(new Date().getFullYear() + 1, "Year cannot be in the far future"),
  color: z.string().min(2, "Color is required"),
  vin: z.string().max(17).optional().or(z.literal("")),

  rental_rate_per_day: z.coerce.number().min(0, "Rate is required"),
  availability_status: z.string().min(1, "Required"),
  current_mileage: z.coerce.number().min(0).optional(),

  created_at: z.string().datetime().optional(),
  last_updated_at: z.string().datetime().optional(),
  is_archived: z.boolean().default(false),
});

export const completeCarSchema = carSchema.extend({
  specifications: carSpecificationSchema.optional().nullable(),
  features: z.array(featureSchema).optional(),
  images: z.array(carImageSchema).optional(),
  owner: z
    .object({
      car_owner_id: z.string().uuid(),
      business_name: z.string(),
      full_name: z.string(),
    })
    .optional()
    .nullable(),
});

export type FeatureType = z.infer<typeof featureSchema>;
export type CarFeatureType = z.infer<typeof carFeatureSchema>;
export type CarSpecificationType = z.infer<typeof carSpecificationSchema>;
export type CarImage = z.infer<typeof carImageSchema>;
export type CarType = z.infer<typeof carSchema>;
export type CompleteCarType = z.infer<typeof completeCarSchema>;
