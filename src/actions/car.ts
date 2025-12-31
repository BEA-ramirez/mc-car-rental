"use server";

import { createClient } from "@/utils/supabase/server";
import { insertCarSchema } from "@/lib/schemas/car";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createCar(prevState: any, formData: FormData) {
  // --- STEP 1: Validate Text Fields with Zod ---
  // We extract the text data first to check if it's valid before uploading any images
  const validatedFields = insertCarSchema.safeParse({
    model: formData.get("model"),
    plate_number: formData.get("plate_number"),
    price_per_day: formData.get("price_per_day"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please check your inputs.",
    };
  }

  const supabase = await createClient();
  let image_url = null;

  // --- STEP 2: Handle Image Upload (If a file was selected) ---
  const imageFile = formData.get("image") as File;

  if (imageFile && imageFile.size > 0) {
    // 1. Create a unique file name (e.g., "123456789-toyota-vios.png")
    // Use the plate number or timestamp to ensure uniqueness
    const fileName = `${Date.now()}-${validatedFields.data.plate_number.replace(
      /\s/g,
      ""
    )}`;

    // 2. Upload to Supabase Storage (Bucket: 'fleet')
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("fleet")
      .upload(fileName, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { message: "Image Upload Failed: " + uploadError.message };
    }

    // 3. Get the Public URL so we can save it to the database
    const { data: publicUrlData } = supabase.storage
      .from("fleet")
      .getPublicUrl(fileName);

    image_url = publicUrlData.publicUrl;
  }

  // --- STEP 3: Insert Data into Database ---
  const { error: dbError } = await supabase.from("cars").insert({
    ...validatedFields.data, // Spread the validated text fields (model, price, etc.)
    image_url: image_url, // Add the image URL we just created
  });

  if (dbError) {
    // Handle Duplicate Plate Number
    if (dbError.code === "23505") {
      return { message: "This plate number already exists." };
    }
    return { message: "Database Error: " + dbError.message };
  }

  // --- STEP 4: Finish Up ---
  // Refresh the fleet list page so the new car shows up immediately
  revalidatePath("/admin/cars");

  // Redirect back to the dashboard
  redirect("/admin/cars");
}
