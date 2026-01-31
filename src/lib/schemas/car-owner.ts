import z from "zod";
import { userSchema } from "./user";

export const carOwnerSchema = z.object({
  car_owner_id: z.string().uuid(),
  user_id: z.string().uuid(),
  business_name: z
    .string()
    .min(2, { message: "Business name must be at least 2 characters." }),

  verification_status: z.enum(["pending", "verified", "rejected"]),
  active_status: z.boolean(),
  owner_notes: z.string().max(500).optional().nullable(),

  // --- PAYMENT DETAILS ---
  bank_name: z.string().min(2, "Bank name required").optional().nullable(),
  bank_account_name: z
    .string()
    .min(2, "Account name required")
    .optional()
    .nullable(),
  bank_account_number: z
    .string()
    .min(5, "Account number required")
    .optional()
    .nullable(),

  revenue_share_percentage: z.number().min(0).max(100),

  // --- FINANCIAL FIELDS ---
  wallet_balance: z.coerce.number().default(0),
  total_lifetime_earnings: z.coerce.number().default(0),

  // --- CONTRACT FIELD ---
  contract_expiry_date: z.coerce.date().optional().nullable(),

  created_at: z.coerce.date().optional(),
  last_updated_at: z.coerce.date().optional(),
});

export const fleetPartnerSchema = userSchema
  .merge(carOwnerSchema)
  .extend({ total_units: z.number().default(0) });

// Export both types
export type CarOwnerType = z.infer<typeof carOwnerSchema>;
export type FleetPartnerType = z.infer<typeof fleetPartnerSchema>;
