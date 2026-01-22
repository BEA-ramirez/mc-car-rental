"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updatePartnerStatus(
  carOwnerId: string,
  userId: string,
  action: "approve" | "reject",
  rejectionReason?: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();

  try {
    if (action === "approve") {
      // Update car owner table
      const { error: ownerError } = await supabase
        .from("car_owner")
        .update({
          verification_status: "verified",
          active_status: true,
          last_updated_at: new Date(),
        })
        .eq("car_owner_id", carOwnerId);

      if (ownerError) {
        console.error("Error updating car owner:", ownerError);
        return { success: false, message: "Failed to approve the partner." };
      }

      // Update user table
      const { error: userError } = await supabase
        .from("users")
        .update({ role: "car_owner", last_updated_at: new Date() })
        .eq("user_id", userId);

      if (userError) {
        console.error("Error upgrading user role:", userError);
        return { success: false, message: "Failed to upgrade user role." };
      }

      revalidatePath("/admin/fleet-partners");
      return { success: true, message: "Partner approved successfully." };
    } else if (action === "reject") {
      // Update status to rejected
      const { error: ownerError } = await supabase
        .from("car_owner")
        .update({
          verification_status: "rejected",
          active_status: false,
          owner_notes: rejectionReason
            ? `REJECTED: ${rejectionReason}`
            : undefined,
          last_updated_at: new Date(),
        })
        .eq("car_owner_id", carOwnerId);

      if (ownerError) {
        console.error("Error rejecting partner:", ownerError);
        return { success: false, message: "Failed to reject the partner." };
      }

      revalidatePath("/admin/fleet-partners");
      return { success: true, message: "Partner rejected successfully." };
    }

    // Fallback if action is neither (shouldn't happen due to types, but good for safety)
    return { success: false, message: "Invalid action." };
  } catch (error: any) {
    console.error("Error updating partner status:", error);
    return {
      success: false,
      message: "An error occurred while updating partner status.",
    };
  }
}
