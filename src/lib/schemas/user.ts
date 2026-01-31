import { z } from "zod";

export const userSchema = z.object({
  user_id: z.string().uuid(),
  email: z.string().email(),
  full_name: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters." }),
  first_name: z
    .string()
    .min(2, { message: "First name must be at least 2 characters." }),
  last_name: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters." }),
  role: z
    .enum(["admin", "customer", "car_owner", "staff", "driver"])
    .default("customer"),
  account_status: z
    .enum(["pending", "verified", "rejected", "banned", "archived"])
    .default("pending"),
  last_active_at: z.coerce.date().optional().nullable(),
  phone_number: z
    .string()
    .regex(/^[0-9]+$/, { message: "Phone number must contain only numbers." })
    .min(10, { message: "Phone number is too short." })
    .max(15, "Phone number is too long.")
    .optional()
    .nullable(),
  address: z.string().optional().nullable(),
  profile_picture_url: z.string().url().optional().nullable(),
  license_number: z.string().optional().nullable(),
  license_expiry_date: z.coerce.date().optional().nullable(),
  trust_score: z.coerce
    .number()
    .min(0)
    .max(5)
    .optional()
    .nullable()
    .default(5.0),
  rejection_reason: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  last_updated_at: z.coerce.date().optional(),
});

export type UserType = z.infer<typeof userSchema>;
