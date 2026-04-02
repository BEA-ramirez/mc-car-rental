import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  try {
    // Fetch drivers and all their associated documents
    const { data: drivers, error } = await supabase
      .from("drivers")
      .select(
        `
          *, 
          profiles:users (
            full_name, 
            first_name, 
            last_name, 
            email, 
            phone_number, 
            profile_picture_url, 
            license_number, 
            documents (*)
          )
        `,
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

    // Post-process the data to attach ONLY the latest documents
    const processedDrivers = drivers.map((driver: any) => {
      const documents = driver.profiles?.documents || [];

      // Filter documents by category
      const licenses = documents.filter(
        (doc: any) => doc.category === "license_id",
      );
      const validIds = documents.filter(
        (doc: any) => doc.category === "valid_id",
      );

      // Sort descending by created_at and grab the first one
      const latestLicense =
        licenses.sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )[0] || null;

      const latestValidId =
        validIds.sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )[0] || null;

      // Return the cleaned driver object
      return {
        ...driver,
        profiles: {
          ...driver.profiles,
          documents: undefined, // Remove the full docs array
          latest_license: latestLicense,
          latest_valid_id: latestValidId,
        },
      };
    });

    console.log("processedDrivers:", processedDrivers);
    return NextResponse.json(processedDrivers, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
