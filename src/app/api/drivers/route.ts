import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("drivers")
    .select(
      "*, profiles:users(full_name, first_name, last_name, email, phone_number, profile_picture_url, license_number, license_expiry_date)",
    )
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching drivers:", error);
    return NextResponse.json(
      { message: "Failed to fetch drivers from database." },
      { status: 500 },
    );
  }

  return NextResponse.json(data, { status: 200 });
}
