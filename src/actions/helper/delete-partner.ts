"use server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin"; // <-- Required for Auth Sync
import { revalidatePath } from "next/cache";

export async function deletePartner(carOwnerId: string, userId: string) {
  try {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    // Optional but Recommended:
    // You may want to check if any of their cars are currently in an 'ACTIVE' booking
    // before allowing the archive to proceed to prevent stranding a customer!

    // 1. Archive the Partner
    const { error: carOwnerError } = await supabase
      .from("car_owner")
      .update({
        is_archived: true,
        active_status: false,
        last_updated_at: new Date().toISOString(), // Use ISOString for Supabase
      })
      .eq("car_owner_id", carOwnerId);

    if (carOwnerError) {
      console.error("Error archiving car owner:", carOwnerError);
      return { success: false, message: "Failed to archive the partner." };
    }

    // 2. Cascade Archive to their Fleet (CRITICAL)
    // Pull all of their cars offline so they don't show up in the booking calendar
    const { error: carsError } = await supabase
      .from("cars")
      .update({
        is_archived: true,
        availability_status: "Maintenance", // Or 'Unavailable'
        last_updated_at: new Date().toISOString(),
      })
      .eq("car_owner_id", carOwnerId);

    if (carsError) {
      console.error("Error archiving partner's cars:", carsError);
      // We don't return false here since the partner was archived, but we should log it.
    }

    // 3. Downgrade the Public User Role
    const { error: userError } = await supabase
      .from("users")
      .update({
        role: "customer",
        last_updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (userError) {
      console.error("Error downgrading user role:", userError);
      return {
        success: false,
        message: "Partner archived, but failed to downgrade user role.",
      };
    }

    // 4. Sync the Supabase Auth Metadata (YOUR FIX)
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        app_metadata: { role: "customer" },
        user_metadata: { role: "customer" },
      },
    );

    if (authError) {
      console.error("Failed to update auth metadata:", authError);
    }

    revalidatePath("/admin/fleet-partners");
    // You should also revalidate the units/cars path since you just modified fleet data!
    revalidatePath("/admin/units");

    return {
      success: true,
      message: "Partner and their fleet archived successfully.",
    };
  } catch (error) {
    console.error("Error archiving partner:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}
