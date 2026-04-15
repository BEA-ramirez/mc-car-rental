"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export type SystemRole =
  | "customer"
  | "driver"
  | "car_owner"
  | "staff"
  | "admin";

export async function upgradeUserRole(
  userId: string,
  newRole: SystemRole,
  additionalData?: { businessName?: string }, // Needed if upgrading to car_owner
) {
  const supabaseAdmin = createAdminClient();

  try {
    // 1. Update the public.users table
    const { error: userError } = await supabaseAdmin
      .from("users")
      .update({
        role: newRole,
        last_updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (userError)
      throw new Error(
        `Failed to update public user profile: ${userError.message}`,
      );

    // 2. Auto-generate the necessary operational records based on the new role
    if (newRole === "driver") {
      // Check if they already have a driver profile (in case of a previous downgrade/upgrade)
      const { data: existingDriver } = await supabaseAdmin
        .from("drivers")
        .select("driver_id")
        .eq("user_id", userId)
        .single();

      if (!existingDriver) {
        const { error: driverError } = await supabaseAdmin
          .from("drivers")
          .insert({ user_id: userId, driver_status: "AVAILABLE" });

        if (driverError)
          throw new Error(
            `Failed to create driver profile: ${driverError.message}`,
          );
      }
    } else if (newRole === "car_owner") {
      const { data: existingOwner } = await supabaseAdmin
        .from("car_owner")
        .select("car_owner_id")
        .eq("user_id", userId)
        .single();

      if (!existingOwner) {
        const { error: ownerError } = await supabaseAdmin
          .from("car_owner")
          .insert({
            user_id: userId,
            business_name:
              additionalData?.businessName || "Pending Business Name",
            revenue_share_percentage: 70, // Default standard split, can be adjusted
          });

        if (ownerError)
          throw new Error(
            `Failed to create car owner profile: ${ownerError.message}`,
          );
      }
    }

    // 3. THE MAGIC STEP: Update Auth Metadata
    // This bakes the new role into their JWT token for RLS policies
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        app_metadata: { role: newRole },
      },
    );

    if (authError)
      throw new Error(
        `Failed to update auth permissions: ${authError.message}`,
      );

    // 4. Log the administrative action
    await supabaseAdmin.from("user_activity_logs").insert({
      user_id: userId,
      action_type: "ROLE_UPGRADED",
      description: `User role was upgraded to ${newRole.toUpperCase()}.`,
    });

    // Refresh your admin user list UI
    revalidatePath("/admin/users");

    return {
      success: true,
      message: `User successfully upgraded to ${newRole}!`,
    };
  } catch (error: any) {
    console.error("Role upgrade failed:", error);
    return {
      success: false,
      message:
        error.message || "An unexpected error occurred during the upgrade.",
    };
  }
}
