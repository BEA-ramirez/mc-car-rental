"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function deleteUser(userId: string) {
  const supabaseAdmin = createAdminClient();

  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      console.error("Supabase Admin Delete Error:", error);
      return { success: false, message: "Failed to delete user." };
    }

    revalidatePath("/admin/clients");
    return { success: true, message: "User deleted successfully." };
  } catch (error) {
    console.error("Unexpected error", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}
