"use server";
import { createClient } from "@/utils/supabase/server";
import {
  completeCarSchema,
  CompleteCarType,
  CarSpecificationType,
  FeatureType,
  featureSchema,
} from "@/lib/schemas/car";

type ActionReponse = {
  success: boolean;
  message: string;
  car_id?: string;
};

export async function searchSpecifications(
  query: string = "",
): Promise<CarSpecificationType[]> {
  const supabase = await createClient();
  let dbQuery = supabase
    .from("car_specifications")
    .select("*")
    .eq("is_archived", false);

  // if query exists, filter by name
  if (query.trim()) {
    dbQuery = dbQuery.ilike("name", `%${query}%`);
  }

  const { data, error } = await dbQuery.order("name", { ascending: true });
  if (error) {
    console.error("Error searching specifications: ", error);
    return [];
  }

  return data || [];
}

export async function searchFeatures(
  query: string = "",
): Promise<FeatureType[]> {
  const supabase = await createClient();

  let dbQuery = supabase.from("features").select("*").eq("is_archived", false);

  if (query.trim()) {
    dbQuery = dbQuery.ilike("name", `%${query}%`);
  }

  const { data, error } = await dbQuery;
  if (error) {
    console.error("Error searching features: ", error);
    return [];
  }

  return data || [];
}

export async function saveUnit(data: CompleteCarType): Promise<ActionReponse> {
  const supabase = await createClient();

  //validate data
  const parsed = completeCarSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0].message,
    };
  }

  const { features, images, owner, specifications, car_id, ...carDetails } =
    parsed.data;

  let savedCarId = car_id;

  try {
    // 3. Call the RPC
    const { data: savedId, error } = await supabase.rpc("save_unit_v1", {
      p_car_id: car_id || null,
      p_car_owner_id: carDetails.car_owner_id,
      p_spec_id: carDetails.spec_id, // Ensure this ID is valid in car_specifications
      p_plate_number: carDetails.plate_number,
      p_brand: carDetails.brand,
      p_model: carDetails.model,
      p_year: carDetails.year,
      p_color: carDetails.color,
      p_vin: carDetails.vin || null,
      p_rental_rate_per_day: carDetails.rental_rate_per_day,
      p_availability_status: carDetails.availability_status,
      p_current_mileage: carDetails.current_mileage || 0,
      p_features: features || [], // Pass the array of features
      p_images: images || [], // Pass the array of images
    });

    if (error) throw new Error(error.message);

    return {
      success: true,
      message: car_id
        ? "Unit updated successfully"
        : "Unit created successfully",
      car_id: savedId,
    };
  } catch (error: any) {
    console.error("Save unit error: ", error);
    return {
      success: false,
      message: error.message || "An unexpected error occurred",
    };
  }
}

export async function getUnitById(carId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cars")
    .select(
      "*, specifications: car_specifications(*), features: car_features(feature: features(*)), images: car_images(*), owner: car_owner(*)",
    )
    .eq("car_id", carId)
    .single();

  if (error || !data) return null;

  const flattenedFeatures = data.features.map((f: any) => f.feature);
  return {
    ...data,
    features: flattenedFeatures,
    images: data.images,
    specifications: data.specifications,
    owner: data.owner,
  };
}

export async function deleteUnit(carId: string): Promise<ActionReponse> {
  const supabase = await createClient();
  try {
    const { error } = await supabase.rpc("delete_unit_v1", {
      p_car_id: carId,
    });

    if (error) throw new Error(error.message);

    return { success: true, message: "Unit deleted successfully" };
  } catch (error) {
    console.error("Archive error: ", error);
    return { success: false, message: "Failed to delete unit" };
  }
}
