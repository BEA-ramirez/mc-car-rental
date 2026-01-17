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
