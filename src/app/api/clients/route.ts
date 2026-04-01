import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getPublicUrl } from "@/actions/helper/upload-file";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Grab all parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const statusParam = searchParams.get("status") || "";
    const roleParam = searchParams.get("role") || "";
    const isExport = searchParams.get("export") === "true";

    // Base Query with joined documents
    let query = supabase
      .from("users")
      .select("*, documents(*)", { count: "exact" })
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    // Apply Search
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply Array Filters
    if (statusParam) {
      const statuses = statusParam.split(",");
      query = query.in("account_status", statuses);
    }

    if (roleParam) {
      const roles = roleParam.split(",");
      query = query.in("role", roles);
    }

    // Apply Pagination (Skip if Exporting)
    if (!isExport) {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
    }

    // Execute query
    const { data, count, error } = await query;

    if (error) throw error;

    // Flatten the data & fetch URLs
    const formattedUsers = await Promise.all(
      (data || []).map(async (user) => {
        const licenseDoc = user.documents?.find(
          (d: any) => d.category === "license_id",
        );
        const validIdDoc = user.documents?.find(
          (d: any) => d.category === "valid_id",
        );

        const flattenedUser = {
          ...user,
          license_document_id: licenseDoc?.document_id || "",
          license_expiry_date: licenseDoc?.expiry_date || "",
          license_id_url: licenseDoc?.file_path
            ? await getPublicUrl(licenseDoc.file_path)
            : "",

          valid_id_document_id: validIdDoc?.document_id || "",
          valid_id_expiry_date: validIdDoc?.expiry_date || "",
          valid_id_url: validIdDoc?.file_path
            ? await getPublicUrl(validIdDoc.file_path)
            : "",
        };

        delete flattenedUser.documents;
        return flattenedUser;
      }),
    );

    // Return formatted users + pagination calcs
    return NextResponse.json(
      {
        users: formattedUsers,
        totalCount: count || 0,
        totalPages: isExport ? 1 : Math.ceil((count || 0) / limit),
        currentPage: isExport ? 1 : page,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Failed to fetch clients:", error);
    return NextResponse.json(
      { error: error.message || "Error fetching users" },
      { status: 500 },
    );
  }
}
