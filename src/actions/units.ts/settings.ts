"use server";

import { createClient } from "@/utils/supabase/server";
import {
  FeatureType,
  featureSchema,
  carSpecificationSchema,
  CarSpecificationType,
} from "@/lib/schemas/car";
import z from "zod";

export type ActionResponse = {
  success: boolean;
  message: string;
};

export type SaveSpecResponse = ActionResponse & {
  spec_id?: string; // Optional because it might not exist on error
};

// FEATURE ACTIONS
export async function saveFeature(data: FeatureType): Promise<ActionResponse> {
  const supabase = await createClient();
  const parsed = featureSchema.safeParse(data);

  if (!parsed.success)
    return { success: false, message: "Invalid feature data." };

  const { feature_id, ...payload } = parsed.data;

  let query;
  try {
    if (feature_id) {
      query = supabase
        .from("features")
        .update({ ...payload, last_updated_at: new Date().toISOString() })
        .eq("feature_id", feature_id);
    } else {
      query = supabase
        .from("features")
        .insert([{ ...payload, last_updated_at: new Date().toISOString() }]);
    }

    const { error } = await query;
    if (error)
      return {
        success: false,
        message: "Database error while saving feature.",
      };
    return { success: true, message: "Feature saved successfully." };
  } catch (error) {
    console.error("Error saving feature:", error);
    return {
      success: false,
      message: "An unexpected error occurred while saving feature.",
    };
  }
}

export async function deleteFeature(
  featureId: string,
): Promise<ActionResponse> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("features")
    .update({ is_archived: true })
    .eq("feature_id", featureId);
  if (error)
    return { success: false, message: "Failed to archive the feature." };
  return { success: true, message: "Feature archived successfully." };
}

// CAR SPECIFICATION ACTIONS

export async function saveSpecification(
  data: CarSpecificationType,
): Promise<SaveSpecResponse> {
  const supabase = await createClient();
  const parsed = carSpecificationSchema.safeParse(data);

  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Invalid data";
    throw new Error(`Validation Error: ${errorMsg}`);
  }

  const { spec_id, ...payload } = parsed.data;

  let query;
  if (spec_id) {
    query = supabase
      .from("car_specifications")
      .update(payload)
      .eq("spec_id", spec_id)
      .select("spec_id")
      .single();
  } else {
    query = supabase
      .from("car_specifications")
      .insert([payload])
      .select("spec_id")
      .single();
  }

  const { data: resultData, error } = await query;
  if (error) {
    console.error("Database Error:", error.message);
    throw new Error(error.message || "Database error saving specification");
    return {
      success: false,
      message: "Database error while saving specification",
    };
  }

  if (!resultData) {
    throw new Error("Operation failed: No data returned (Check RLS policies).");
  }
  //return spec_id for frontend to insert
  return {
    success: true,
    message: "Specification saved successfully.",
    spec_id: spec_id || resultData?.spec_id,
  };
}

export async function deleteSpecification(
  specId: string,
): Promise<ActionResponse> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("car_specifications")
    .update({ is_archived: true })
    .eq("spec_id", specId);
  if (error)
    return { success: false, message: "Failed to archive the specification." };
  return { success: true, message: "Specification archived successfully." };
}
