"use server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { success } from "zod";

export async function deleteUser(userId: string) {
  const supabaseAdmin = createAdminClient();

  try {
    const { error } = await supabaseAdmin
      .from("users")
      .update({ is_archived: true })
      .eq("user_id", userId);
    if (error) {
      console.error("Supabase Soft Delete Error:", error);
      return { success: false, message: "Failed to delete user." };
    }

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
    const { error } = await supabaseAdmin
      .from("users")
      .update({ is_archived: true })
      .in("user_id", userIds);
    if (error) {
      console.error("Bulk delete error", error);
      return { success: false, message: "Failed to bulk delete users." };
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
