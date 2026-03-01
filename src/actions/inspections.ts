"use server";

import { createClient } from "@/utils/supabase/server";
import { getInspectionTemplate } from "@/actions/settings";

export async function generateInspectionForBooking(
  bookingId: string,
  type: "Pre-trip" | "Post-trip",
) {
  const supabase = await createClient();

  // 1. Fetch the master template from Settings
  const masterTemplate = await getInspectionTemplate();

  if (!masterTemplate || masterTemplate.length === 0) {
    throw new Error(
      "No inspection template found in settings. Please configure one first.",
    );
  }

  // 2. Transform the template into a "Fillable Form" for the staff
  // We add 'status', 'notes', and 'photoUrl' to every single item.
  const fillableChecklist = masterTemplate.map((category) => ({
    categoryId: category.id,
    categoryName: category.name,
    items: category.items.map((item) => ({
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
      images: [], // For general photos not tied to a specific item
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}
