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

  // base query
  let query = supabase
    .from("cars")
    .select(
      "*, specifications:car_specifications!inner(*), images: car_images(*), car_features(features(*)), owner: car_owner(car_owner_id, business_name, users(full_name))",
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
    const cleanFeatures = row.car_features?.map((cf: any) => cf.features) || [];
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
  return {
    success: true,
    data: formattedData,
    nextPage: rawData?.length === PAGE_SIZE ? pageParam + 1 : null,
    message: null,
  };
}
