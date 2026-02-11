"use server";

import { createClient } from "@/utils/supabase/server";

export async function getCurrentUserId() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("Error fetching current user", error);
    return null;
  }
  return user.id;
}
