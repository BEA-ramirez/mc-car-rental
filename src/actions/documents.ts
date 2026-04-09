"use server";

import { createClient } from "@/utils/supabase/server";
import { getPublicUrl } from "./helper/upload-file";

// fetch all the kyc docs for the main table
export async function getKYCDocuments() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("documents")
      .select(`*, users!user_id (full_name, email, phone_number, trust_score)`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching documents:", error);
      return { succes: false, data: [], message: error.message };
    }

    const formattedData = data.map((doc: any) => {
      return {
        ...doc,
        file_url: getPublicUrl(doc.file_path),
      };
    });

    return { success: true, data: formattedData || [], message: null };
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
