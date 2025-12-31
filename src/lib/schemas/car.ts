import { z } from "zod";

export const insertCarSchema = z.object({
  // Model: Must be a string, at least 2 characters
  model: z
    .string()
    .min(2, { message: "Model name is too short" })
    .max(50, { message: "Model name is too long" }),

  // Plate Number: Enforce uppercase and specific format
  // Regex Explanation: 3 Letters, space, 3 or 4 digits (Standard PH Format)
  plate_number: z
    .string()
    .regex(/^[A-Z]{3} \d{3,4}$/, {
      message: "Format must be 'ABC 123' or 'ABC 1234'",
    }),

  // Price: Ensure it's a number and positive
  // z.coerce.number() handles the HTML input being a string ("500" -> 500)
  price_per_day: z.coerce
    .number()
    .positive({ message: "Price must be greater than 0" })
    .min(500, { message: "Minimum price is 500" }),

  // Optional: We'll add the image URL later, but it's good to prep for it
  image_url: z.string().optional(),
});

// TypeScript Magic: Automatically create a type from the schema
export type InsertCarType = z.infer<typeof insertCarSchema>;
