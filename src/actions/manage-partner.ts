"use server";

import z from "zod";
import { carOwnerSchema } from "@/lib/schemas/car-owner";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

// define the state shape for useactionstate
export type ActionState = {
  message: string | null;
  errors?: Record<string, string[]>;
  success?: boolean;
};

export async function managePartner(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = Object.fromEntries(formData.entries());

  const processedData = {
    ...rawData,
    active_status: rawData.active_status === "true",
    revenue_share_percentage: Number(rawData.revenue_share_percentage),
  };

  const validateFields = carOwnerSchema
    .partial({ car_owner_id: true, created_at: true, last_updated_at: true })
    .safeParse(processedData);

  if (!validateFields.success) {
    return {
      success: false,
      message: "Please fix the errors below",
      errors: validateFields.error.flatten().fieldErrors,
    };
  }

  const { car_owner_id, ...dataToSave } = validateFields.data;
  const supabase = await createClient();

  try {
    if (car_owner_id) {
      // update
      const { error } = await supabase
        .from("car_owner")
        .update({ ...dataToSave, last_updated_at: new Date() })
        .eq("car_owner_id", car_owner_id);
      if (error) throw error;
      revalidatePath("/admin/fleet-partners");
      return { success: true, message: "Fleet partner updated successfully." };
    } else {
      // create
      if (!dataToSave.user_id) {
        return {
          success: false,
          message: "User is required for new fleet partner.",
        };
      }

      const { error } = await supabase
        .from("car_owner")
        .insert({
          ...dataToSave,
          created_at: new Date(),
          last_updated_at: new Date(),
        });
      if (error) throw error;
      revalidatePath("/admin/fleet-partners");
      return { success: true, message: "Fleet partner created successfully." };
    }
  } catch (error: any) {
    console.error("Error managing fleet partner:", error);
    return {
      success: false,
      message:
        error.message ||
        "An error occurred while saving the fleet partner. Please try again.",
    };
  }
}
