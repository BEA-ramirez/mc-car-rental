import { z } from "zod";

const CoordinateSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

// OLD: z.array(CoordinateSchema)
// NEW: z.array(z.array(CoordinateSchema)) -> An Array of Polygons
export const ServiceAreaSchema = z.array(z.array(CoordinateSchema));

export type ServiceArea = z.infer<typeof ServiceAreaSchema>;
