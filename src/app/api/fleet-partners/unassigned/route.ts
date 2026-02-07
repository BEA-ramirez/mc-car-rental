import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data: existingPartners, error: partnersError } = await supabase
    .from("car_owner")
    .select("user_id")
    .eq("is_archived", false);

  if (partnersError) {
    console.error("Error fetching existing partners:", partnersError);
    return NextResponse.json(
      { message: "Failed to fetch existing partners from database." },
      { status: 500 },
    );
  }

  const assignedUserIds = existingPartners?.map((p) => p.user_id) || [];

  let query = supabase
    .from("users")
    .select("*")
    .eq("role", "customer")
    .eq("is_archived", false)
    .order("created_at", { ascending: true });

  if (assignedUserIds.length > 0) {
    query = query.not("user_id", "in", `(${assignedUserIds.join(",")})`);
  }

  const { data: availableUsers, error: usersError } = await query;
  if (usersError) {
    console.error("Error fetching available users:", usersError);
    return NextResponse.json(
      { message: "Failed to fetch available users from database." },
      { status: 500 },
    );
  }

  return NextResponse.json(availableUsers, { status: 200 });
}
