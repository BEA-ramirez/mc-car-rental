import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;

  // extract query params
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const status = searchParams.get("status") || null; //filter

  //calculate range for pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("bookings")
    .select(
      `*, user: users!user_id(full_name, email, profile_picture_url, phone_number), car: cars!car_id(brand, model, plate_number, car_images(image_url, is_primary)), driver: drivers!driver_id(driver_id, user: users(full_name)))`,
    )
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .range(from, to);

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 },
    );
  }

  const formattedData = data.map((booking: any) => ({
    ...booking,
    car_image:
      booking.car?.car_images?.find((img: any) => img.is_primary)?.image_url ||
      booking.car?.car_images?.[0]?.image_url ||
      null,
  }));

  return NextResponse.json(formattedData);
}
