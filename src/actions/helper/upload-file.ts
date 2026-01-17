import { createAdminClient } from "@/utils/supabase/admin";

export async function uploadFile(
  file: File,
  bucket: string,
  folder: string,
  userId: string
): Promise<string | null> {
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

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Upload helper failed", error);
    return null;
  }
}
