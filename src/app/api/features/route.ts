import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("features")
    .select("*")
    .eq("is_archived", false)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching features:", error);
    return NextResponse.json(
      { message: "Failed to fetch features from database." },
      { status: 500 },
    );
  }
  return NextResponse.json(data, { status: 200 });
}
