"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deletePartner(carOwnerId: string, userId: string) {
  const supabase = await createClient();
  try {
    const { error: carOwnerError } = await supabase
      .from("car_owner")
      .update({
        is_archived: true,
        active_status: false,
        last_updated_at: new Date(),
      })
      .eq("car_owner_id", carOwnerId);

    if (carOwnerError) {
      console.error("Error archiving car owner:", carOwnerError);
      return { success: false, message: "Failed to archive the partner." };
    }

    const { error: userError } = await supabase
      .from("users")
      .update({ role: "customer", last_updated_at: new Date() })
      .eq("user_id", userId);

    if (userError) {
      console.error("Error downgrading user role:", userError);
      return {
        success: false,
        message: "Partner archived, but failed to downgrade user role.",
      };
    }

    revalidatePath("/admin/fleet-partners");
    return { success: true, message: "Partner archived successfully." };
  } catch (error) {
    console.error("Error archiving partner:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}
