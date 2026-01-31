import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: rawData, error } = await supabase
      .from("car_owner")
      .select(`*, users!inner(*)`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { messaege: "Failed to fetch fleet partners from database." },
        { status: 500 },
      );
    }

    const formattedData = (rawData || []).map((row: any) => {
      const { users, ...partnerData } = row;
      return {
        ...partnerData,
        ...users, // Now full_name, email, etc. are at the top level
        total_units: 0,
      };
    });

    return NextResponse.json({ fleetPartners: formattedData }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      {
        message: "An unexpected error occurred while fetching fleet partners.",
      },
      { status: 500 },
    );
  }
}
