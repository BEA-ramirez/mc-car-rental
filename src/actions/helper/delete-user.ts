"use server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function deleteUser(userId: string) {
  const supabaseAdmin = createAdminClient();

  try {
    // soft delete user
    const { error: dbError } = await supabaseAdmin
      .from("users")
      .update({ is_archived: true })
      .eq("user_id", userId);
    if (dbError) {
      console.error("Supabase Soft Delete Error:", dbError);
      return { success: false, message: "Failed to delete user." };
    }

    // ban user in supabase auth for 100 years
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { ban_duration: "876000h" },
    );

    if (authError) throw authError;

    revalidatePath("/admin/clients");
    return { success: true, message: "User deleted successfully." };
  } catch (error) {
    console.error("Unexpected error", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

export async function bulkDeleteUsers(userIds: string[]) {
  const supabaseAdmin = createAdminClient();
  try {
    const { error: dbError } = await supabaseAdmin
      .from("users")
      .update({ is_archived: true })
      .in("user_id", userIds);
    if (dbError) {
      console.error("Bulk delete error", dbError);
      return { success: false, message: "Failed to bulk delete users." };
    }

    // create array of delete promises
    const deletePromises = userIds.map((userId) =>
      supabaseAdmin.auth.admin.deleteUser(userId),
    );

    const results = await Promise.all(deletePromises);

    const failedDeletes = results.filter((result) => result.error !== null);
    if (failedDeletes.length > 0) {
      console.error("Some users failed to delete:", failedDeletes);
      return {
        success: false,
        message: `Failed to delete ${failedDeletes.length} users. Check logs.`,
      };
    }

    revalidatePath("/admin/clients");
    return {
      success: true,
      message: `${userIds.length} users deleted successfully.`,
    };
  } catch (error) {
    console.error("Unexpected error", error);
    return {
      success: false,
      message: "An unexpected error occurred during bulk deletion.",
    };
  }
}
