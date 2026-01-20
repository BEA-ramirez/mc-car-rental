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
  role: z.enum(["admin", "customer", "car_owner", "staff"]).default("customer"),
  phone_number: z
    .string()
    .regex(/^[0-9]+$/, { message: "Phone number must contain only numbers." })
    .min(10, { message: "Phone number is too short." })
    .max(15, "Phone number is too long.")
    .optional()
    .nullable(),
  address: z.string().optional().nullable(),
  valid_id_url: z.string().url().optional().nullable(),
  license_id_url: z.string().url().optional().nullable(),
  profile_picture_url: z.string().url().optional().nullable(),
  created_at: z.coerce.date().optional(),
  last_updated_at: z.coerce.date().optional(),
});

export type UserType = z.infer<typeof userSchema>;
