"use server";

import { createClient } from "@/utils/supabase/server";
import { FilterState } from "@/components/customer/fleet-filters";

const PAGE_SIZE = 9;

export async function getCustomerFleet(
  pageParam: number = 0,
  filters: FilterState,
) {
  const supabase = await createClient();

  // calculate the range
  const from = pageParam * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // base query - explicitly ask for junction table and features table
  let query = supabase
    .from("cars")
    .select(
      `
      *, 
      specifications:car_specifications!inner(*), 
      images: car_images(*), 
      car_features(
        is_archived,
        features(*)
      ), 
      owner: car_owner(car_owner_id, business_name, users(full_name))
      `,
    )
    .eq("is_archived", false);

  // apply filters
  if (filters.search) {
    query = query.or(
      `brand.ilike.%${filters.search}%,model.ilike.%${filters.search}%`,
    );
  }

  if (filters.type && filters.type !== "All") {
    query = query.eq("car_specifications.body_type", filters.type);
  }

  if (filters.transmission && filters.transmission !== "Any") {
    query = query.ilike(
      "car_specifications.transmission",
      `%${filters.transmission}%`,
    );
  }

  if (filters.minSeating !== null) {
    query = query.gte(
      "car_specifications.passenger_capacity",
      filters.minSeating,
    );
  }

  if (filters.maxPrice !== null) {
    query = query.lte("rental_rate_per_day", filters.maxPrice);
  }

  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data: rawData, error } = await query;

  if (error) {
    console.error("Error fetching customer fleet:", error);
    return { success: false, data: [], message: error.message };
  }

  const formattedData = (rawData || []).map((row: any) => {
    // 1. SAFELY MAP AND FILTER FEATURES
    // Ensure the junction isn't archived, the feature exists, and the feature isn't archived
    const cleanFeatures = (row.car_features || [])
      .filter(
        (cf: any) =>
          cf.is_archived === false &&
          cf.features &&
          cf.features.is_archived === false,
      )
      .map((cf: any) => cf.features);

    // 2. SAFELY FILTER IMAGES
    const cleanImages = (row.images || []).filter(
      (img: any) => img.is_archived === false,
    );

    const cleanOwner = {
      car_owner_id: row.owner?.car_owner_id,
      business_name: row.owner?.business_name || "Unknown Business",
      full_name: row.owner?.users?.full_name || "Unknown Owner",
    };

    return {
      ...row,
      specifications: row.specifications || null,
      images: cleanImages, // Using filtered images
      features: cleanFeatures, // Using filtered & mapped features
      owner: cleanOwner,
    };
  });

  return {
    success: true,
    data: formattedData,
    nextPage: rawData?.length === PAGE_SIZE ? pageParam + 1 : null,
    message: null,
  };
}
