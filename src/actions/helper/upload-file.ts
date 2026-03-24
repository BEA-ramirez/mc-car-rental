"use server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

type ActionState = {
  message: string | null;
  errors?: string;
  success?: boolean;
};

type UploadResult = {
  url: string;
  path: string;
};

export async function uploadFile(
  file: File,
  bucket: string,
  folder: string,
  userId: string,
): Promise<UploadResult | null> {
  try {
    if (!file || file.size === 0) return null;

    const supabaseAdmin = createAdminClient();
    const fileExt = file.name.split(".").pop();
    // Create unique file name: folder/userID/timestamp-random.ext

    const filePath = `${folder}/${userId}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true, // overwrite if same name exists
      });

    if (uploadError) {
      console.error(`Error uploading to ${bucket}:`, uploadError);
      throw uploadError;
    }

    // get public url
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      url: publicUrlData.publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error("Upload helper failed", error);
    return null;
  }
}

export async function deleteFileFromStorage(
  bucket: string,
  path: string,
): Promise<ActionState> {
  const supabaseAdmin = createAdminClient();
  try {
    const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
    if (error) throw error;
    return { success: true, message: "File deleted successfully" };
  } catch (error) {
    console.error("Delete from storage failed", error);
    return { success: false, message: "Failed to delete file" };
  }
}

export async function deleteDocumentRecord(
  documentId: string,
): Promise<ActionState> {
  const supabaseAdmin = createAdminClient();
  try {
    const { data, error: docError } = await supabaseAdmin
      .from("documents")
      .select("file_path")
      .eq("document_id", documentId)
      .single();

    if (docError) throw docError;

    await deleteFileFromStorage("documents", data.file_path);

    const { error: delError } = await supabaseAdmin
      .from("documents")
      .delete()
      .eq("document_id", documentId);
    if (delError) throw delError;

    return { success: true, message: "Document record deleted successfully" };
  } catch (error) {
    console.error("Delete document record failed", error);
    return { success: false, message: "Failed to delete document record" };
  }
}

export async function getPublicUrl(path: string | undefined | null) {
  const supabase = await createClient();
  if (!path) return null;
  const { data } = supabase.storage.from("documents").getPublicUrl(path);
  return data.publicUrl;
}
