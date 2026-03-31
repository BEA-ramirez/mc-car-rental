"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { uploadFile } from "./helper/upload-file"; // Your existing helper

export async function getCustomerProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Unauthorized");

  // Fetch the user and their associated documents
  const { data, error } = await supabase
    .from("users")
    .select(
      `
      *,
      documents ( document_id, category, file_name, file_path, status, created_at )
    `,
    )
    .eq("user_id", user.id)
    .single();

  if (error) throw error;
  console.log("Users: ", data);
  return data;
}

export async function updateCustomerDetails(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const firstName = formData.get("first_name") as string;
  const lastName = formData.get("last_name") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;

  const fullName = `${firstName} ${lastName}`.trim();

  const { error } = await supabase
    .from("users")
    .update({
      full_name: fullName,
      first_name: firstName,
      last_name: lastName,
      phone_number: phone,
      address: address,
      last_updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath("/customer/profile");
  return { success: true, message: "Profile updated successfully!" };
}

export async function uploadCustomerDocument(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  const category = formData.get("category") as "license_id" | "valid_id";

  if (!file || file.size === 0) throw new Error("No file provided.");

  // Use the existing upload helper
  const folderName = category === "license_id" ? "license_ids" : "valid_ids";
  const uploadResult = await uploadFile(file, "documents", folderName, user.id);

  if (!uploadResult) throw new Error("Failed to upload document to storage.");

  // Create the record in documents table
  const { error: docError } = await supabase.from("documents").insert({
    user_id: user.id,
    category: category,
    file_name: file.name,
    file_path: uploadResult.path,
    file_type: file.type || "application/octet-stream",
    status: "pending",
    created_at: new Date().toISOString(),
  });

  if (docError) throw docError;

  revalidatePath("/customer/profile");
  return { success: true, message: "Document submitted for verification!" };
}
