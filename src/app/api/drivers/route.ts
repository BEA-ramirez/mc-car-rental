import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc(
      "get_verified_drivers_with_docs",
    );

    if (error) {
      console.error("Error fetching drivers:", error);
      return NextResponse.json(
        { message: "Failed to fetch drivers." },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
