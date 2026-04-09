"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { uploadFile } from "@/actions/helper/upload-file";
import { deleteFileFromStorage } from "@/actions/helper/upload-file";

export async function verifyDocumentAction(
  documentId: string,
  expiryDate?: Date,
) {
  try {
    const supabase = await createClient();
    const formattedDate = expiryDate
      ? expiryDate.toISOString().split("T")[0]
      : null;
    const { error } = await supabase.rpc("verify_document", {
      p_document_id: documentId,
      p_expiry_date: formattedDate,
    });

    if (error) {
      console.log(error.message);
      return { success: false, message: "Failed to verify document." };
    }
    return { success: true, message: "Document verified successfully!" };
  } catch (error: any) {
    console.log("Unexpected error in verifyDocumentAction", error.message);
    return { success: false, message: error.message };
  }
}

export async function rejectDocumentAction(documentId: string, reason: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("reject_document", {
      p_document_id: documentId,
      p_reason: reason,
    });
    if (error) {
      console.error("Error in rejectDocumentAction", error.message);
      return {
        success: false,
        message: "Failed to reject document.",
      };
    }
    return { succes: true, message: "Document rejected successfully!" };
  } catch (error: any) {
    console.error("Unexpected error in rejectDocumentAction", error.message);
    return {
      success: false,
      message: "An unexpected error occurred.",
    };
  }
}

export async function revokeDocumentAction(documentId: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("revoke_document", {
      p_document_id: documentId,
    });
    if (error) {
      console.error("Error in revokeDocumentAction", error.message);
      return {
        success: false,
        message: "Failed to revoke document approval.",
      };
    }
    return { success: true, message: "Document approval revoked." };
  } catch (error) {
    console.error("Unexpected error in revokeDocumentAction", error);
    return {
      success: false,
      message: "An unexpected error occurred.",
    };
  }
}

export async function updateInternalNoteAction(
  documentId: string,
  note: string,
) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("documents")
      .update({ internal_notes: note, last_updated_at: new Date() })
      .eq("document_id", documentId);

    if (error) {
      console.error(error.message);
      return { success: false, messsage: "Failed to update internal note." };
    }
    return { success: true, message: "Internal note updated successfully." };
  } catch (error: any) {
    console.error(
      "Unexpected error in updateInternalNoteAction",
      error.message,
    );
    return { success: false, message: error.message };
  }
}

// requires deleteing from both storage and db
export async function deleteDocumentAction(documentId: string) {
  try {
    const supabase = await createClient();

    // Get the file path directly from the DB
    const { data: doc, error: fetchError } = await supabase
      .from("documents")
      .select("file_path")
      .eq("document_id", documentId)
      .single();

    if (fetchError || !doc) {
      return {
        success: false,
        message: "Document not found or already deleted.",
      };
    }

    // Delete the database record
    const { error: dbError } = await supabase
      .from("documents")
      .delete()
      .eq("document_id", documentId);

    if (dbError) {
      return { success: false, message: dbError.message };
    }

    await deleteFileFromStorage("documents", doc.file_path);

    return { success: true, message: "Document permanently deleted." };
  } catch (error: any) {
    console.error("Delete Action Error:", error);
    return {
      success: false,
      message: error.message || "An unexpected error occurred.",
    };
  }
}

export async function getAllUsersForDropdown() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("user_id, full_name, email")
    .eq("is_archived", false)
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

// upload file and insert db record
export async function adminUploadDocumentAction(formData: FormData) {
  const supabase = await createClient();

  // Extract form data
  const file = formData.get("file") as File;
  const customerId = formData.get("customerId") as string;
  const docCategory = formData.get("docCategory") as string;
  const status = formData.get("status") as string;
  const expiryDate = formData.get("expiryDate") as string | null;
  const internalNotes = formData.get("internal_notes") as string | null;

  if (!file || !customerId || !docCategory || !status) {
    return { success: false, message: "Missing required fields." };
  }

  // map the folder based on supabase bucket
  let folder = "other";
  if (docCategory === "license_id") folder = "license_ids";
  else if (docCategory === "valid_id") folder = "valid_ids";
  else if (docCategory === "other") folder = "others";

  // upload file to supabase storage
  const uploadResult = await uploadFile(file, "documents", folder, customerId);

  if (!uploadResult) {
    return { success: false, message: "Failed to upload file." };
  }

  // insert doc record to db
  const { error } = await supabase.from("documents").insert({
    user_id: customerId,
    category: docCategory,
    file_name: file.name,
    file_path: uploadResult.path,
    file_type: file.type || "application/octet-stream", // good practice to store mime-type
    status: status,
    internal_notes: internalNotes || null,
    expiry_date: expiryDate ? new Date(expiryDate).toISOString() : null,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Document uploaded successfully." };
}

export async function adminUpdateDocumentAction(formData: FormData) {
  try {
    const supabase = await createClient();

    const documentId = formData.get("documentId") as string;
    const file = formData.get("file") as File | null;
    const customerId = formData.get("customerId") as string;
    const docCategory = formData.get("docCategory") as string;
    const status = formData.get("status") as string;
    const expiryDate = formData.get("expiryDate") as string | null;
    const internalNotes = formData.get("internal_notes") as string | null;

    if (!documentId) {
      return {
        success: false,
        message: "Document ID is required for updating.",
      };
    }

    // Base payload with metadata
    const dbPayload: any = {
      category: docCategory,
      status: status,
      internal_notes: internalNotes || null,
      expiry_date: expiryDate ? new Date(expiryDate).toISOString() : null,
    };

    // If a new file was uploaded, process it and add to payload
    if (file && file.size > 0) {
      let folder = "other";
      if (docCategory === "license_id") folder = "license_ids";
      else if (docCategory === "valid_id") folder = "valid_ids";
      else if (docCategory === "other") folder = "others";

      const uploadResult = await uploadFile(
        file,
        "documents",
        folder,
        customerId,
      );
      if (!uploadResult) {
        return { success: false, message: "Failed to upload new file." };
      }

      dbPayload.file_name = file.name;
      dbPayload.file_path = uploadResult.path;
      dbPayload.file_type = file.type || "application/octet-stream";
    }

    // Update DB Record
    const { error } = await supabase
      .from("documents")
      .update(dbPayload)
      .eq("document_id", documentId);

    if (error) return { success: false, message: error.message };
    return { success: true, message: "Document updated successfully." };
  } catch (error: any) {
    console.error("Update Action Error:", error);
    return {
      success: false,
      message: error.message || "An unexpected error occurred.",
    };
  }
}

export async function updateInspectionChecklist(
  inspectionId: string,
  updatedChecklist: any,
) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("booking_inspections")
      .update({ checklist_data: updatedChecklist })
      .eq("inspection_id", inspectionId);

    if (error) {
      console.error("Failed to update inspection checklist:", error);
      return {
        success: false,
        message: "Failed to update inspection checklist.",
      };
    }
    return {
      success: true,
      message: "Inspection checklist updated successfully.",
    };
  } catch (error) {
    console.error("Unexpected error in updateInspectionChecklist:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

export async function saveContractSignature(
  bookingId: string,
  signatureDataUrl: string,
) {
  try {
    const supabase = createAdminClient();

    // Convert the Base64 Data URL to a Buffer
    const base64Data = signatureDataUrl.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const fileName = `signature-${bookingId}-${Date.now()}.png`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(`signatures/${fileName}`, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Failed to upload signature", uploadError.message);
      return { success: false, message: "Failed to upload signature." };
    }

    // Get the Public URL of the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from("documents")
      .getPublicUrl(`signatures/${fileName}`);

    // Update the Contract Row in the Database
    const { error: dbError } = await supabase
      .from("booking_contracts")
      .update({
        is_signed: true,
        signed_at: new Date().toISOString(),
        customer_signature_url: publicUrlData.publicUrl,
      })
      .eq("booking_id", bookingId);

    if (dbError) {
      console.error(
        "Failed to create booking contract record",
        dbError.message,
      );
      return {
        success: false,
        message: "Failed to create booking contract record.",
      };
    }

    return { success: true, message: "Contract signed successfully!" };
  } catch (error) {
    console.error("Unexpected error in saveContractSignature", error);
    return {
      success: false,
      message: "An unexpected error occurred.",
    };
  }
}

export async function uploadInspectionPhotoAction(
  bookingId: string,
  formData: FormData,
) {
  try {
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
      console.error("Failed to upload inspection photo", uploadError.message);
      return {
        success: false,
        message: "Failed to upload inspection photo.",
      };
    }

    // Return the public URL
    const { data: publicUrlData } = supabase.storage
      .from("documents")
      .getPublicUrl(`inspections/${fileName}`);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      message: "Inspection photo uploaded successfully!",
    };
  } catch (error) {
    console.error("Unexpected error in uploadInspectionPhotoAction", error);
    return {
      success: false,
      message: "An unexpected error occurred.",
    };
  }
}
