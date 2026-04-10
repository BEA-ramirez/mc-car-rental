import { createClient } from "@/utils/supabase/server";

export async function getUsers(): Promise<any[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching users:", error);
    return [];
  }
  return data;
}

export async function getUserById(userId: string): Promise<any | null> {
  const supabase = await createClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
  return user;
}
