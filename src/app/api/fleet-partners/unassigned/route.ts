import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // The database securely filters out anyone who is already a driver or owner
    const { data: availableUsers, error } = await supabase.rpc(
      "get_unassigned_customers",
    );

    if (error) {
      console.error("Error fetching available users:", error);
      return NextResponse.json(
        { message: "Failed to fetch available users from database." },
        { status: 500 },
      );
    }

    return NextResponse.json(availableUsers || [], { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
