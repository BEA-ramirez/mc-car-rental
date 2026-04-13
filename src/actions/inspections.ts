"use server";

import { createClient } from "@/utils/supabase/server";
import { getInspectionTemplate } from "@/actions/settings";

export async function generateInspectionForBooking(
  bookingId: string,
  type: "Pre-trip" | "Post-trip",
) {
  const supabase = await createClient();

  // 1. Fetch the master template from Settings
  const rawTemplate = await getInspectionTemplate();

  let categories: any = [];
  let blueprintUrl = "/default-car-outline.png"; // Fallback if none uploaded

  // Handle the transition gracefully (checks if it's the old Array or new Object format)
  if (Array.isArray(rawTemplate)) {
    categories = rawTemplate;
  } else if (rawTemplate && rawTemplate.categories) {
    categories = rawTemplate.categories;
    blueprintUrl = rawTemplate.blueprint_url || blueprintUrl;
  }

  if (!categories || categories.length === 0) {
    throw new Error(
      "No inspection template found in settings. Please configure one first.",
    );
  }

  // 2. Transform the template into a "Fillable Form" for the staff
  // We add 'status', 'notes', and 'photoUrl' to every single item.
  const fillableChecklist = categories.map((category: any) => ({
    categoryId: category.id,
    categoryName: category.name,
    items: category.items.map((item: any) => ({
      itemId: item.id,
      label: item.label,
      status: "PENDING", // Options: 'PENDING', 'PASS', 'ISSUE'
      notes: "",
      photoUrl: null,
    })),
  }));

  // 3. Insert the new row into booking_inspections
  const { data, error } = await supabase
    .from("booking_inspections")
    .insert({
      booking_id: bookingId,
      type: type,
      checklist_data: fillableChecklist, // Save the interactive JSON here!
      notes: "",
      // NEW: Pre-seed the images object with the correct blueprint background
      images: {
        blueprint_bg: blueprintUrl,
        markup_layer: null,
      },
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}
