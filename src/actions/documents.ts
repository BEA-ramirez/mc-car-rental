"use server";

import { createClient } from "@/utils/supabase/server";
import { getPublicUrl } from "./helper/upload-file";

// fetch all the kyc docs for the main table
export async function getKYCDocuments(
  page: number = 1,
  search: string = "",
  filters?: {
    category?: string;
    file_type?: string;
    status?: string;
  },
) {
  try {
    const supabase = await createClient();
    const pageSize = 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("documents")
      .select(
        `*, users!user_id (full_name, email, phone_number, trust_score)`,
        { count: "exact" },
      )
      .order("created_at", { ascending: false });

    if (filters?.category && filters.category !== "all") {
      query = query.eq("category", filters.category);
    }

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters?.file_type && filters.file_type !== "all") {
      query = query.ilike("file_type", `%${filters.file_type}%`);
    }

    if (search) {
      // find users
      const { data: matchingUsers } = await supabase
        .from("users")
        .select("user_id")
        .or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);

      const matchingUserIds = matchingUsers?.map((u) => u.user_id) || [];

      // Build the dynamic OR string for the documents table
      let orString = `file_name.ilike.%${search}%`;

      if (matchingUserIds.length > 0) {
        // If found users, append them to the OR condition
        // Wrap UUIDs in quotes to ensure PostgREST parses them correctly
        const idString = matchingUserIds.map((id) => `"${id}"`).join(",");
        orString += `,user_id.in.(${idString})`;
      }
      // Apply the final OR condition
      query = query.or(orString);
    }

    const { data, count, error } = await query.range(from, to);

    if (error) {
      console.error("Error fetching documents:", error);
      return { success: false, data: [], message: error.message };
    }

    const formattedData = await Promise.all(
      data.map(async (doc: any) => {
        const url = await getPublicUrl(doc.file_path);
        return {
          ...doc,
          file_url: url,
        };
      }),
    );

    return { success: true, data: formattedData || [], count, message: null };
  } catch (error) {
    console.error("Unexpected fetch error:", error);
    return {
      success: false,
      data: [],
      message: "An unexpected error occurred.",
    };
  }
}

// fetch only pending documents (Action required inbox)
export async function getPendingDocuments() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("documents")
      .select(`*, users!user_id (full_name, email, phone_number, trust_score)`)
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching documents:", error);
      return { succes: false, data: [], message: error.message };
    }
    return { success: true, data: data || [], message: null };
  } catch (error: any) {
    console.error("Unexpected fetch error:", error);
    return {
      success: false,
      data: [],
      message: error.message || "An unexpected error occurred.",
    };
  }
}

// fetch verified documents expiring in the next 30 days
export async function getExpiringDocuments() {
  try {
    const supabase = await createClient();

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { data, error } = await supabase
      .from("documents")
      .select(`*, users!user_id (full_name, email)`)
      .eq("status", "verified")
      .not("expiry_date", "is", null)
      .lte("expiry_date", thirtyDaysFromNow.toISOString())
      .gte("expiry_date", new Date().toISOString())
      .order("expiry_date", { ascending: true });

    if (error) {
      console.error("Error fetching expiring docs: ", error);
      return { success: false, data: [], message: error.message };
    }
    return { success: true, data: data || [], message: null };
  } catch (error: any) {
    console.error("Unexpected fetch error:", error);
    return {
      success: false,
      data: [],
      message: error.message || "An unexpected error occurred.",
    };
  }
}

// fetch contracts (joined with bookings, users, cars)
export async function getContracts() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("booking_contracts")
      .select(
        `
        *,
        bookings (
          start_date,
          end_date,
          users ( full_name, email ),
          cars ( brand, model, plate_number )
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching contracts:", error);
      return { success: false, data: [], message: error.message };
    }
    return { success: true, data: data || [], message: null };
  } catch (error) {
    console.error("Unexpected fetch error:", error);
    return {
      success: false,
      data: [],
      message: "An unexpected error occurred.",
    };
  }
}

export async function getInspections() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("booking_inspections")
      .select(
        `*, users!user_id(full_name), bookings!booking_id(cars!car_id(brand, model, plate_number))`,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching inspections: ", error);
      return { success: false, data: [], message: error.message };
    }
    return { success: true, data: data || [], message: null };
  } catch (error) {
    console.error("Unexpected fetch error:", error);
    return {
      success: false,
      data: [],
      message: "An unexpected error occurred.",
    };
  }
}
