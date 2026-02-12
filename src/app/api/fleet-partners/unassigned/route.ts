import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  // 1. Fetch users who are already Car Owners
  const { data: existingPartners, error: partnersError } = await supabase
    .from("car_owner")
    .select("user_id")
    .eq("is_archived", false);

  // 2. Fetch users who are already Drivers
  const { data: existingDrivers, error: driversError } = await supabase
    .from("drivers")
    .select("user_id")
    .eq("is_archived", false);

  // Error handling for preliminary checks
  if (partnersError || driversError) {
    console.error(
      "Error fetching exclusion lists:",
      partnersError || driversError,
    );
    return NextResponse.json(
      { message: "Failed to fetch existing assignments." },
      { status: 500 },
    );
  }

  // 3. Combine all IDs that should be excluded
  // We use a Set to ensure unique IDs if someone happens to be in both tables
  const excludedIds = Array.from(
    new Set([
      ...(existingPartners?.map((p) => p.user_id) || []),
      ...(existingDrivers?.map((d) => d.user_id) || []),
    ]),
  );

  // 4. Build the query for "Available" Customers
  let query = supabase
    .from("users")
    .select("*")
    .eq("role", "customer")
    .eq("is_archived", false)
    .order("created_at", { ascending: true });

  // 5. Apply the exclusion filter if there are IDs to hide
  if (excludedIds.length > 0) {
    // Format: ("id1","id2","id3")
    const idList = `(${excludedIds.join(",")})`;
    query = query.not("user_id", "in", idList);
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
