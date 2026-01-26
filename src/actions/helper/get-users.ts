import { createClient } from "@/utils/supabase/server";
import { UserType } from "@/lib/schemas/user";

export async function getUsers(): Promise<UserType[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching users:", error);
    return [];
  }
  return data as UserType[];
}

export async function getUserById(userId: string): Promise<UserType | null> {
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
  return user as UserType;
}
