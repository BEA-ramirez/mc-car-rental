import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data: rawData, error } = await supabase
    .from("cars")
    .select(
      "*, specifications:car_specifications!spec_id (*), images: car_images (*), car_features(features(*)), owner: car_owner(car_owner_id, business_name, users(full_name))",
    )
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching units:", error);
    return NextResponse.json(
      { message: "Failed to fetch units from database." },
      { status: 500 },
    );
  }

  const formattedData = (rawData || []).map((row: any) => {
    // extract features
    const cleanFeatures = row.car_features.map((cf: any) => cf.features) || [];
    // flatten owner details
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

  return NextResponse.json(formattedData, { status: 200 });
}
