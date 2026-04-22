"use server";

import z from "zod";
import { baseClientSchema } from "@/lib/schemas/client";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { uploadFile, deleteDocumentRecord } from "./helper/upload-file";
import {
  sendVerificationEmail,
  sendRejectionEmail,
  sendCustomEmail,
} from "./helper/mail";

type ActionState = {
  message: string | null;
  errors?: Record<string, string[]>;
  success?: boolean;
};

export async function sendCustomEmailAction(
  userId: string,
  subject: string,
  body: string,
) {
  try {
    const supabaseAdmin = createAdminClient();

    // Fetch user details to get their email address
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("email, full_name")
      .eq("user_id", userId)
      .single();

    if (fetchError || !user?.email) {
      console.error("Error fetching user for custom email:", fetchError);
      return {
        success: false,
        message: "Failed to fetch user details for email.",
      };
    }

    // Send the custom email
    await sendCustomEmail(
      user.email,
      user.full_name || "Applicant",
      subject,
      body,
    );

    return { success: true, message: "Message sent successfully!" };
  } catch (error: any) {
    console.error("Custom email error:", error);
    return {
      success: false,
      message: error.message || "Failed to send the message.",
    };
  }
}

const serverManageUserSchema = baseClientSchema.extend({
  user_id: z.string().optional(),
  trust_score: z.coerce.number().min(0).max(5),
  is_archived: z.preprocess((val) => val === "true", z.boolean()),
  license_expiry_date: z.string().optional().nullable(),
  valid_id_expiry_date: z.string().optional().nullable(),
});

function extractFormData(formData: FormData) {
  const fields: Record<string, any> = {};
  const files: Record<string, File> = {};

  formData.forEach((value, key) => {
    if (value instanceof File) {
      if (value.size > 0) files[key] = value;
    } else {
      fields[key] = value === "" ? undefined : value;
    }
  });
  return { fields, files };
}

async function createDocumentRecord(
  supabase: any,
  userId: string,
  file: File,
  category: "valid_id" | "license_id",
  filePath: string,
  expiryDate?: string | null,
) {
  const validExpiry = expiryDate || null;

  const { error } = await supabase.from("documents").insert({
    user_id: userId,
    category: category,
    file_name: file.name,
    file_path: filePath,
    file_type: file.type || "application/octet-stream",
    status: "PENDING",
    expiry_date: validExpiry,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error(`Error creating ${category} document:`, error);
    throw error;
  }
}

async function processDocumentUpload(
  supabase: any,
  userId: string,
  file: File | undefined,
  folder: string,
  category: "valid_id" | "license_id",
  expiryDate?: string | null,
) {
  if (!file) return;

  const uploadResult = await uploadFile(file, "documents", folder, userId);
  if (uploadResult) {
    await createDocumentRecord(
      supabase,
      userId,
      file,
      category,
      uploadResult.path,
      expiryDate,
    );
  }
}

export async function createClientAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const rawData = extractFormData(formData);
  const validateFields = serverManageUserSchema.safeParse(rawData.fields);

  if (!validateFields.success) {
    return {
      success: false,
      message: "Please fix errors",
      errors: validateFields.error.flatten().fieldErrors,
    };
  }

  const {
    password,
    email,
    valid_id_expiry_date,
    license_expiry_date,
    license_id_url: _license_id_url,
    valid_id_url: _valid_id_url,
    ...profileData
  } = validateFields.data;

  if (!password) {
    return {
      success: false,
      message: "Password is required for new users.",
      errors: { password: ["Required"] },
    };
  }

  const supabaseAdmin = createAdminClient();
  let newUserId: string | null = null;

  try {
    const full_name =
      `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim();

    // 1. Auth Creation (FIXED FOR DB TRIGGER)
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email!,
        password: password,
        email_confirm: true,
        user_metadata: {
          ...profileData, // <-- This passes first_name, last_name, role, etc. to satisfy your trigger!
          full_name,
        },
      });

    if (authError) throw authError;
    newUserId = authUser.user.id;

    // Post-Creation Operations (Wrapped for Rollback)
    try {
      // --- NEW: Sync Auth Metadata for RLS ---
      await supabaseAdmin.auth.admin.updateUserById(newUserId, {
        app_metadata: { role: profileData.role },
      });

      // Avatar Upload
      let profile_picture_url = undefined;
      if (rawData.files.profile_picture_url) {
        const avatarResult = await uploadFile(
          rawData.files.profile_picture_url,
          "avatars",
          "profiles",
          newUserId,
        );
        profile_picture_url = avatarResult?.url;
      }

      // Document Uploads
      await processDocumentUpload(
        supabaseAdmin,
        newUserId,
        rawData.files.valid_id_url,
        "valid_ids",
        "valid_id",
        valid_id_expiry_date,
      );
      await processDocumentUpload(
        supabaseAdmin,
        newUserId,
        rawData.files.license_id_url,
        "license_ids",
        "license_id",
        license_expiry_date,
      );

      // Master User Record Update
      const updateData: any = {
        ...profileData,
        full_name,
        last_updated_at: new Date().toISOString(),
      };
      if (profile_picture_url)
        updateData.profile_picture_url = profile_picture_url;
      if (email) updateData.email = email;

      const { error: dbError } = await supabaseAdmin
        .from("users")
        .update(updateData)
        .eq("user_id", newUserId);

      if (dbError) throw dbError;
    } catch (innerError: any) {
      // ORPHAN CLEANUP ROLLBACK
      console.error(
        "Profile setup failed, rolling back auth creation...",
        innerError,
      );
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      throw new Error(
        "Failed to upload files or save profile. User creation was rolled back.",
      );
    }

    revalidatePath("/admin/clients");
    return { success: true, message: "New user created successfully" };
  } catch (error: any) {
    console.error("Error creating user:", error);
    return { success: false, message: error.message || "An error occurred." };
  }
}

export async function updateClientAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const rawData = extractFormData(formData);
  const validateFields = serverManageUserSchema.safeParse(rawData.fields);

  if (!validateFields.success) {
    return {
      success: false,
      message: "Please fix errors",
      errors: validateFields.error.flatten().fieldErrors,
    };
  }

  const {
    user_id,
    password: _password,
    email,
    valid_id_expiry_date,
    license_expiry_date,
    license_id_url: _license_id_url,
    valid_id_url: _valid_id_url,
    ...profileData
  } = validateFields.data;

  if (!user_id) return { success: false, message: "Missing User ID" };

  try {
    const supabaseAdmin = createAdminClient();
    const full_name =
      `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim();

    // Avatar Replacement
    let profile_picture_url = undefined;
    if (rawData.files.profile_picture_url) {
      const avatarResult = await uploadFile(
        rawData.files.profile_picture_url,
        "avatars",
        "profiles",
        user_id,
      );
      profile_picture_url = avatarResult?.url;
    }

    // Process New Documents (if attached)
    await processDocumentUpload(
      supabaseAdmin,
      user_id,
      rawData.files.valid_id_url,
      "valid_ids",
      "valid_id",
      valid_id_expiry_date,
    );
    await processDocumentUpload(
      supabaseAdmin,
      user_id,
      rawData.files.license_id_url,
      "license_ids",
      "license_id",
      license_expiry_date,
    );

    // Cleanup Deleted Documents
    const deleteDocs = formData.get("deleted_documents");
    if (deleteDocs) {
      const parsedDocs = JSON.parse(deleteDocs as string);
      if (Array.isArray(parsedDocs)) {
        await Promise.all(
          parsedDocs.map(
            async (docId: string) => await deleteDocumentRecord(docId),
          ),
        );
      }
    }

    // Perform Atomic Database Transaction via RPC
    const { error: rpcError } = await supabaseAdmin.rpc("sync_client_profile", {
      p_user_id: user_id,
      p_first_name: profileData.first_name || null,
      p_last_name: profileData.last_name || null,
      p_full_name: full_name,
      p_email: email || null,
      p_role: profileData.role,
      p_phone_number: profileData.phone_number || null,
      p_address: profileData.address || null,
      p_license_number: profileData.license_number || null,
      p_trust_score: profileData.trust_score,
      p_profile_picture_url: profile_picture_url || null,
      p_license_expiry: license_expiry_date || null,
      p_valid_id_expiry: valid_id_expiry_date || null,
    });

    if (rpcError) {
      console.error("Error syncing client profile:", rpcError);
      return {
        success: false,
        message: "Failed to update user profile.",
      };
    }

    // --- NEW: Sync Auth Metadata for RLS ---
    await supabaseAdmin.auth.admin.updateUserById(user_id, {
      app_metadata: { role: profileData.role },
      user_metadata: { role: profileData.role }, // Keep user_metadata matching
    });

    revalidatePath("/admin/clients");
    return { success: true, message: "User updated successfully" };
  } catch (error: any) {
    console.error("Error updating user:", error);
    return { success: false, message: error.message || "An error occurred." };
  }
}

export async function verifyApplicantAction(
  userId: string,
  licenseExpiry: string,
  validIdExpiry: string,
) {
  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin.rpc("verify_applicant", {
      p_user_id: userId,
      p_license_expiry: licenseExpiry || null,
      p_valid_id_expiry: validIdExpiry || null,
    });
    if (error) {
      console.error("Customer Verification error:", error);
      return {
        success: false,
        message: "Failed to verify applicant.",
      };
    }

    const user = data?.[0];
    if (user?.email && user.email.trim() !== "") {
      try {
        await sendVerificationEmail(user.email, user.full_name || "Applicant");
      } catch (mailError) {
        console.error("Email failed, but user was verified:", mailError);
      }
    }

    revalidatePath("/admin/clients");
    return { success: true, message: "Applicant verified successfully!" };
  } catch (error: any) {
    console.error("Verification error:", error);
    return {
      success: false,
      message: error.message || "Failed to verify applicant.",
    };
  }
}

export async function rejectApplicantAction(
  userId: string,
  reason: string,
  rejectLicense: boolean,
  rejectValidId: boolean,
) {
  try {
    const supabaseAdmin = createAdminClient();

    // Pass the boolean flags to the database
    const { data, error } = await supabaseAdmin.rpc("reject_applicant", {
      p_user_id: userId,
      p_reason: reason,
      p_reject_license: rejectLicense,
      p_reject_valid_id: rejectValidId,
    });

    if (error) {
      console.error("Customer Rejection error:", error);
      return {
        success: false,
        message: "Failed to reject applicant.",
      };
    }

    const user = data?.[0];
    if (user?.email && user.email.trim() !== "") {
      try {
        await sendRejectionEmail(
          data.email,
          data.full_name,
          reason,
          rejectLicense,
          rejectValidId,
        );
      } catch (mailError) {
        console.error("Email failed, but user was rejected:", mailError);
      }
    }

    revalidatePath("/admin/clients");
    return { success: true, message: "Applicant rejected and notified." };
  } catch (error: any) {
    console.error("Rejection error:", error);
    return {
      success: false,
      message: error.message || "Failed to reject applicant.",
    };
  }
}

export async function getClientsKpiAction() {
  try {
    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin.rpc("get_clients_kpi");

    if (error) {
      console.error("Failed to fetch KPIs:", error);
      return {
        success: false,
        data: null,
        message: "Failed to fetch KPIs.",
      };
    }

    return { success: true, data: data?.[0] };
  } catch (error: any) {
    console.error("Failed to fetch KPIs:", error);
    return { success: false, data: null, message: error.message };
  }
}
