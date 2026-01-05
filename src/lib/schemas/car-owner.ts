import z from "zod";

export const carOwnerSchema = z.object({
  car_owner_id: z.string().uuid(),
  user_id: z.string().uuid(),
  business_name: z
    .string()
    .min(2, { message: "Business name must be at least 2 characters." }),
  verification_status: z.enum(["pending", "verified", "rejected"]),
  active_status: z.boolean(),
  owner_notes: z.string().max(500).optional(),
  payment_details: z.string().optional(),
  revenue_share_percentage: z.number().min(0).max(100),
  created_at: z.coerce.date().optional(),
  last_updated_at: z.coerce.date().optional(),
});
export const fleetPartnerDisplaySchema = carOwnerSchema.extend({
  // These fields come from joining with the 'users' table
  partner_name: z.string(),
  email: z.string().email(),
  phone_number: z.string(),
  profile_picture_url: z.string().optional(),

  // Useful aggregated count for the grid
  total_units: z.number().default(0),
});

// Export both types
export type CarOwnerType = z.infer<typeof carOwnerSchema>;
export type FleetPartnerProfileType = z.infer<typeof fleetPartnerDisplaySchema>;
