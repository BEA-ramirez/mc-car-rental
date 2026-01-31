import { z } from "zod";

export const documentSchema = z.object({
  document_id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  category: z.enum(["invoice", "license_id", "valid_id", "contract", "other"]),
  file_name: z.string().min(1, "File name is required"),
  file_path: z.string().min(1, "File path is required"),
  status: z.enum(["pending", "rejected", "verified"]).default("pending"),
  expiry_date: z.coerce.date().optional().nullable(),
  created_at: z.coerce.date().optional(),
});

export type DocumentType = z.infer<typeof documentSchema>;
