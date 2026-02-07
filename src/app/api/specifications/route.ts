import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("car_specifications")
    .select("*")
    .eq("is_archived", false)
    .order("created_at", { ascending: true });

  if (error)
    return NextResponse.json(
      { message: "Failed to fetch specifications from database." },
      { status: 500 },
    );

  return NextResponse.json(data, { status: 200 });
}
