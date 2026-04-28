"use server";
import { createClient } from "@/utils/supabase/server";
import {
  completeCarSchema,
  CompleteCarType,
  CarSpecificationType,
  FeatureType,
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

  const parsed = completeCarSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  // Properly destructure owner and specifications out so they don't get passed to RPC
  const { features, images, owner, specifications, car_id, ...carDetails } =
    parsed.data;

  try {
    const { data: savedId, error } = await supabase.rpc("save_unit_v1", {
      p_car_id: car_id || null,
      p_car_owner_id: carDetails.car_owner_id,
      p_spec_id: carDetails.spec_id,
      p_plate_number: carDetails.plate_number,
      p_brand: carDetails.brand,
      p_model: carDetails.model,
      p_year: carDetails.year,
      p_color: carDetails.color,
      p_vin: carDetails.vin || null,
      p_rental_rate_per_day: carDetails.rental_rate_per_day,
      p_rental_rate_per_12h: (carDetails as any).rental_rate_per_12h || 0,
      p_default_buffer_hours: (carDetails as any).default_buffer_hours || 12, // <--- ADDED
      p_availability_status: carDetails.availability_status,
      p_current_mileage: carDetails.current_mileage || 0,
      p_features: features || [],
      p_images: images || [],
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
  } catch (error: any) {
    console.error("Archive error: ", error);

    // Return the specific error message from Postgres if it exists
    return {
      success: false,
      message: error.message || "Failed to delete unit",
    };
  }
}

export async function getCarDetailsAction(carId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_full_car_details", {
    p_car_id: carId,
  });

  if (error) {
    console.error("Error fetching car details:", error);
    return null;
  }

  // Parse the JSON string returned by the RPC function
  return data ? (typeof data === "string" ? JSON.parse(data) : data) : null;
}

interface FetchUnitsParams {
  pageParam: number;
  limit?: number;
  search?: string;
  type?: string;
  ownerId?: string;
}

export async function getInfiniteUnits({
  pageParam = 1,
  limit = 12,
  search = "",
  type = "All",
  ownerId = "All",
}: FetchUnitsParams) {
  const supabase = await createClient();

  const from = (pageParam - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("cars")
    .select(
      `*, specifications:car_specifications!inner(*), images: car_images(*), car_features(features(*)), owner: car_owner!inner(car_owner_id, business_name, users(full_name))`,
      { count: "exact" },
    )
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .range(from, to);

  // Apply Search
  if (search) {
    query = query.or(
      `plate_number.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%`,
    );
  }

  // Apply Type Filter
  if (type !== "All") {
    query = query.eq("specifications.body_type", type);
  }

  // Apply Owner Filter
  if (ownerId !== "All") {
    query = query.eq("car_owner_id", ownerId);
  }

  const { data: rawData, error, count } = await query;

  if (error) throw new Error(error.message);

  const formattedData = (rawData || []).map((row: any) => {
    const cleanFeatures = row.car_features.map((cf: any) => cf.features) || [];
    const cleanOwner = {
      car_owner_id: row.owner?.car_owner_id,
      business_name: row.owner?.business_name || "Unknown Business",
      full_name: row.owner?.users?.full_name || "Unknown Owner",
    };

    return {
      ...row,
      specifications: row.specifications || null,
      images: row.images || [],
      features: cleanFeatures,
      owner: cleanOwner,
    };
  });

  const hasNextPage = count ? from + limit < count : false;

  return {
    data: formattedData,
    nextCursor: hasNextPage ? pageParam + 1 : null,
  };
}
