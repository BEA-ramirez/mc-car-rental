"use server";

import z from "zod";
import { userSchema } from "@/lib/schemas/user";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { uploadFile } from "./helper/upload-file";

// 1. Extend Schema
const manageUserSchema = userSchema
  .extend({
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." })
      .optional(),
    valid_id_expiry_date: z.coerce.date().optional().nullable(),
  })
  .partial({
    user_id: true,
    first_name: true,
    last_name: true,
    created_at: true,
    last_updated_at: true,
  });

export type ActionState = {
  message: string | null;
  errors?: Record<string, string[]>;
  success?: boolean;
};

// Helper: Create Document DB Record
async function createDocumentRecord(
  supabase: any,
  userId: string,
  file: File,
  category: "valid_id" | "license_id",
  filePath: string,
  expiryDate?: Date | null,
) {
  const validExpiry = expiryDate ? new Date(expiryDate).toISOString() : null;

  const { error } = await supabase.from("documents").insert({
    user_id: userId,
    category: category,
    file_name: file.name,
    file_path: filePath, // This must be a string, not null
    status: "pending",
    expiry_date: validExpiry,
    created_at: new Date(),
  });

  if (error) {
    console.error(`Error creating ${category} document:`, error);
    throw error;
  }
}

export async function manageUser(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const rawData = Object.fromEntries(formData.entries());

  // Files
  const profilePicFile = formData.get("profile_picture_url") as File;
  const validIdFile = formData.get("valid_id_url") as File;
  const licenseFile = formData.get("license_id_url") as File;

  // Clean Data
  const processedData = {
    ...rawData,
    phone_number: rawData.phone_number === "" ? null : rawData.phone_number,
    address: rawData.address === "" ? null : rawData.address,
    license_number:
      rawData.license_number === "" ? null : rawData.license_number,
    license_expiry_date: rawData.license_expiry_date
      ? new Date(rawData.license_expiry_date as string)
      : null,
    valid_id_expiry_date: rawData.valid_id_expiry_date
      ? new Date(rawData.valid_id_expiry_date as string)
      : null,
    trust_score: rawData.trust_score ? Number(rawData.trust_score) : 5.0,
  };

  delete (processedData as any).profile_picture_url;
  delete (processedData as any).valid_id_url;
  delete (processedData as any).license_id_url;

  // Validate
  const validateFields = manageUserSchema.safeParse(processedData);

  if (!validateFields.success) {
    return {
      success: false,
      message: "Please fix the errors below",
      errors: validateFields.error.flatten().fieldErrors,
    };
  }

  const { user_id, password, email, valid_id_expiry_date, ...profileData } =
    validateFields.data;

  try {
    const supabaseAdmin = createAdminClient();

    // ==========================================================
    // CASE A: UPDATE EXISTING USER
    // ==========================================================
    if (user_id && user_id.length > 5) {
      // 1. Avatar
      let profile_picture_url = undefined;
      if (profilePicFile && profilePicFile.size > 0) {
        // We use || undefined here because uploadFile returns string | null
        // and 'undefined' tells Supabase to ignore the field during update
        profile_picture_url =
          (await uploadFile(profilePicFile, "avatars", "profiles", user_id)) ||
          undefined;
      }

      // 2. Document: Valid ID
      if (validIdFile && validIdFile.size > 0) {
        const url = await uploadFile(
          validIdFile,
          "documents",
          "valid_ids",
          user_id,
        );
        if (url) {
          // Only create record if upload succeeded
          await createDocumentRecord(
            supabaseAdmin,
            user_id,
            validIdFile,
            "valid_id",
            url,
            valid_id_expiry_date,
          );
        }
      }

      // 3. Document: License
      if (licenseFile && licenseFile.size > 0) {
        const url = await uploadFile(
          licenseFile,
          "documents",
          "license_ids",
          user_id,
        );
        if (url) {
          // <--- SAFETY CHECK
          await createDocumentRecord(
            supabaseAdmin,
            user_id,
            licenseFile,
            "license_id",
            url,
            profileData.license_expiry_date,
          );
        }
      }

      // 4. Update User Table
      const updateData: any = {
        ...profileData,
        last_updated_at: new Date().toISOString(),
      };

      if (profile_picture_url)
        updateData.profile_picture_url = profile_picture_url;

      const { error } = await supabaseAdmin
        .from("users")
        .update(updateData)
        .eq("user_id", user_id);

      if (error) throw error;

      revalidatePath("/admin/clients");
      return { success: true, message: "User updated successfully" };
    }

    // ==========================================================
    // CASE B: CREATE NEW USER
    // ==========================================================
    else {
      if (!password) {
        return {
          success: false,
          message: "Password is required.",
          errors: { password: ["Required"] },
        };
      }

      const { data: authUser, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true,
          user_metadata: {
            full_name: profileData.full_name,
            role: profileData.role,
          },
        });
      if (authError) throw authError;

      const newUserId = authUser.user.id;
      let profile_picture_url = null;

      if (profilePicFile && profilePicFile.size > 0) {
        profile_picture_url = await uploadFile(
          profilePicFile,
          "avatars",
          "profiles",
          newUserId,
        );
      }

      // Valid ID
      if (validIdFile && validIdFile.size > 0) {
        const url = await uploadFile(
          validIdFile,
          "documents",
          "valid_ids",
          newUserId,
        );
        if (url) {
          await createDocumentRecord(
            supabaseAdmin,
            newUserId,
            validIdFile,
            "valid_id",
            url,
            valid_id_expiry_date,
          );
        }
      }

      // License
      if (licenseFile && licenseFile.size > 0) {
        const url = await uploadFile(
          licenseFile,
          "documents",
          "license_ids",
          newUserId,
        );
        if (url) {
          await createDocumentRecord(
            supabaseAdmin,
            newUserId,
            licenseFile,
            "license_id",
            url,
            profileData.license_expiry_date,
          );
        }
      }

      // Update User Row
      if (authUser.user) {
        const { error: dbError } = await supabaseAdmin
          .from("users")
          .update({
            ...profileData,
            profile_picture_url: profile_picture_url,
            created_at: new Date(),
            last_updated_at: new Date(),
          })
          .eq("user_id", newUserId);

        if (dbError) {
          await supabaseAdmin.auth.admin.deleteUser(newUserId);
          throw dbError;
        }
      }

      revalidatePath("/admin/clients");
      return {
        success: true,
        message: "New user account created successfully.",
      };
    }
  } catch (error: any) {
    console.error("Error managing user:", error);
    return {
      success: false,
      message: "An error occurred while managing the user.",
    };
  }
}
