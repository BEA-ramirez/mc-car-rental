"use server";

import z from "zod";
import { userSchema } from "@/lib/schemas/user";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { uploadFile } from "./helper/upload-file";

const emptyStringToUndefined = (val: unknown) => (val === "" ? undefined : val);

//extend existing user schema for password field
const manageUserSchema = userSchema
  .extend({
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." })
      .optional(),
  })
  .partial({
    user_id: true, // Not present when creating new
    first_name: true, // Not present if form only sends 'full_name'
    last_name: true, // Not present if form only sends 'full_name'
    created_at: true,
    last_updated_at: true,
  });

export type ActionState = {
  message: string | null;
  errors?: Record<string, string[]>;
  success?: boolean;
};

export async function manageUser(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = Object.fromEntries(formData.entries());

  // Separate Files from Text Data
  const profilePicFile = formData.get("profile_picture_url") as File;
  const validIdFile = formData.get("valid_id_url") as File;
  const licenseFile = formData.get("license_id_url") as File;

  const processedData = {
    ...rawData,
    phone_number: rawData.phone_number === "" ? null : rawData.phone_number,
    address: rawData.address === "" ? null : rawData.address,
  };
  console.log(processedData);

  //validate the form data
  const validateFields = manageUserSchema.safeParse(processedData);

  if (!validateFields.success) {
    return {
      success: false,
      message: "Please fix the errors below",
      errors: validateFields.error.flatten().fieldErrors,
    };
  }

  // separate the password and id from the rest of the data, also email (cannot edit email)
  const { user_id, password, email, ...profileData } = validateFields.data;

  try {
    const supabaseAdmin = createAdminClient();
    // edit existing user

    if (user_id && user_id.length > 5) {
      let profile_picture_url = undefined;
      let valid_id_url = undefined;
      let license_id_url = undefined;

      if (profilePicFile && profilePicFile.size > 0) {
        profile_picture_url = await uploadFile(
          profilePicFile,
          "avatars",
          "profiles",
          user_id
        );
      }

      if (validIdFile && validIdFile.size > 0) {
        valid_id_url = await uploadFile(
          validIdFile,
          "documents",
          "valid_ids",
          user_id
        );
      }

      if (licenseFile && licenseFile.size > 0) {
        license_id_url = await uploadFile(
          licenseFile,
          "documents",
          "license_ids",
          user_id
        );
      }

      const updateData: any = {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        full_name: profileData.full_name,
        role: profileData.role,
        phone_number: profileData.phone_number,
        address: profileData.address,
        last_updated_at: new Date().toISOString(),
      };

      // only overwrite urls if a new file is uploaded
      if (profile_picture_url)
        updateData.profile_picture_url = profile_picture_url;
      if (valid_id_url) updateData.valid_id_url = valid_id_url;
      if (license_id_url) updateData.license_id_url = license_id_url;

      const { error } = await supabaseAdmin
        .from("users")
        .update(updateData)
        .eq("user_id", user_id);

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }
      revalidatePath("/admin/clients");
      return { success: true, message: "User updated successfully" };
    } else {
      // Manual check: Password is required for NEW users
      if (!password) {
        return {
          success: false,
          message: "Password is required for new users.",
          errors: { password: ["Required"] },
        };
      }

      const { data: authUser, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true, // auto confirm so they can log in right away
          user_metadata: {
            full_name: profileData.full_name,
            role: profileData.role,
          },
        });
      if (authError) throw authError;

      const newUserId = authUser.user.id; //new user

      //upload files using the new user id
      let profile_picture_url = null;
      let valid_id_url = null;
      let license_id_url = null;

      if (profilePicFile && profilePicFile.size > 0) {
        profile_picture_url = await uploadFile(
          profilePicFile,
          "avatars",
          "profiles",
          newUserId
        );
      }
      if (validIdFile && validIdFile.size > 0) {
        valid_id_url = await uploadFile(
          validIdFile,
          "documents",
          "valid_ids",
          newUserId
        );
      }
      if (licenseFile && licenseFile.size > 0) {
        license_id_url = await uploadFile(
          licenseFile,
          "documents",
          "license_ids",
          newUserId
        );
      }

      // we update the user db table with additional profile data
      if (authUser.user) {
        const { error: dbError } = await supabaseAdmin
          .from("users")
          .update({
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            full_name: profileData.full_name,
            phone_number: profileData.phone_number,
            role: profileData.role,
            address: profileData.address,
            profile_picture_url: profile_picture_url,
            valid_id_url: valid_id_url,
            license_id_url: license_id_url,
            created_at: new Date(),
            last_updated_at: new Date(),
          })
          .eq("user_id", newUserId);

        if (dbError) {
          console.error("Supabase insert error:", dbError);
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
      message: "An error occurred while managing the user. Please try again.",
    };
  }
}
