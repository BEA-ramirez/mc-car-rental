import { z } from "zod";

export const baseClientSchema = z.object({
  user_id: z.string().optional(),
  first_name: z.string().min(2, { message: "First name is required" }),
  last_name: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  password: z.string().optional(),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  account_status: z.string(),
  role: z.string(),
  license_number: z.string().optional(),
  license_expiry_date: z.string().optional(),
  valid_id_expiry_date: z.string().optional(),
  profile_picture_url: z.any().optional(),
  license_id_url: z.any().optional(),
  valid_id_url: z.any().optional(),
  trust_score: z.number().min(0).max(5),
  is_archived: z.boolean(),
});

export const clientFormSchema = baseClientSchema.superRefine((data, ctx) => {
  // If there is NO user_id (it's a new user creation) AND the password is empty
  if (!data.user_id && (!data.password || data.password.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password is required for new users.",
      path: ["password"], // This tells React Hook Form exactly which input to highlight red!
    });
  }
});
export type ClientFormValues = z.infer<typeof clientFormSchema>;
