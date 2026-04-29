"use server";

import { createClient } from "@/utils/supabase/server";

// fetch only pending documents (Action required inbox)
export async function getPendingDocuments() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("documents")
      .select(`*, users!user_id (full_name, email, phone_number, trust_score)`)
      .eq("status", "PENDING")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching documents:", error);
      return { succes: false, data: [], message: error.message };
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

    return { success: true, data: formattedData || [], message: null };
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
      .eq("status", "VERIFIED")
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

// Helper to generate public URLs dynamically
async function getPublicUrl(path: string) {
  const supabase = await createClient();
  const { data } = supabase.storage.from("documents").getPublicUrl(path);
  return data.publicUrl;
}

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

    // Category Filter
    if (filters?.category && filters.category !== "all") {
      query = query.eq("category", filters.category);
    }

    // Status Filter
    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    // File Type Filter
    if (filters?.file_type && filters.file_type !== "all") {
      query = query.ilike("file_type", `%${filters.file_type}%`);
    }

    // Dynamic Search (Customer Name, Email, or File Name)
    if (search) {
      const { data: matchingUsers } = await supabase
        .from("users")
        .select("user_id")
        .or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);

      const matchingUserIds = matchingUsers?.map((u) => u.user_id) || [];
      let orString = `file_name.ilike.%${search}%`;

      if (matchingUserIds.length > 0) {
        const idString = matchingUserIds.map((id) => `"${id}"`).join(",");
        orString += `,user_id.in.(${idString})`;
      }
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
        // BUG FIX: Changed users!user_id to users!conducted_by
        `*, users!conducted_by(full_name), bookings!booking_id(cars!car_id(brand, model, plate_number))`,
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
