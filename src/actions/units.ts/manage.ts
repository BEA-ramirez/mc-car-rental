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
    if (car_id) {
      //UPDATE
      const { error } = await supabase
        .from("cars")
        .update({ ...carDetails, last_updated_at: new Date().toISOString() })
        .eq("car_id", car_id);
      if (error) throw new Error(error.message);
    } else {
      //INSERT
      const { data: newCar, error } = await supabase
        .from("cars")
        .insert([{ ...carDetails, last_updated_at: new Date().toISOString() }])
        .select("car_id")
        .single();
      if (error) throw new Error(error.message);
      if (!newCar) throw new Error("Failed to create car record");
      savedCarId = newCar.car_id;
    }

    // to handle checkbox list, strategy: delete and insert
    if (savedCarId) {
      if (features && features.length >= 0) {
        //remove old links
        await supabase.from("car_features").delete().eq("car_id", savedCarId);
        //add new links
        if (features.length > 0) {
          const featureRows = features.map((f) => ({
            car_id: savedCarId,
            feature_id: f.feature_id,
          }));

          const { error: featError } = await supabase
            .from("car_features")
            .insert(featureRows);
          if (featError)
            throw new Error("Error saving features: " + featError.message);
        }
      }
    }

    if (images && images.length >= 0) {
      // remove old image records (metadata only)
      await supabase.from("car_images").delete().eq("car_id", savedCarId);

      // add new image records
      if (images.length > 0) {
        const imageRows = images.map((img) => ({
          car_id: savedCarId,
          image_url: img.image_url,
          storage_path: img.storage_path,
          is_primary: img.is_primary || false,
        }));

        const { error: imgError } = await supabase
          .from("car_images")
          .insert(imageRows);
        if (imgError)
          throw new Error("Error saving images: " + imgError.message);
      }
    }
    return {
      success: true,
      message: car_id
        ? "Unit updated successfully"
        : "Unit created successfully",
      car_id: savedCarId,
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
    const { error: carError } = await supabase
      .from("cars")
      .update({ is_archived: true })
      .eq("car_id", carId);
    if (carError) throw new Error(carError.message);

    await supabase
      .from("car_features")
      .update({ is_archived: true })
      .eq("car_id", carId);
    await supabase
      .from("car_images")
      .update({ is_archived: true })
      .eq("car_id", carId);

    return { success: true, message: "Unit deleted successfully" };
  } catch (error) {
    console.error("Archive error: ", error);
    return { success: false, message: "Failed to delete unit" };
  }
}
