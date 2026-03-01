"use server";

import { createClient } from "@/utils/supabase/server";

// fetch all the kyc docs for the main table
export async function getKYCDocuments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select(`*, users!user_id (full_name, email, phone_number, trust_score)`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching documents:", error);
    throw new Error(error.message);
  }
  return data;
}

// fetch only pending documents (Action required inbox)
export async function getPendingDocuments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select(`*, users!user_id (full_name, email, phone_number, trust_score)`)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching documents:", error);
    throw new Error(error.message);
  }
  return data;
}

// fetch verified documents expiring in the next 30 days
export async function getExpiringDocuments() {
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
    throw new Error(error.message);
  }
  return data;
}

// fetch contracts (joined with bookings, users, cars)
export async function getContracts() {
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
    throw new Error(error.message);
  }
  return data;
}

export async function getInspections() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("booking_inspections")
    .select(
      `*, users!user_id(full_name), bookings!booking_id(cars!car_id(brand, model, plate_number))`,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching inspections: ", error);
    throw new Error(error.message);
  }
  return data;
}
