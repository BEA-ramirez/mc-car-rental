"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createPrerenderParamsForClientSegment } from "next/dist/server/app-render/entry-base";
import { uploadFile } from "@/actions/helper/upload-file";

export async function verifyDocumentAction(
  documentId: string,
  expiryDate?: Date,
) {
  const supabase = await createClient();
  const formattedDate = expiryDate
    ? expiryDate.toISOString().split("T")[0]
    : null;
  const { error } = await supabase.rpc("verify_document", {
    p_document_id: documentId,
    p_expiry_date: formattedDate,
  });

  if (error) throw new Error(error.message);
}

export async function rejectDocumentAction(documentId: string, reason: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("reject_document", {
    p_document_id: documentId,
    p_reason: reason,
  });
  if (error) throw new Error(error.message);
}

export async function revokeDocumentAction(documentId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("revoke_document", {
    p_document_id: documentId,
  });
  if (error) throw new Error(error.message);
}

export async function updateInternalNoteAction(
  documentId: string,
  note: string,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("documents")
    .update({ internal_notes: note, last_updated_at: new Date() })
    .eq("document_id", documentId);

  if (error) throw new Error(error.message);
}

// requires deleteing from both storage and db
export async function deleteDocumentAction(
  documentId: string,
  filePath?: string,
) {
  const supabase = await createClient();

  // 1. If we have a file path, delete the file from the storage bucket first
  if (filePath) {
    const { error: storageError } = await supabase.storage
      .from("documents") // Make sure this matches your bucket name
      .remove([filePath]);

    if (storageError) console.error("Storage delete error:", storageError);
  }

  // 2. Delete the database row
  const { error: dbError } = await supabase
    .from("documents")
    .delete()
    .eq("document_id", documentId);

  if (dbError) throw new Error(dbError.message);
}

export async function getCustomersForDropdown() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("user_id, full_name, email")
    .eq("role", "customer")
    .order("full_name");

  if (error) throw new Error(error.message);
  return data;
}

export async function getBookingsForDropdown() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("booking_id, start_date, end_date, cars(brand, model)")
    .order("created_at", { ascending: false })
    .limit(50); // Keep dropdown fast

  if (error) throw new Error(error.message);
  return data;
}

// --- ORCHESTRATOR: UPLOAD FILE & INSERT DB RECORD ---
export async function adminUploadDocumentAction(formData: FormData) {
  const supabase = await createClient();

  // 1. Extract form data
  const file = formData.get("file") as File;
  const customerId = formData.get("customerId") as string;
  const docType = formData.get("docType") as string; // 'DRIVER_LICENSE', etc.
  const bookingId = formData.get("bookingId") as string | null;
  const expiryDate = formData.get("expiryDate") as string | null;

  if (!file || !customerId || !docType)
    throw new Error("Missing required fields");

  // 2. Map the folder for Supabase Storage
  let folder = "other";
  if (docType === "DRIVER_LICENSE") folder = "license_ids";
  else if (docType === "GOVT_ID") folder = "valid_ids";
  else if (docType === "PROOF_OF_BILLING") folder = "invoices";
  else if (docType === "RENTAL_AGREEMENT") folder = "contracts";
  else if (docType === "DAMAGE_REPORT") folder = "inspections";

  // 3. Upload file to Supabase Storage
  const uploadResult = await uploadFile(file, "documents", folder, customerId);

  if (!uploadResult) {
    throw new Error("Failed to upload file to storage bucket.");
  }

  // 4. Insert into the correct database table based on exact schema
  if (docType === "RENTAL_AGREEMENT" && bookingId) {
    const { error } = await supabase.from("booking_contracts").insert({
      booking_id: bookingId,
      contract_pdf_url: uploadResult.url, // <-- Matches the new column we just added!
      is_signed: true,
      signed_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
  } else if (docType === "DAMAGE_REPORT" && bookingId) {
    const { error } = await supabase.from("booking_inspections").insert({
      booking_id: bookingId,
      type: "Post-trip",
      images: [{ label: "Manual Document Upload", url: uploadResult.url }], // JSONB matches schema
      notes: "Uploaded manually by administrator.",
    });
    if (error) throw new Error(error.message);
  } else {
    // Standard KYC Document
    const { error } = await supabase.from("documents").insert({
      user_id: customerId,
      category: docType, // <-- Directly uses 'DRIVER_LICENSE', 'GOVT_ID', etc. to match CHECK constraint
      file_name: file.name,
      file_path: uploadResult.path,
      status: "VERIFIED", // Schema allows 'VERIFIED' uppercase
      expiry_date: expiryDate ? new Date(expiryDate).toISOString() : null,
    });
    if (error) throw new Error(error.message);
  }

  return { success: true };
}

export async function updateInspectionChecklist(
  inspectionId: string,
  updatedChecklist: any,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("booking_inspections")
    .update({ checklist_data: updatedChecklist })
    .eq("inspection_id", inspectionId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function saveContractSignature(
  bookingId: string,
  signatureDataUrl: string,
) {
  const supabase = await createAdminClient();

  // 1. Convert the Base64 Data URL to a Buffer
  const base64Data = signatureDataUrl.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  const fileName = `signature-${bookingId}-${Date.now()}.png`;

  // 2. Upload to Supabase Storage
  // NOTE: Ensure you have a bucket named "documents" created in your Supabase dashboard!
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(`signatures/${fileName}`, buffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (uploadError)
    throw new Error("Failed to upload signature image: " + uploadError.message);

  // 3. Get the Public URL of the uploaded image
  const { data: publicUrlData } = supabase.storage
    .from("documents")
    .getPublicUrl(`signatures/${fileName}`);

  // 4. Update the Contract Row in the Database
  const { error: dbError } = await supabase
    .from("booking_contracts")
    .update({
      is_signed: true,
      signed_at: new Date().toISOString(),
      customer_signature_url: publicUrlData.publicUrl,
    })
    .eq("booking_id", bookingId);

  if (dbError) throw new Error(dbError.message);

  return { success: true };
}

export async function uploadInspectionPhotoAction(
  bookingId: string,
  formData: FormData,
) {
  const supabase = await createAdminClient();

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  // Create a unique file name
  const fileExt = file.name.split(".").pop() || "jpg";
  const fileName = `inspection-${bookingId}-${Date.now()}.${fileExt}`;

  // Upload to the documents bucket inside an 'inspections' folder
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(`inspections/${fileName}`, file, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    throw new Error("Failed to upload photo: " + uploadError.message);
  }

  // Return the public URL
  const { data: publicUrlData } = supabase.storage
    .from("documents")
    .getPublicUrl(`inspections/${fileName}`);

  return { success: true, url: publicUrlData.publicUrl };
}
