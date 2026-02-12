import z from "zod";
// Driver Status: Available, On trip, Off duty, Pending, Suspended

export const driverSchema = z.object({
  driver_id: z.string().uuid().optional(),
  display_id: z.string().optional(),
  user_id: z.string().uuid().optional(),
  driver_status: z.string().default("Pending"),
  is_verified: z.boolean().default(false),
  is_archived: z.boolean().default(false),
  created_at: z.string().optional(),
  last_updated_at: z.string().nullable().optional(),
});

export const completeDriverSchema = driverSchema.extend({
  profiles: z.object({
    full_name: z.string(),
    first_name: z.string().nullable(),
    last_name: z.string().nullable(),
    email: z.string().email(),
    phone_number: z.string().nullable(),
    address: z.string().nullable(),
    profile_picture_url: z.string().nullable(),
    license_number: z.string().nullable(),
    license_expiry_date: z.string().nullable(),
  }),

  documents: z
    .array(
      z.object({
        document_id: z.string().uuid(),
        category: z.string(),
        file_path: z.string(),
        status: z.string(),
        expiry_date: z.string().nullable(),
      }),
    )
    .optional()
    .default([]),

  bookings: z.array(z.any()).optional().default([]),
});

export type DriverType = z.infer<typeof driverSchema>;
export type CompleteDriverType = z.infer<typeof completeDriverSchema>;
